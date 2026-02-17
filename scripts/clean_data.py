import pandas as pd
import os
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
DATA_DIR = os.path.join(PROJECT_ROOT, 'data')
def clean_city(city_str):
    if not isinstance(city_str, str): 
        return city_str
    if ',' in city_str:
        city_str = city_str.split(',')[-1]
    city_str = city_str.strip()
    suffixes_to_remove = [' Punjab', ' Sindh', ' KPK', ' Balochistan', ' Islamabad', ' Azad Kashmir', ' Federal Capital']
    for suffix in suffixes_to_remove:
        if city_str.endswith(suffix):
            city_str = city_str[:-len(suffix)].strip()
    if city_str == 'Islamabad Islamabad':
        city_str = 'Islamabad'
    return city_str
def clean_color(color_str):
    if not isinstance(color_str, str): 
        return 'Unlisted'
    color_str = color_str.lower().strip()
    if color_str.startswith('{') or '=>' in color_str:
        return 'Unlisted'
    base_colors = [
        'white', 'black', 'silver', 'grey', 'gray', 'blue', 'red', 
        'green', 'gold', 'beige', 'brown', 'maroon', 'burgundy', 
        'yellow', 'orange', 'purple', 'pink', 'bronze'
    ]
    for bc in base_colors:
        if bc in color_str:
            if bc == 'gray': return 'Grey' 
            return bc.capitalize()
    return color_str.title()
if __name__ == "__main__":
    print("Starting data cleanup...")
    car_path = os.path.join(DATA_DIR, 'cars dataset.csv')
    if os.path.exists(car_path):
        print(f"Reading {car_path}...")
        df_car = pd.read_csv(car_path)
        if 'city' in df_car.columns:
            df_car['city'] = df_car['city'].apply(clean_city)
        if 'color' in df_car.columns:
            df_car['color'] = df_car['color'].apply(clean_color)
            df_car = df_car[df_car['color'] != 'Unlisted']
        df_car.to_csv(car_path, index=False)
        print("Successfully cleaned Cars Dataset!")
    else:
        print("Could not find cars dataset.csv")
    bike_path = os.path.join(DATA_DIR, 'bikes dataset.csv')
    if os.path.exists(bike_path):
        print(f"Reading {bike_path}...")
        df_bike = pd.read_csv(bike_path)
        if 'city' in df_bike.columns:
            df_bike['city'] = df_bike['city'].apply(clean_city)
        df_bike.to_csv(bike_path, index=False)
        print("Successfully cleaned Bikes Dataset!")