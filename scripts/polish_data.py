import pandas as pd
import numpy as np

def polish_bikes():
    print("Polishing Bikes Dataset...")
    df = pd.read_csv('dataset/bikes dataset.csv')
    
    # 1. Fix the 100M BMW S1000RR typo (replace with 10M)
    df.loc[(df['make'] == 'BMW') & (df['model'] == 'S1000RR') & (df['price'] > 50000000), 'price'] = 10000000
    
    # 2. Fix 0 engine capacity for heavy bikes
    df.loc[(df['make'] == 'Honda') & (df['model'] == 'CBR 1000RR') & (df['engine_capacity'] == 0), 'engine_capacity'] = 1000
    df.loc[(df['make'] == 'BMW') & (df['model'] == 'S1000RR') & (df['engine_capacity'] == 0), 'engine_capacity'] = 1000
    df.loc[(df['make'] == 'Suzuki') & (df['model'] == 'GSX-R1000') & (df['engine_capacity'] == 0), 'engine_capacity'] = 1000
    df.loc[(df['make'] == 'Suzuki') & (df['model'] == 'Hayabusa') & (df['engine_capacity'] == 0), 'engine_capacity'] = 1300
    df.loc[(df['make'] == 'Yamaha') & (df['model'] == 'R1') & (df['engine_capacity'] == 0), 'engine_capacity'] = 1000
    # 3. Handle Chinese Replicas and missing zeros for heavy bikes
    # A real 1000cc+ superbike (like S1000RR, R1, Hayabusa, CBR1000RR) cannot be less than 20 Lac (2,000,000)
    # If the price is between 100,000 and 1,500,000 for a newer 1000cc bike, it's either a replica or missing a zero.
    # We will safely remove rows where engine_capacity >= 1000 and price < 1500000 (15 Lac) to prevent the model from thinking S1000RRs are cheap.
    df = df[~((df['engine_capacity'] >= 1000) & (df['price'] < 1500000))]
    
    # 4. Handle 600cc bikes that are suspiciously cheap (< 8 Lac)
    df = df[~((df['engine_capacity'] >= 600) & (df['price'] < 800000))]
    
    # Drop completely bogus prices
    df = df[df['price'] > 5000] # less than 5000 PKR for a whole bike is fake
    
    df.to_csv('dataset/bikes dataset.csv', index=False)
    print(f"Bikes dataset polished. {len(df)} rows remain.")

def polish_house_rent():
    print("Polishing House Rent Dataset...")
    df = pd.read_csv('dataset/house rent dataset.csv')
    
    # 1. Drop impossible rent prices (fake low values and 'buy' prices entered as rent)
    # Reasonable rent in Pakistan: 10,000 to maybe 3,000,000 (30 Lakh) a month.
    # Anything above 5,000,000 is definitely a sale price.
    df = df[(df['price'] >= 5000) & (df['price'] <= 5000000)]
    
    # 2. Check for impossible areas (0 or negative)
    df = df[df['area'] > 0]
    
    df.to_csv('dataset/house rent dataset.csv', index=False)
    print(f"House rent dataset polished. {len(df)} rows remain.")

def polish_others():
    # Quick sanity check for cars and house buy
    df_car = pd.read_csv('dataset/cars dataset.csv')
    df_car = df_car[(df_car['price'] > 50000) & (df_car['price'] < 200000000)] # Cars 50k to 20 Crore
    df_car.to_csv('dataset/cars dataset.csv', index=False)
    
    df_buy = pd.read_csv('dataset/house buy dataset.csv')
    df_buy = df_buy[(df_buy['price'] > 100000) & (df_buy['price'] < 5000000000)] # Houses 1 Lakh to 500 Crore
    df_buy.to_csv('dataset/house buy dataset.csv', index=False)
    print("Cars and House Buy sanity checked.")

if __name__ == "__main__":
    polish_bikes()
    polish_house_rent()
    polish_others()
