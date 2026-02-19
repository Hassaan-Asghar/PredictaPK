import pandas as pd
import joblib
import json
import os
import shap
import numpy as np
import scipy.sparse
import time
import threading
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
MODELS_DIR = os.path.join(PROJECT_ROOT, 'models')
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
models = {}
features_options = {}
explainers: Dict[str, Any] = {}
@app.on_event("startup")
def load_artifacts():
    print(f"Loading models from: {MODELS_DIR}")
    model_names = ["car", "bike", "house_buy", "house_rent"]
    for name in model_names:
        model_path = os.path.join(MODELS_DIR, f"model_{name}.pkl")
        if os.path.exists(model_path):
            models[name] = joblib.load(model_path)
            print(f" -> Loaded {name} model")
        else:
            print(f" -> WARNING: Model {name} not found")
        json_path = os.path.join(MODELS_DIR, f"features_{name}.json")
        if os.path.exists(json_path):
            with open(json_path, 'r') as f:
                features_options[name] = json.load(f)
            print(f" -> Loaded {name} options")
    def warmup_explainers():
        print("Starting background SHAP explainer warmup...")
        for name, model in models.items():
            try:
                if hasattr(model, 'named_steps') and 'regressor' in model.named_steps:
                    regressor = model.named_steps['regressor']
                    print(f"Initializing Explainer for {name}...")
                    explainers[name] = shap.TreeExplainer(regressor)
            except Exception as e:
                print(f"Failed to warmup explainer for {name}: {e}")
        print("SHAP warmup complete.")
    threading.Thread(target=warmup_explainers, daemon=True).start()
class PredictionInput(BaseModel):
    service_type: str 
    data: Dict[str, Any]
def get_price_trends(model, base_df, service_name):
    """
    Generates a trend of predictions by varying the 'year' feature.
    For Real Estate (where 'year' is not a feature), uses a synthetic inflation rate.
    """
    try:
        trends = []
        
        # synthetic trends for real estate (since dataset has no year)
        if service_name in ['house_buy', 'house_rent']:
            current_year = 2024 # Default base if year not present
            if 'year' in base_df.columns:
                current_year = int(base_df['year'].iloc[0])
            
            # Annual growth rates (approximate for Pakistan market)
            rate = 0.10 if service_name == 'house_buy' else 0.07 
            
            print(f"Generating synthetic trends for {service_name} with rate {rate}")
            
            base_pred = model.predict(base_df)[0]
            year_range = range(current_year - 4, current_year + 2)
            
            for y in year_range:
                # Formula: Price * (1 + rate)^(year - current_year)
                # If year is in past, exponent is negative, price is lower.
                # If year is future, exponent is positive, price is higher.
                factor = (1 + rate) ** (y - current_year)
                adjusted_price = base_pred * factor
                trends.append({"year": y, "price": round(adjusted_price, 2)})
            
            return trends

        # Standard ML-based trends for Cars/Bikes (where year IS a feature)
        if 'year' not in base_df.columns:
            return []
        
        current_year = int(base_df['year'].iloc[0])
        print(f"Calculating trends for {service_name}, base year: {current_year}")
        year_range = range(current_year - 4, current_year + 2)
        
        for y in year_range:
            temp_df = base_df.copy()
            temp_df['year'] = y
            # Clean data again just in case (though it's already clean)
            try:
                pred = model.predict(temp_df)[0]
                trends.append({"year": y, "price": round(pred, 2)})
            except Exception as e_inner:
                print(f"Trend prediction failed for year {y}: {e_inner}")
                continue
                
        return trends
    except Exception as e:
        print(f"Trend calculation failed: {e}")
        return []

def get_shap_explanation(model_pipeline, input_df, service_name=None):
    """
    Calculates SHAP values safely with caching and sparse matrix support.
    """
    try:
        preprocessor = model_pipeline.named_steps['preprocessor']
        regressor = model_pipeline.named_steps['regressor']
        X_transformed = preprocessor.transform(input_df)
        if scipy.sparse.issparse(X_transformed):
            X_transformed = X_transformed.toarray()
        global explainers
        if service_name and service_name in explainers:
            explainer = explainers[service_name]
        else:
            print(f"Initializing SHAP Explainer dynamically for {service_name}...")
            explainer = shap.TreeExplainer(regressor)
            if service_name:
                explainers[service_name] = explainer
        t0 = time.time()
        shap_values = explainer.shap_values(X_transformed, check_additivity=False)
        print(f"SHAP calculation for {service_name} took {time.time()-t0:.4f}s")
        feature_names = []
        if 'num' in preprocessor.named_transformers_:
            feature_names.extend(preprocessor.named_transformers_['num'].feature_names_in_)
        if 'cat' in preprocessor.named_transformers_:
            cat_transformer = preprocessor.named_transformers_['cat']
            ohe = cat_transformer.named_steps['onehot']
            feature_names.extend(ohe.get_feature_names_out())
        vals = shap_values[0] if isinstance(shap_values, list) else shap_values
        if len(vals.shape) > 1:
            vals = vals[0]
        input_vals = X_transformed[0]
        explanation = list(zip(feature_names, vals, input_vals))
        explanation.sort(key=lambda x: abs(x[1]), reverse=True)
        formatted_result = []
        for name, val, input_val in explanation[:8]: 
            clean_name = name
            prefixes_to_remove = ["x0_", "x1_", "x2_", "x3_", "x4_", "x5_", "x6_", "x7_", "x8_", "cat__", "num__"]
            for prefix in prefixes_to_remove:
                if clean_name.startswith(prefix):
                    clean_name = clean_name.replace(prefix, "", 1)
            clean_name = clean_name.replace("_", " ").title()
            formatted_result.append({
                "name": clean_name, 
                "value": round(val, 2),
                "active": float(input_val) != 0 
            })
        return formatted_result
    except Exception as e:
        print(f"XAI Error in calculation: {e}")
        return []
@app.get("/")
def home():
    return {"message": "Antigravity Predictive API is Running"}
@app.get("/api/options/{service_type}")
def get_options(service_type: str):
    if service_type not in features_options:
        raise HTTPException(status_code=404, detail="Service type not found")
    return features_options[service_type]
@app.post("/api/predict")
def predict(input_data: PredictionInput):
    service = input_data.service_type
    if service not in models:
        raise HTTPException(status_code=404, detail="Model not found")
    df = pd.DataFrame([input_data.data])
    df.columns = df.columns.str.lower()
    numeric_cols = ['year', 'mileage', 'engine_capacity', 'area', 'bedrooms', 'baths']
    for col in df.columns:
        if col in numeric_cols and df[col].dtype == 'object':
            try:
                clean_col = df[col].astype(str).str.replace(r'[^\d.]', '', regex=True)
                df[col] = pd.to_numeric(clean_col, errors='coerce').fillna(0)
            except Exception as e:
                print(f"Could not clean column {col}: {e}")
    model = models[service]
    try:
        prediction_value = model.predict(df)[0]
        xai_data = get_shap_explanation(model, df, service_name=service)
        return {
            "prediction": round(prediction_value, 2),
            "currency": "PKR",
            "explanation": xai_data,
            "trends": get_price_trends(model, df, service)
        }
    except Exception as e:
        print(f"Prediction Error: {e}")
        raise HTTPException(status_code=400, detail=f"Prediction failed: {str(e)}")
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)