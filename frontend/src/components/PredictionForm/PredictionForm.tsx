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
import { getRecommendations } from '@/lib/api';
import { NumberInput } from "@/components/ui/number-input";
import { inputClasses } from './constants';
interface PredictionFormProps {
    category: 'car' | 'bike' | 'buy' | 'rent';
    history: any[];
    setHistory: React.Dispatch<React.SetStateAction<any[]>>;
    viewMode?: 'predict' | 'budget';
}
const PredictionForm: React.FC<PredictionFormProps> = ({ category, history, setHistory, viewMode }) => {
    const [options, setOptions] = useState<any>({ raw_current: {} });
    const currentYear = new Date().getFullYear();
    const [formData, setFormData] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [comparisons, setComparisons] = useState<any[]>([]);
    const [mode, setMode] = useState<'predict' | 'budget'>(viewMode || 'predict');
    const [budgetResult, setBudgetResult] = useState<any[]>([]);
    useEffect(() => {
        if (viewMode) {
            setMode(viewMode);
            setBudgetResult([]);
            setResult(null);
            setSelectedRecommendation(null);
        }
    }, [viewMode]);
    const [selectedRecommendation, setSelectedRecommendation] = useState<any>(null);
    const [isComparisonOpen, setIsComparisonOpen] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);
    useEffect(() => {
        const savedComparisons = localStorage.getItem('comparisons');
        if (savedComparisons) {
            try { setComparisons(JSON.parse(savedComparisons)); } catch (e) { console.error(e); }
        }
    }, []);
    useEffect(() => {
        localStorage.setItem('comparisons', JSON.stringify(comparisons));
    }, [comparisons]);
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
    const handleBudgetSearch = async (e: React.FormEvent | React.MouseEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        let required: string[] = ['MaxBudget'];
        if (category === 'car') required.push('Make', 'Model', 'RegisteredIn', 'Transmission');
        else if (category === 'bike') required.push('Make', 'Model', 'City');
        else if (category === 'rent' || category === 'buy') required.push('City', 'Location', 'Area', 'AreaUnit');
        const missing = required.filter(f => !formData[f]);
        if (missing.length > 0) {
            const friendlyNames: any = {
                MaxBudget: 'Max Budget',
                RegisteredIn: 'Registered In',
                City: category === 'bike' ? 'Registered' : 'City',
                AreaUnit: 'Area & Unit'
            };
            const missingLabels = missing.map(f => friendlyNames[f] || f);
            setError(`Please fill required fields: ${missingLabels.join(', ')}`);
            setLoading(false);
            setTimeout(() => {
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }, 100);
            return;
        }
        if (isNaN(Number(formData.MaxBudget)) || Number(formData.MaxBudget) <= 0) {
            setError('Please enter a valid numerical budget greater than 0.');
            setLoading(false);
            setTimeout(() => {
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }, 100);
            return;
        }
        const budget = Number(formData.MaxBudget);
        let minBudget = 0;
        if (category === 'car') minBudget = 500000;
        if (category === 'bike') minBudget = 20000;
        if (category === 'buy') minBudget = 1000000;
        if (category === 'rent') minBudget = 10000;
        if (budget > 0 && budget < minBudget) {
            setError(`Budget is too low for ${category === 'buy' ? 'property' : category}. Minimum recommended: PKR ${minBudget.toLocaleString()}`);
            setLoading(false);
            setTimeout(() => {
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }, 100);
            return;
        }
        try {
            const filters: any = {};
            let apiCategory: string = category;
            if (category === 'car') {
                if (formData.Make) filters.make = formData.Make;
                if (formData.Model) filters.model = formData.Model;
                if (formData.City || formData.RegisteredIn) filters.city = formData.City || formData.RegisteredIn;
                if (formData.Transmission) filters.transmission = formData.Transmission;
            } else if (category === 'bike') {
                if (formData.Make) filters.make = formData.Make;
                if (formData.Model) filters.model = formData.Model;
                if (formData.City) filters.city = formData.City;
            } else if (category === 'buy') {
                apiCategory = 'house_buy';
                if (formData.City) filters.city = formData.City;
                if (formData.Location) filters.location = formData.Location;

                let areaSqFt = Number(formData.Area) || 0;
                if (formData.AreaUnit === 'Marla') areaSqFt *= 225;
                if (formData.AreaUnit === 'Kanal') areaSqFt *= 4500;
                if (areaSqFt > 0) filters.area = areaSqFt;

            } else if (category === 'rent') {
                apiCategory = 'house_rent';
                if (formData.City) filters.city = formData.City;
                if (formData.Location) filters.location = formData.Location;

                let areaSqFt = Number(formData.Area) || 0;
                if (formData.AreaUnit === 'Marla') areaSqFt *= 225;
                if (formData.AreaUnit === 'Kanal') areaSqFt *= 4500;
                if (areaSqFt > 0) filters.area = areaSqFt;
            }
            const results = await getRecommendations(apiCategory, budget, filters);

            // Format the area display back to the user's requested unit for properties
            if (category === 'buy' || category === 'rent') {
                const unit = formData.AreaUnit || 'sq ft';
                const divisor = unit === 'Marla' ? 225 : (unit === 'Kanal' ? 4500 : 1);

                if (results && results.length > 0) {
                    results.forEach((item: any) => {
                        if (item.specs && item.specs.Area) {
                            const match = item.specs.Area.match(/([\d,\.]+)/);
                            if (match) {
                                const sqft = parseFloat(match[1].replace(/,/g, ''));
                                const converted = sqft / divisor;
                                item.specs.Area = `${converted.toFixed(2).replace(/\.?0+$/, '')} ${unit}`;
                            }
                        }
                    });
                }
            }
            if (!results || results.length === 0) {
                setError(`No recommendations found near PKR ${budget.toLocaleString()} for this configuration. Try adjusting your budget or filters.`);
                setBudgetResult([]);
            } else {
                setBudgetResult(results);
            }
        } catch (error) {
            console.error(error);
            setError("Failed to fetch budget recommendations. Please try again.");
            setBudgetResult([]);
        } finally {
            setLoading(false);
            setTimeout(() => {
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }, 100);
        }
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
            setFormData({ Year: currentYear, Type: '', Area: 5, AreaUnit: 'Marla', Bedrooms: 3, Baths: 3 });
        }
        setResult(null);
        setBudgetResult([]);
        setError(null);
    }, [category, currentYear]);
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError(null);
            }, 3500);
            return () => clearTimeout(timer);
        }
    }, [error]);
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
                'AreaUnit': 'Area & Unit',
                'Type': 'Type',
                'City': category === 'bike' ? 'Registered' : 'City'
            };
            const missingLabels = missing.map(f => friendlyNames[f] || f);
            setError(`Please fill required fields: ${missingLabels.join(', ')}`);
            setLoading(false);
            setTimeout(() => {
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }, 100);
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
                if (formData.AreaUnit === 'Marla') areaSqFt *= 225;
                if (formData.AreaUnit === 'Kanal') areaSqFt *= 4500;
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
                backgroundColor: '#e2f0e6',
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
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-10" noValidate>
                <Card className="overflow-hidden border-2 border-[#044e22] bg-[#badcc4] shadow-xl shadow-[#044e22]/5 rounded-3xl">
                    <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-2 md:mb-8 p-4 pb-4 md:p-8 bg-white/5 border-b border-[#044e22]/10">
                            <div className="flex items-center gap-4 w-full md:w-auto px-2 md:px-0">
                                <div className="bg-[#e2f0e6] p-3 rounded-2xl text-[#044e22] ring-2 ring-[#044e22] shadow-sm shadow-[#044e22]/20 flex-shrink-0">
                                    {category === 'car' && <Car className="w-6 h-6" />}
                                    {category === 'bike' && <Bike className="w-6 h-6" />}
                                    {category === 'buy' && <Home className="w-6 h-6" />}
                                    {category === 'rent' && <Building className="w-6 h-6" />}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl md:text-2xl font-black text-[#044e22] tracking-tight drop-shadow-sm">
                                        {category === 'car' ? 'Vehicle Configuration' : category === 'bike' ? 'Bike Specifications' : 'Property Parameters'}
                                    </h3>
                                    <p className="text-[#044e22]/80 text-xs md:text-sm font-medium">Configure the details below for an instant AI valuation.</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2 md:ml-auto w-full px-2 md:px-0 md:w-auto">
                                {comparisons.length > 0 && (
                                    <Button
                                        type="button"
                                        onClick={() => setIsComparisonOpen(true)}
                                        className="flex-1 md:flex-none bg-[#044e22] text-[#adc74d] hover:bg-[#adc74d] hover:text-[#044e22] border border-[#adc74d] font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 text-xs md:text-sm py-6 px-2"
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
                                    <NumberInput
                                        placeholder="e.g. 5000000"
                                        className={`w-full font-bold text-lg px-4 ${inputClasses}`}
                                        value={formData.MaxBudget || ''}
                                        onChange={(val) => handleChange('MaxBudget', val)}
                                        stepAmount={1000}
                                        required
                                    />
                                    <p className="text-[#e2f0e6] text-xs ml-1">Enter your maximum budget to find best matches.</p>
                                </div>
                            )}
                            { }
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
                { }
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
