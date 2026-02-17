import pandas as pd
import joblib
import json
import os
import time
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
CURRENT_SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_SCRIPT_DIR)
DATA_DIR = os.path.join(PROJECT_ROOT, 'data')
ARTIFACTS_DIR = os.path.join(PROJECT_ROOT, 'models')
os.makedirs(ARTIFACTS_DIR, exist_ok=True)
def train_and_save(dataset_name, filename, target_col, cat_cols, num_cols):
    print(f"\n[{dataset_name.upper()}] Starting process...")
    file_path = os.path.join(DATA_DIR, filename)
    print(f"   -> Reading file: {file_path}") 
    start_time = time.time()
    try:
        df = pd.read_csv(file_path)
        print(f"   -> Loaded {len(df)} rows in {time.time() - start_time:.2f} seconds.")
    except FileNotFoundError:
        print(f"   -> ERROR: Could not find {filename} in {DATA_DIR}")
        return
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
    missing_cat = [c for c in cat_cols if c not in df.columns]
    missing_num = [c for c in num_cols if c not in df.columns]
    if missing_cat or missing_num:
        print(f"   -> SKIPPING {dataset_name}: Missing columns {missing_cat + missing_num}")
        return
    X = df[cat_cols + num_cols]
    y = df[target_col]
    print("   -> Generating Frontend Options JSON...")
    frontend_options = {}
    if 'make' in df.columns and 'model' in df.columns:
        nested_options = {}
        makes = sorted(df['make'].dropna().astype(str).unique().tolist())
        for make in makes:
            models = sorted(df[df['make'] == make]['model'].dropna().astype(str).unique().tolist())
            nested_options[make] = models
        frontend_options['make_model_tree'] = nested_options
    if 'city' in df.columns and 'location' in df.columns:
        city_location_tree = {}
        for _, row in df.iterrows():
            city = str(row['city']).strip()
            location = str(row['location']).strip()
            if city.lower() == 'nan' or location.lower() == 'nan' or not city or not location: 
                continue
            if city not in city_location_tree:
                city_location_tree[city] = set()
            city_location_tree[city].add(location)
        frontend_options['city_location_tree'] = {
            city: sorted(list(locations)) 
            for city, locations in city_location_tree.items()
        }
    for col in cat_cols:
        col = col.lower()
        if col in df.columns and col not in frontend_options:
            unique_vals = sorted(df[col].dropna().astype(str).unique().tolist())
            frontend_options[col] = unique_vals
    if 'engine_capacity' in df.columns:
        try:
            caps = sorted(df['engine_capacity'].dropna().astype(int).unique().tolist())
            frontend_options['engine_capacity'] = [str(c) for c in caps]
        except Exception:
            pass
    features_path = os.path.join(ARTIFACTS_DIR, f"features_{dataset_name}.json")
    with open(features_path, 'w') as f:
        json.dump(frontend_options, f)
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
    model = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('regressor', RandomForestRegressor(
            n_estimators=100,       
            max_depth=25,           
            min_samples_split=10,   
            random_state=42, 
            n_jobs=-1,              
            verbose=1
        ))
    ])
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    print(f"   -> Training highly accurate AI Model on {len(X_train)} rows...")
    model.fit(X_train, y_train)
    model_path = os.path.join(ARTIFACTS_DIR, f"model_{dataset_name}.pkl")
    joblib.dump(model, model_path)
    print(f"   -> FINISHED {dataset_name} (Saved to {model_path})\n")
if __name__ == "__main__":
    train_and_save(
        dataset_name="car",
        filename="cars dataset.csv",
        target_col="price",
        cat_cols=["make", "model", "city", "fuel_type", "transmission", "registered", "color", "assembly"],
        num_cols=["year", "mileage", "engine_capacity"]
    )
    train_and_save(
        dataset_name="bike",
        filename="bikes dataset.csv",
        target_col="price",
        cat_cols=["make", "model", "city"],
        num_cols=["year", "mileage", "engine_capacity"]
    )
    train_and_save(
        dataset_name="house_buy",
        filename="house buy dataset.csv",
        target_col="price",
        cat_cols=["city", "location"],
        num_cols=["area", "bedrooms", "baths"]
    )
    train_and_save(
        dataset_name="house_rent",
        filename="house rent dataset.csv",
        target_col="price",
        cat_cols=["city", "location"],
        num_cols=["area", "bedrooms", "baths"]
    )