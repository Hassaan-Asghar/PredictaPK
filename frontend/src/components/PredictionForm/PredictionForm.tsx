"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, AlertCircle, Car, Bike, Home, Building, TrendingUp, Clock, DollarSign } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import jsPDF from 'jspdf';

import ComparisonView from '../ComparisonView';
import CarInputs from './CarInputs';
import BikeInputs from './BikeInputs';
import PropertyInputs from './PropertyInputs';
import PredictionResult from './PredictionResult';
import MarketTrends from '../MarketTrends';
import RecommendationModal from './RecommendationModal';

interface PredictionFormProps {
    category: 'car' | 'bike' | 'buy' | 'rent';
}

const PredictionForm: React.FC<PredictionFormProps> = ({ category }) => {
    const [options, setOptions] = useState<any>({ raw_current: {} });
    const currentYear = new Date().getFullYear();
    const [formData, setFormData] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [comparisons, setComparisons] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [mode, setMode] = useState<'predict' | 'budget'>('predict');
    const [budgetResult, setBudgetResult] = useState<any[]>([]);
    const [selectedRecommendation, setSelectedRecommendation] = useState<any>(null);
    const [isComparisonOpen, setIsComparisonOpen] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    // Load comparisons and history from local storage
    useEffect(() => {
        const savedComparisons = localStorage.getItem('comparisons');
        if (savedComparisons) {
            try { setComparisons(JSON.parse(savedComparisons)); } catch (e) { console.error(e); }
        }
        const savedHistory = localStorage.getItem('predicta_history');
        if (savedHistory) {
            try { setHistory(JSON.parse(savedHistory)); } catch (e) { console.error(e); }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('comparisons', JSON.stringify(comparisons));
    }, [comparisons]);

    useEffect(() => {
        localStorage.setItem('predicta_history', JSON.stringify(history));
    }, [history]);

    const addToComparison = () => {
        if (result && formData) {
            const newItem = { formData: { ...formData }, prediction: result.prediction, explanation: result.explanation };
            const exists = comparisons.some(item =>
                item.prediction === newItem.prediction &&
                JSON.stringify(item.formData) === JSON.stringify(newItem.formData)
            );
            if (!exists) setComparisons(prev => [...prev, newItem]);
        }
    };

    const removeFromComparison = (index: number) => {
        setComparisons(prev => prev.filter((_, i) => i !== index));
    };

    const handleBudgetSearch = (e: React.FormEvent | React.MouseEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Low Budget Check
        const budget = Number(formData.MaxBudget);
        let minBudget = 0;
        if (category === 'car') minBudget = 500000;
        if (category === 'bike') minBudget = 20000;
        if (category === 'buy') minBudget = 1000000;
        if (category === 'rent') minBudget = 10000;

        if (budget > 0 && budget < minBudget) {
            setError(`Budget is too low for ${category === 'buy' ? 'property' : category}. Minimum recommended: PKR ${minBudget.toLocaleString()}`);
            setLoading(false);
            return;
        }

        setTimeout(() => {
            interface BudgetResult {
                name: string;
                price: number;
                year?: number;
                location?: string;
                specs?: { [key: string]: string | number }; // New field for detailed specs 
            }
            let results: BudgetResult[] = [];

            // Enhanced Mock Logic: Use form inputs to filter/suggest
            if (category === 'car') {
                const make = formData.Make || 'Toyota';
                const model = formData.Model;
                const city = formData.City || 'Lahore';

                // Base pool of cars
                let pool = [
                    { name: `Toyota Corolla Altis 1.6`, price: 4500000, year: 2019, location: city, specs: { 'Engine': '1600 cc', 'Transmission': 'Automatic', 'Mileage': '45,000 km', 'Assembly': 'Local' } },
                    { name: `Honda City 1.5 Aspire`, price: 4200000, year: 2020, location: city, specs: { 'Engine': '1500 cc', 'Transmission': 'Manual', 'Mileage': '30,000 km', 'Assembly': 'Local' } },
                    { name: `Suzuki Cultus VXL`, price: 3500000, year: 2022, location: city, specs: { 'Engine': '1000 cc', 'Transmission': 'AGS', 'Mileage': '20,000 km', 'Assembly': 'Local' } },
                    { name: `Honda Civic Oriel`, price: 6500000, year: 2020, location: city, specs: { 'Engine': '1800 cc', 'Transmission': 'Automatic', 'Mileage': '40,000 km', 'Assembly': 'Local' } },
                    { name: `Suzuki Alto VXR`, price: 2800000, year: 2023, location: city, specs: { 'Engine': '660 cc', 'Transmission': 'Stic', 'Mileage': '10,000 km', 'Assembly': 'Local' } },
                ];

                // If Model is selected, GENRATE variations of that specific model
                if (model) {
                    results = [
                        { name: `${make} ${model}`, price: budget * 0.95, year: 2022, location: city, specs: { 'Engine': 'Standard', 'Transmission': 'Automatic', 'Mileage': '25,000 km', 'Assembly': 'Local' } },
                        { name: `${make} ${model}`, price: budget * 0.85, year: 2020, location: city, specs: { 'Engine': 'Standard', 'Transmission': 'Automatic', 'Mileage': '55,000 km', 'Assembly': 'Local' } },
                        { name: `${make} ${model}`, price: budget * 0.75, year: 2018, location: city, specs: { 'Engine': 'Standard', 'Transmission': 'Manual', 'Mileage': '85,000 km', 'Assembly': 'Local' } },
                        { name: `${make} ${model}`, price: budget * 0.65, year: 2017, location: city, specs: { 'Engine': 'Standard', 'Transmission': 'Manual', 'Mileage': '100,000 km', 'Assembly': 'Local' } },
                        { name: `${make} ${model} (Good Condition)`, price: budget * 0.9, year: 2021, location: city, specs: { 'Engine': 'Standard', 'Transmission': 'Automatic', 'Mileage': '40,000 km', 'Assembly': 'Local' } },
                    ];
                }
                // Else if Make is selected, filter/generate for that Make
                else if (formData.Make) {
                    results = pool.filter(r => r.name.includes(formData.Make));
                    // Fill with generative data if pool is empty
                    if (results.length < 3) {
                        results.push(
                            { name: `${make} Sedan`, price: budget * 0.9, year: 2021, location: city, specs: { 'Transmission': 'Automatic', 'Mileage': '30,000 km' } },
                            { name: `${make} Hachback`, price: budget * 0.7, year: 2019, location: city, specs: { 'Transmission': 'Manual', 'Mileage': '60,000 km' } },
                            { name: `${make} SUV`, price: budget * 1.1, year: 2020, location: city, specs: { 'Transmission': 'Automatic', 'Mileage': '45,000 km' } }
                        );
                    }
                } else {
                    results = pool;
                }

            } else if (category === 'bike') {
                const make = formData.Make || 'Honda';
                const model = formData.Model;
                const city = formData.City || 'Lahore';

                if (model) {
                    results = [
                        { name: `${make} ${model}`, price: budget * 0.98, year: 2024, location: city, specs: { 'Start': 'Self Start', 'Mileage': '1,000 km', 'Condition': 'Like New' } },
                        { name: `${make} ${model}`, price: budget * 0.9, year: 2023, location: city, specs: { 'Start': 'Kick Start', 'Mileage': '15,000 km', 'Condition': 'Excellent' } },
                        { name: `${make} ${model}`, price: budget * 0.8, year: 2022, location: city, specs: { 'Start': 'Kick Start', 'Mileage': '25,000 km', 'Condition': 'Good' } },
                        { name: `${make} ${model}`, price: budget * 0.7, year: 2021, location: city, specs: { 'Start': 'Kick Start', 'Mileage': '40,000 km', 'Condition': 'Fair' } },
                        { name: `${make} ${model}`, price: budget * 0.6, year: 2020, location: city, specs: { 'Start': 'Kick Start', 'Mileage': '55,000 km', 'Condition': 'Used' } },
                    ];
                } else {
                    results = [
                        { name: `${make} CG 125`, price: budget * 0.9, year: 2023, location: city, specs: { 'Engine': '125 cc', 'Start': 'Kick Start', 'Mileage': '5,000 km' } },
                        { name: `${make} CD 70`, price: budget * 0.5, year: 2024, location: city, specs: { 'Engine': '70 cc', 'Start': 'Kick Start', 'Mileage': '2,000 km' } },
                        { name: `Yamaha YBR 125`, price: budget * 0.95, year: 2022, location: city, specs: { 'Engine': '125 cc', 'Start': 'Self Start', 'Mileage': '12,000 km' } },
                        { name: `Suzuki GS 150`, price: budget * 0.85, year: 2021, location: city, specs: { 'Engine': '150 cc', 'Start': 'Self Start', 'Mileage': '18,000 km' } }
                    ].filter(r => r.name.includes(make) || !formData.Make);
                }

            } else {
                const loc = formData.Location || 'DHA';
                const area = formData.Area ? `${formData.Area} ${formData.AreaUnit}` : '5 Marla';

                if (category === 'rent') {
                    results = [
                        { name: `${area} House (Full)`, location: `${loc}`, price: budget * 0.95, specs: { 'Bedrooms': 3, 'Baths': 4, 'Type': 'Double Story', 'Area': area } },
                        { name: `${area} Upper Portion`, location: `${loc}`, price: budget * 0.4, specs: { 'Bedrooms': 2, 'Baths': 2, 'Type': 'Upper Portion', 'Area': area } },
                        { name: `${area} Lower Portion`, location: `${loc}`, price: budget * 0.5, specs: { 'Bedrooms': 2, 'Baths': 2, 'Type': 'Lower Portion', 'Area': area } },
                        { name: `Luxury Apartment`, location: `${loc}`, price: budget * 0.6, specs: { 'Bedrooms': 2, 'Baths': 2, 'Type': 'Apartment', 'Area': '1200 SqFt' } },
                    ];
                } else {
                    // Buy Logic
                    results = [
                        { name: `${area} House`, location: `${loc}`, price: budget * 0.98, specs: { 'Bedrooms': 3, 'Baths': 4, 'Type': 'Double Story', 'Area': area } },
                        { name: `${area} House (Corner)`, location: `${loc}`, price: budget * 1.1, specs: { 'Bedrooms': 4, 'Baths': 4, 'Type': 'Double Story', 'Area': area, 'Feature': 'Corner Plot' } },
                        { name: `${area} House (Standard)`, location: `${loc}`, price: budget * 0.85, specs: { 'Bedrooms': 3, 'Baths': 3, 'Type': 'Single Story', 'Area': area } },
                        { name: `${area} Plot`, location: `${loc}`, price: budget * 0.6, specs: { 'Type': 'Residential Plot', 'Area': area, 'Possession': 'Yes' } },
                        { name: `${area} Plot (File)`, location: `${loc}`, price: budget * 0.5, specs: { 'Type': 'Plot File', 'Area': area, 'Possession': 'No' } },
                    ];
                }
            }

            // Filter out results that exceed budget significantly (allow small buffer)
            setBudgetResult(results.filter(r => r.price <= budget * 1.1));
            setLoading(false);
        }, 800);
    };

    useEffect(() => {
        const serviceType = category === 'buy' ? 'house_buy' : category === 'rent' ? 'house_rent' : category;
        fetch(`http://localhost:8000/api/options/${serviceType}`)
            .then(res => res.json())
            .then(data => {
                setOptions({ raw_current: data });
            })
            .catch(err => console.error("Failed to fetch options directly:", err));
    }, [category]);

    useEffect(() => {
        if (category === 'car') {
            setFormData({ Year: currentYear, Mileage: '', FuelType: 'Petrol', Transmission: 'Automatic', Color: 'White', Assembly: 'Local' });
        } else if (category === 'bike') {
            setFormData({ Year: currentYear, Mileage: '' });
        } else {
            setFormData({ Year: currentYear, Type: 'House', Area: 5, AreaUnit: 'Marla', Bedrooms: 3, Baths: 3 });
        }
        setResult(null);
        setBudgetResult([]);
        setError(null);
        setMode('predict');
    }, [category, currentYear]);

    const handleChange = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
        setError(null);
        if (field === 'Make') setFormData((prev: any) => ({ ...prev, Model: '' }));
        if (field === 'City') setFormData((prev: any) => ({ ...prev, Location: '' }));
    };

    useEffect(() => {
        if (category === 'bike' && formData.Model) {
            const name = formData.Model.toLowerCase();
            let cc = '';
            if (name.includes('70')) cc = '70 cc';
            else if (name.includes('100') || name.includes('prider') || name.includes('dx')) cc = '100 cc';
            else if (name.includes('125') || name.includes('ybr') || name.includes('yb')) cc = '125 cc';
            else if (name.includes('150') || name.includes('gs') || name.includes('gr')) cc = '150 cc';
            if (cc && cc !== formData.EngineCapacity) {
                setFormData((prev: any) => ({ ...prev, EngineCapacity: cc }));
            }
        }
    }, [formData.Model, category]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        let required: string[] = [];
        if (category === 'car') {
            required = ['Make', 'Model', 'Year', 'RegisteredIn', 'Mileage', 'EngineCapacity', 'Transmission', 'Assembly'];
        } else if (category === 'bike') {
            required = ['Make', 'Model', 'Year', 'City', 'EngineCapacity'];
        } else if (category === 'buy' || category === 'rent') {
            required = ['City', 'Location', 'Type', 'Area', 'AreaUnit'];
            if (formData.Type === 'House' || formData.Type === 'Flat') {
                required.push('Bedrooms', 'Baths');
            }
        }

        const missing = required.filter(f => !formData[f]);
        if (missing.length > 0) {
            const friendlyNames: { [key: string]: string } = {
                'RegisteredIn': 'Registered In',
                'EngineCapacity': 'Engine Capacity',
                'AreaUnit': 'Area Unit',
                'City': category === 'bike' ? 'Registered' : 'City'
            };
            const missingLabels = missing.map(f => friendlyNames[f] || f);
            setError(`Please fill required fields: ${missingLabels.join(', ')}`);
            setLoading(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        try {
            let serviceType: string = category;
            let payloadData: any = {};
            if (category === 'car') {
                serviceType = 'car';
                payloadData = {
                    make: formData.Make,
                    model: formData.Model,
                    year: Number(formData.Year),
                    mileage: Number(formData.Mileage) || 0,
                    city: formData.City || formData.RegisteredIn,
                    engine_capacity: String(formData.EngineCapacity).replace(' cc', ''),
                    fuel_type: formData.FuelType,
                    transmission: formData.Transmission,
                    color: formData.Color,
                    assembly: formData.Assembly,
                    registered: formData.RegisteredIn
                };
            } else if (category === 'bike') {
                serviceType = 'bike';
                payloadData = {
                    make: formData.Make,
                    model: formData.Model,
                    year: Number(formData.Year),
                    mileage: Number(formData.Mileage) || 0,
                    city: formData.City,
                    engine_capacity: String(formData.EngineCapacity).replace(' cc', '')
                };
            } else {
                serviceType = category === 'buy' ? 'house_buy' : 'house_rent';
                let areaSqFt = Number(formData.Area) || 0;
                if (formData.AreaUnit === 'Marla') areaSqFt *= 270;
                if (formData.AreaUnit === 'Kanal') areaSqFt *= 5400;
                payloadData = {
                    city: formData.City,
                    location: formData.Location,
                    area: areaSqFt,
                    bedrooms: Number(formData.Bedrooms),
                    baths: Number(formData.Baths),
                    year: Number(formData.Year)
                };
            }
            const response = await fetch("http://localhost:8000/api/predict", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    service_type: serviceType,
                    data: payloadData
                })
            });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.detail || "Prediction failed");
            }
            const data = await response.json();

            // Calculate Rental Yield for Property Buy
            if (category === 'buy') {
                try {
                    const rentPayload = { ...payloadData };
                    const rentResponse = await fetch("http://localhost:8000/api/predict", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            service_type: 'house_rent',
                            data: rentPayload
                        })
                    });
                    if (rentResponse.ok) {
                        const rentData = await rentResponse.json();
                        const annualRent = rentData.prediction * 12;
                        const totalPrice = data.prediction;
                        if (totalPrice > 0) {
                            const yieldPercent = (annualRent / totalPrice) * 100;
                            data.rentalYield = yieldPercent.toFixed(2);
                        }
                    }
                } catch (rentErr) { console.error("Failed to fetch rent yield", rentErr); }
            }

            setResult(data);

            // Add to History
            const newHistoryItem = {
                id: Date.now(),
                category,
                date: new Date().toLocaleDateString(),
                prediction: data.prediction,
                formData: { ...formData },
                details: `${category === 'car' ? `${payloadData.make} ${payloadData.model} ${payloadData.year}` :
                    category === 'bike' ? `${payloadData.make} ${payloadData.model} ${payloadData.year}` :
                        `${payloadData.location}`}`
            };
            setHistory(prev => [newHistoryItem, ...prev].slice(0, 5));
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Prediction failed. Please check inputs.");
        } finally {
            setLoading(false);
        }
    };

    const generatePDF = async () => {
        const element = document.getElementById('predicta-main-container');
        if (!element) return;

        try {
            const { toPng } = await import('html-to-image');
            const dataUrl = await toPng(element, {
                backgroundColor: '#e2f0e6', // Ensure background is captured as light green
                cacheBust: true,
                style: {
                    height: 'auto',
                    overflow: 'visible',
                    maxHeight: 'none',
                    padding: '20px',
                }
            });

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgProps = pdf.getImageProperties(dataUrl);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            if (pdfHeight > pdf.internal.pageSize.getHeight()) {
                const pageHeight = pdf.internal.pageSize.getHeight();
                let heightLeft = pdfHeight;
                let position = 0;

                pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, pdfHeight);
                heightLeft -= pageHeight;

                while (heightLeft >= 0) {
                    position = heightLeft - pdfHeight;
                    pdf.addPage();
                    pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, pdfHeight);
                    heightLeft -= pageHeight;
                }
            } else {
                pdf.addImage(dataUrl, 'PNG', 0, 10, pdfWidth, pdfHeight);
            }

            pdf.save(`PredictaPK_Full_Report_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (err: any) {
            console.error("PDF generation failed", err);
            setError("Failed to generate PDF. Please try again. " + (err.message || ""));
        }
    };

    return (
        <div className="mt-8 w-full max-w-4xl mx-auto">
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-10">
                <Card className="overflow-hidden border-2 border-[#044e22] bg-[#badcc4] shadow-xl shadow-[#044e22]/5 rounded-3xl">
                    <CardContent className="p-0">
                        <div className="flex items-center gap-4 mb-8 pl-6 pt-6">
                            <div className="bg-[#e2f0e6] p-3 rounded-2xl text-[#044e22] ring-2 ring-[#044e22] shadow-sm shadow-[#044e22]/20">
                                {category === 'car' && <Car className="w-6 h-6" />}
                                {category === 'bike' && <Bike className="w-6 h-6" />}
                                {category === 'buy' && <Home className="w-6 h-6" />}
                                {category === 'rent' && <Building className="w-6 h-6" />}
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-[#044e22] tracking-tight drop-shadow-sm">
                                    {category === 'car' ? 'Vehicle Configuration' : category === 'bike' ? 'Bike Specifications' : 'Property Parameters'}
                                </h3>
                                <p className="text-[#044e22]/80 text-sm font-medium">Configure the details below for an instant AI valuation.</p>
                            </div>
                            <div className="flex gap-2 ml-auto mr-6">
                                <Button
                                    type="button"
                                    onClick={() => { setMode(prev => prev === 'predict' ? 'budget' : 'predict'); setBudgetResult([]); setResult(null); setSelectedRecommendation(null); }}
                                    className="bg-[#e2f0e6] text-[#044e22] hover:bg-[#d0e5d6] border border-[#044e22]/20 font-bold rounded-xl shadow-sm flex items-center gap-2"
                                >
                                    {mode === 'predict' ? <DollarSign className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                                    {mode === 'predict' ? 'Budget Search' : 'AI Prediction'}
                                </Button>

                                {comparisons.length > 0 && (
                                    <Button
                                        type="button"
                                        onClick={() => setIsComparisonOpen(true)}
                                        className="bg-[#e2f0e6] text-[#044e22] hover:bg-[#d0e5d6] border border-[#044e22]/20 font-bold rounded-xl shadow-sm"
                                    >
                                        Compare ({comparisons.length})
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div id="prediction-result-card" className="p-8 md:p-10 m-6 rounded-3xl bg-[#044e22] backdrop-blur-sm border border-[#044e22]/20 shadow-xl">
                            {mode === 'budget' && (
                                <div className="mb-8 space-y-2">
                                    <label className="text-sm font-bold text-[#e2f0e6] uppercase tracking-wide ml-1">
                                        Max Budget (PKR) <span className="text-[#adc74d]">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 5000000"
                                        className="w-full bg-white/90 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#4ea96b] text-[#044e22] font-semibold text-lg placeholder-[#044e22]/30"
                                        value={formData.MaxBudget || ''}
                                        onChange={(e) => handleChange('MaxBudget', e.target.value)}
                                        required
                                    />
                                    <p className="text-[#e2f0e6]/60 text-xs ml-1">Enter your maximum budget to find best matches.</p>
                                </div>
                            )}

                            {/* Show inputs in both modes, but with slightly different styling/context if needed */}
                            <div className={mode === 'budget' ? 'opacity-90' : ''}>
                                {category === 'car' && <CarInputs key={`car-${mode}`} formData={formData} handleChange={handleChange} options={options} minimal={mode === 'budget'} />}
                                {category === 'bike' && <BikeInputs key={`bike-${mode}`} formData={formData} handleChange={handleChange} options={options} minimal={mode === 'budget'} />}
                                {(category === 'buy' || category === 'rent') && <PropertyInputs key={`property-${mode}`} formData={formData} handleChange={handleChange} options={options} minimal={mode === 'budget'} />}
                            </div>

                            {mode === 'budget' && budgetResult.length > 0 && (
                                <div className="space-y-4 mt-8 pt-8 border-t border-white/10">
                                    <h4 className="font-bold text-[#e2f0e6] text-lg">Recommendations for you:</h4>
                                    <div className="grid gap-3">
                                        {budgetResult.map((item, idx) => (
                                            <div key={idx} onClick={() => setSelectedRecommendation(item)} className="bg-white/10 p-4 rounded-xl border border-white/10 flex justify-between items-center backdrop-blur-sm transition-all hover:bg-white/20 cursor-pointer hover:scale-[1.02]">
                                                <div>
                                                    <p className="font-bold text-white text-lg">{item.name}</p>
                                                    {item.year && <p className="text-sm text-white/70">Model Year: {item.year}</p>}
                                                    {item.location && <p className="text-sm text-white/70">{item.location}</p>}
                                                    <p className="text-[10px] text-[#adc74d] mt-1 font-bold uppercase tracking-wider">Click for details</p>
                                                </div>
                                                <div className="bg-[#adc74d] px-4 py-2 rounded-xl text-[#044e22] font-black text-sm shadow-md">
                                                    PKR {Number(item.price).toLocaleString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Recommendation Details Modal */}
                <RecommendationModal
                    recommendation={selectedRecommendation}
                    onClose={() => setSelectedRecommendation(null)}
                    category={category}
                />
                <AnimatePresence>
                    {error && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                            <Alert variant="destructive" className="bg-amber-950/90 border-2 border-amber-500 text-amber-100 shadow-lg rounded-2xl backdrop-blur-md">
                                <AlertCircle className="h-4 w-4 text-amber-500" />
                                <AlertTitle className="text-amber-100 font-bold">Input Error</AlertTitle>
                                <AlertDescription className="text-amber-200/90 font-medium">{error}</AlertDescription>
                            </Alert>
                        </motion.div>
                    )}
                </AnimatePresence>
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                    <Button
                        type="submit"
                        onClick={mode === 'budget' ? handleBudgetSearch : undefined}
                        className="w-full relative overflow-hidden group bg-[#044e22] hover:bg-[#087030] text-white font-bold h-14 text-base rounded-2xl shadow-lg shadow-[#044e22]/30 hover:shadow-xl hover:shadow-[#044e22]/40 transition-all duration-300 cursor-pointer"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> :
                            <span className="flex items-center justify-center gap-2">
                                {mode === 'budget' ? <DollarSign className="h-5 w-5" /> : <Sparkles className="h-5 w-5 text-white group-hover:rotate-180 transition-transform duration-700 ease-in-out" />}
                                {mode === 'budget' ? 'Find Options' : 'Predict Price'}
                            </span>
                        }
                    </Button>
                </motion.div>
            </form>



            <AnimatePresence>
                {result && (
                    <PredictionResult
                        result={result}
                        category={category}
                        addToComparison={addToComparison}
                        generatePDF={generatePDF}
                    />
                )}
            </AnimatePresence>
            <ComparisonView
                isOpen={isComparisonOpen}
                onClose={() => setIsComparisonOpen(false)}
                comparisons={comparisons}
                onRemove={removeFromComparison}
            />
        </div >
    );
};

export default PredictionForm;
