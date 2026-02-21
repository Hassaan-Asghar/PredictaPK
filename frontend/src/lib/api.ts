import axios from 'axios';
const API_BASE_URL = 'http://localhost:8000/api';
export interface ShapValue {
    name: string;
    value: number;
    active: boolean;
}
export interface PredictionResult {
    price: number;
    explanation: ShapValue[];
}
export const fetchOptions = async () => {
    try {
        const [car, bike, houseBuy, houseRent] = await Promise.all([
            axios.get(`${API_BASE_URL}/options/car`),
            axios.get(`${API_BASE_URL}/options/bike`),
            axios.get(`${API_BASE_URL}/options/house_buy`),
            axios.get(`${API_BASE_URL}/options/house_rent`)
        ]);
        const propertyTree = { ...(houseBuy.data.city_location_tree || {}) };
        const rentTree = houseRent.data.city_location_tree || {};
        Object.entries(rentTree).forEach(([city, areas]) => {
            if (propertyTree[city]) {
                propertyTree[city] = Array.from(new Set([...propertyTree[city], ...(areas as string[])])).sort();
            } else {
                propertyTree[city] = areas;
            }
        });
        const uniqueAreas = Array.from(new Set([
            ...(houseBuy.data.location || []),
            ...(houseRent.data.location || [])
        ])).sort();
        const uniqueCities = Array.from(new Set([
            ...(houseBuy.data.city || []),
            ...(houseRent.data.city || [])
        ])).sort();
        return {
            cars: car.data.make_model_tree,
            bikes: bike.data.make_model_tree,
            locations: {
                car: car.data.city,
                bike: bike.data.city,
                property: uniqueCities
            },
            property_tree: propertyTree,
            car_location_tree: car.data.city_location_tree,
            property_areas: uniqueAreas,
            car_options: {
                registered: car.data.registered || [],
                colors: car.data.color || [],
                assembly: car.data.assembly || [],
                engine_capacity: car.data.engine_capacity || []
            }
        };
    } catch (error) {
        console.error("Error fetching options:", error);
        return { cars: {}, bikes: {}, locations: {} };
    }
};
export const predictCar = async (data: any): Promise<PredictionResult> => {
    const backendData = {
        make: data.Make,
        model: data.CarModel,
        year: Number(data.Year),
        mileage: Number(data.Mileage),
        engine_capacity: Number(data.EngineCapacity),
        fuel_type: data.FuelType,
        transmission: data.Transmission,
        registered: data.RegisteredIn,
        color: data.Color,
        assembly: data.Assembly,
        city: data.Location
    };
    const response = await axios.post(`${API_BASE_URL}/predict`, {
        service_type: 'car',
        data: backendData
    });
    return {
        price: response.data.prediction,
        explanation: response.data.explanation
    };
};
export const predictBike = async (data: any): Promise<PredictionResult> => {
    const backendData = {
        make: data.Make,
        model: data.BikeName,
        year: Number(data.Year),
        mileage: Number(data.Mileage),
        engine_capacity: Number(data.EngineCapacity.toString().replace(' cc', '')),
        city: data.City
    };
    const response = await axios.post(`${API_BASE_URL}/predict`, {
        service_type: 'bike',
        data: backendData
    });
    return {
        price: response.data.prediction,
        explanation: response.data.explanation
    };
};
export const predictProperty = async (data: any, type: 'buy' | 'rent'): Promise<PredictionResult> => {
    const serviceType = type === 'buy' ? 'house_buy' : 'house_rent';
    const backendData = {
        city: data.City,
        location: data.Location,
        type: data.Type,
        area: Number(data.Area),
        bedrooms: Number(data.Bedrooms),
        baths: Number(data.Bathrooms)
    };
    const response = await axios.post(`${API_BASE_URL}/predict`, {
        service_type: serviceType,
        data: backendData
    });
    return {
        price: response.data.prediction,
        explanation: response.data.explanation
    };
};

export const getRecommendations = async (category: string, budget: number, filters: any = {}) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/recommend`, {
            service_type: category,
            budget: budget,
            filters: filters
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching recommendations:", error);
        return [];
    }
};
