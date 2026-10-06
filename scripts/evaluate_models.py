import pandas as pd
import os
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_absolute_error
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer, TransformedTargetRegressor
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
import numpy as np
import warnings
warnings.filterwarnings('ignore')

CURRENT_SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_SCRIPT_DIR)
DATA_DIR = os.path.join(PROJECT_ROOT, 'dataset')

def evaluate_model(dataset_name, filename, target_col, cat_cols, num_cols):
    print(f"\n[{dataset_name.upper()}] Evaluating...", flush=True)
    file_path = os.path.join(DATA_DIR, filename)
    
    if not os.path.exists(file_path):
        print(f"   -> ERROR: Could not find dataset {file_path}")
        return

    df = pd.read_csv(file_path)
    df.columns = df.columns.str.strip().str.lower()
    target_col = target_col.lower()
    cat_cols = [c.lower() for c in cat_cols]
    num_cols = [c.lower() for c in num_cols]

    if df[target_col].dtype == 'object':
        df[target_col] = df[target_col].astype(str).str.replace(',', '').astype(float)
    df = df.dropna(subset=[target_col])
    
    for col in num_cols:
        if col in df.columns and df[col].dtype == 'object':
             df[col] = pd.to_numeric(df[col], errors='coerce')
             
    X = df[cat_cols + num_cols]
    y = df[target_col]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    numerical_transformer = SimpleImputer(strategy='median')
    categorical_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='most_frequent')),
        ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=True)) 
    ])
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numerical_transformer, num_cols),
            ('cat', categorical_transformer, cat_cols)
        ])
        
    rf_model = RandomForestRegressor(
        n_estimators=100,       
        max_depth=None,           
        min_samples_split=2,   
        random_state=42, 
        n_jobs=-1,              
        verbose=0
    )
    
    log_target_rf = TransformedTargetRegressor(
        regressor=rf_model,
        func=np.log1p,
        inverse_func=np.expm1
    )

    model = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('regressor', log_target_rf)
    ])
    
    print(f"   -> Training (in-memory) & Predicting on {len(X_test)} rows...", flush=True)
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    
    r2 = r2_score(y_test, y_pred)
    mae = mean_absolute_error(y_test, y_pred)
    
    print(f"   -> R^2 Score (Accuracy approx.): {r2:.4f} ({r2*100:.2f}%)")
    print(f"   -> Mean Absolute Error (MAE): {mae:,.2f} PKR")

if __name__ == "__main__":
    evaluate_model(
        dataset_name="car",
        filename="cars dataset.csv",
        target_col="price",
        cat_cols=["make", "model", "city", "fuel_type", "transmission", "registered", "color", "assembly"],
        num_cols=["year", "mileage", "engine_capacity"]
    )
    evaluate_model(
        dataset_name="bike",
        filename="bikes dataset.csv",
        target_col="price",
        cat_cols=["make", "model", "city"],
        num_cols=["year", "mileage", "engine_capacity"]
    )
    evaluate_model(
        dataset_name="house_buy",
        filename="house buy dataset.csv",
        target_col="price",
        cat_cols=["city", "location"],
        num_cols=["area", "bedrooms", "baths"]
    )
    evaluate_model(
        dataset_name="house_rent",
        filename="house rent dataset.csv",
        target_col="price",
        cat_cols=["city", "location"],
        num_cols=["area", "bedrooms", "baths"]
    )
