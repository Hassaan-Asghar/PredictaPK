import requests
import json

url = "http://localhost:8000/api/predict"

payload = {
    "service_type": "house_buy",
    "data": {
        "city": "Lahore",
        "location": "DHA Phase 6",
        "area": 2250,
        "bedrooms": 4,
        "baths": 5,
        "year": 2026
    }
}

try:
    response = requests.post(url, json=payload)
    if response.status_code == 200:
        data = response.json()
        print("Prediction:", data.get("prediction"))
        trends = data.get("trends")
        print("Trends:", trends)
        if trends and len(trends) > 0:
            print("SUCCESS: Trends found.")
        else:
            print("FAILURE: Trends missing or empty.")
    else:
        print("Error:", response.status_code, response.text)
except Exception as e:
    print("Request Failed:", e)
