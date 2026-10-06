import pandas as pd
import joblib
import json
import os
import re
try:
    import shap
    SHAP_AVAILABLE = True
except ImportError:
    SHAP_AVAILABLE = False
    print("WARNING: SHAP module not found, XAI features disabled.")
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
datasets: Dict[str, pd.DataFrame] = {}
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
    print("Loading datasets for recommendations...")
    dataset_files = {
        "car": "cars dataset.csv",
        "bike": "bikes dataset.csv",
        "house_buy": "house buy dataset.csv",
        "house_rent": "house rent dataset.csv"
    }
    dataset_dir = os.path.join(PROJECT_ROOT, 'dataset')
    for svc, filename in dataset_files.items():
        file_path = os.path.join(dataset_dir, filename)
        if os.path.exists(file_path):
            try:
                datasets[svc] = pd.read_csv(file_path)
                print(f" -> Loaded {filename} ({len(datasets[svc])} rows)")
            except Exception as e:
                print(f" -> Failed to load {filename}: {e}")
        else:
            print(f" -> WARNING: Dataset {filename} not found")
    def warmup_explainers():
        if not SHAP_AVAILABLE:
            return
        print("Starting background SHAP explainer warmup...")
        for name, model in models.items():
            try:
                if hasattr(model, 'named_steps') and 'regressor' in model.named_steps:
                    regressor = model.named_steps['regressor']
                    actual_rf = regressor.regressor_ if hasattr(regressor, 'regressor_') else regressor
                    print(f"Initializing Explainer for {name}...")
                    explainers[name] = shap.TreeExplainer(actual_rf)
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
        if service_name in ['house_buy', 'house_rent']:
            current_year = 2024 
            if 'year' in base_df.columns:
                current_year = int(base_df['year'].iloc[0])
            rate = 0.10 if service_name == 'house_buy' else 0.07 
            print(f"Generating synthetic trends for {service_name} with rate {rate}")
            base_pred = model.predict(base_df)[0]
            year_range = range(current_year - 4, current_year + 2)
            for y in year_range:
                factor = (1 + rate) ** (y - current_year)
                adjusted_price = base_pred * factor
                trends.append({"year": y, "price": round(adjusted_price, 2)})
            return trends
        if 'year' not in base_df.columns:
            return []
        current_year = int(base_df['year'].iloc[0])
        print(f"Calculating trends for {service_name}, base year: {current_year}")
        year_range = range(current_year - 4, current_year + 2)
        for y in year_range:
            temp_df = base_df.copy()
            temp_df['year'] = y
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
    if not SHAP_AVAILABLE:
        return []
    try:
        preprocessor = model_pipeline.named_steps['preprocessor']
        regressor = model_pipeline.named_steps['regressor']
        if hasattr(regressor, 'regressor_'):
            actual_rf = regressor.regressor_
        else:
            actual_rf = regressor
        X_transformed = preprocessor.transform(input_df)
        if scipy.sparse.issparse(X_transformed):
            X_transformed = X_transformed.toarray()
        global explainers
        if service_name and service_name in explainers:
            explainer = explainers[service_name]
        else:
            print(f"Initializing SHAP Explainer dynamically for {service_name}...")
            explainer = shap.TreeExplainer(actual_rf)
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
class RecommendationInput(BaseModel):
    service_type: str
    budget: float
    filters: Optional[Dict[str, Any]] = None
@app.post("/api/recommend")
def recommend(input_data: RecommendationInput):
    service = input_data.service_type
    if service not in datasets:
        raise HTTPException(status_code=404, detail="Dataset not available for this service")
    
    df_raw = datasets[service].copy()
    
    # --- Data Sanity Filters to handle dataset anomalies ---
    if 'year' in df_raw.columns:
        # Filter out clearly bogus data points: very old standard bikes/cars with very high prices
        if service == 'bike':
            # e.g., A 1983 Honda CD 70 for 200k+ is almost certainly bad data
            df_raw = df_raw[~((df_raw['year'] < 2010) & (df_raw['price'] > 100000))]
            df_raw = df_raw[df_raw['year'] >= 1990] # Ignore completely vintage/broken year rows for recommendations
        elif service == 'car':
            df_raw = df_raw[df_raw['year'] >= 1980]

    budget = input_data.budget
    filters = input_data.filters or {}
    
    def normalize_str(val):
        return re.sub(r'[^a-z0-9]', '', str(val).lower())
        
    def normalize_series(series):
        return series.astype(str).str.lower().str.replace(r'[^a-z0-9]', '', regex=True)

    def apply_filters(base_df):
        filtered = base_df.copy()
        for key, val in filters.items():
            if val is None or pd.isna(val) or str(val).strip() == "":
                continue
            key = key.lower()
            if key in filtered.columns:
                if filtered[key].dtype == 'object':
                    val_norm = normalize_str(val)
                    clean_series = normalize_series(filtered[key])
                    filtered = filtered[clean_series.str.contains(val_norm, regex=False, na=False)]
                elif pd.api.types.is_numeric_dtype(filtered[key]) and isinstance(val, (int, float)):
                    if key in ['area', 'engine_capacity']:
                        # Give a +/- 20% tolerance on area/engines so 10 Marla doesn't return 20 Marla
                        margin = val * 0.20
                        filtered = filtered[(filtered[key] >= (val - margin)) & (filtered[key] <= (val + margin))]
                    else:
                        filtered = filtered[filtered[key] >= val]
        return filtered

    # 1. Budget upper bound (15% flex above budget). We allow any cheaper price.
    max_price_15 = budget * 1.15
    df_budget_15 = df_raw[df_raw['price'] <= max_price_15]
    df = apply_filters(df_budget_15)

    if df.empty:
        print("Fallback 1: Original filters, increase upper margin to 30%")
        max_price_30 = budget * 1.30
        df_budget_30 = df_raw[df_raw['price'] <= max_price_30]
        df = apply_filters(df_budget_30)

    if df.empty:
        print("Fallback 2: Original filters, increase upper margin to 50%")
        max_price_50 = budget * 1.50
        df_budget_50 = df_raw[df_raw['price'] <= max_price_50]
        df = apply_filters(df_budget_50)

    if df.empty:
        print("No matching items found with the specified filters even with 50% extra max margin.")
        return []

    # Calculate diff and pick top 5 closest to budget
    df = df.copy()
    
    # Drop near-identical duplicates so we don't return 5 identical cards
    if service in ['car', 'bike'] and 'year' in df.columns:
        subset_cols = [c for c in ['make', 'model', 'city', 'year', 'price'] if c in df.columns]
        df = df.drop_duplicates(subset=subset_cols)
    else:
        subset_cols = [c for c in ['city', 'location', 'type', 'area', 'price'] if c in df.columns]
        df = df.drop_duplicates(subset=subset_cols)
        
    df['diff'] = abs(df['price'] - budget)
    df = df.sort_values(by='diff').head(5)
    
    results = []
    for _, row in df.iterrows():
        if service == 'car':
            name = f"{row.get('make', '')} {row.get('model', '')}".strip()
            specs = {
                'Engine': f"{row.get('engine_capacity', '')} cc",
                'Transmission': row.get('transmission', ''),
                'Mileage': f"{row.get('mileage', '')} km",
                'Assembly': row.get('assembly', '')
            }
        elif service == 'bike':
            name = f"{row.get('make', '')} {row.get('model', '')}".strip()
            specs = {
                'Engine': f"{row.get('engine_capacity', '')} cc",
                'Mileage': f"{row.get('mileage', '')} km"
            }
        else: 
            name = f"{row.get('type', 'Property').title()} in {row.get('location', '')}".strip()
            specs = {
                'Area': f"{row.get('area', '')} sq ft",
                'Bedrooms': row.get('bedrooms', ''),
                'Baths': row.get('baths', '')
            }
        
        result = {
            "name": name,
            "price": float(row['price']),
            "year": int(row['year']) if 'year' in row and not pd.isna(row['year']) else None,
            "location": row.get('city', ''),
            "specs": {k: v for k, v in specs.items() if v and str(v).strip() not in ['', 'nan', 'nan cc', 'nan km', 'nan sq ft']}
        }
        results.append(result)
        
    return results
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)