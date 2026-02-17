import pandas as pd
import json
import os
CURRENT_SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_SCRIPT_DIR)
DATA_DIR = os.path.join(PROJECT_ROOT, 'data')
ARTIFACTS_DIR = os.path.join(PROJECT_ROOT, 'models')
os.makedirs(ARTIFACTS_DIR, exist_ok=True)
def generate_json_only(dataset_name, filename, target_col, cat_cols, num_cols):
    print(f"\n[{dataset_name.upper()}] Generating Options...")
    file_path = os.path.join(DATA_DIR, filename)
    try:
        df = pd.read_csv(file_path)
    except FileNotFoundError:
        print(f"   -> ERROR: Could not find {filename}")
        return
    df.columns = df.columns.str.strip().str.lower()
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
        except Exception as e:
            pass 
    features_path = os.path.join(ARTIFACTS_DIR, f"features_{dataset_name}.json")
    with open(features_path, 'w') as f:
        json.dump(frontend_options, f)
    print(f"   -> Saved options to {features_path}")
if __name__ == "__main__":
    generate_json_only(
        dataset_name="car",
        filename="cars dataset.csv",
        target_col="price",
        cat_cols=["make", "model", "city", "fuel_type", "transmission", "registered", "color", "assembly"],
        num_cols=["year", "mileage", "engine_capacity"]
    )
    generate_json_only(
        dataset_name="bike",
        filename="bikes dataset.csv",
        target_col="price",
        cat_cols=["make", "model", "city"],
        num_cols=["year", "mileage", "engine_capacity"]
    )
    generate_json_only(
        dataset_name="house_buy",
        filename="house buy dataset.csv",
        target_col="price",
        cat_cols=["city", "location"],
        num_cols=["area", "bedrooms", "baths"]
    )
    generate_json_only(
        dataset_name="house_rent",
        filename="house rent dataset.csv",
        target_col="price",
        cat_cols=["city", "location"],
        num_cols=["area", "bedrooms", "baths"]
    )