import json
import os
def update_features():
    path = 'models/features_car.json'
    print(f"Loading {path}...")
    with open(path, 'r') as f:
        data = json.load(f)
    cities_raw = data.get('city', [])
    tree = {}
    print(f"Processing {len(cities_raw)} cities...")
    for full_string in cities_raw:
        if ',' in full_string:
            parts = full_string.split(',')
            city_name = parts[-1].strip()
            loc_label = ",".join(parts[:-1]).strip()
            suffixes = [" Punjab", " Sindh", " KPK", " Balochistan", " Islamabad", " Azad Kashmir", " Northern Areas"]
            for suffix in suffixes:
                if city_name.endswith(suffix):
                    city_name = city_name[:-len(suffix)]
                    break
            if city_name not in tree:
                tree[city_name] = []
            tree[city_name].append({
                "label": loc_label,
                "value": full_string
            })
        else:
            city_name = full_string.strip()
            suffixes = [" Punjab", " Sindh", " KPK", " Balochistan", " Islamabad", " Azad Kashmir", " Northern Areas"]
            for suffix in suffixes:
                if city_name.endswith(suffix):
                    city_name = city_name[:-len(suffix)]
                    break
            if city_name not in tree:
                tree[city_name] = []
            tree[city_name].append({
                "label": "Main / General",
                "value": full_string
            })
    sorted_tree = {k: sorted(tree[k], key=lambda x: x['label']) for k in sorted(tree.keys())}
    data['city_location_tree'] = sorted_tree
    print(f"Saving updated JSON with {len(sorted_tree)} cities in tree...")
    with open(path, 'w') as f:
        json.dump(data, f)
    print("Done!")
if __name__ == "__main__":
    update_features()
