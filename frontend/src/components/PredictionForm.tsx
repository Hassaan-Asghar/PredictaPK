"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, AlertCircle, TrendingUp, Zap, MapPin, Car, Activity, Bike, Home, Building } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ShapChart from './ShapChart';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Combobox } from "@/components/ui/combobox";
import { NumberInput } from "@/components/ui/number-input";
interface PredictionFormProps {
    category: 'car' | 'bike' | 'buy' | 'rent';
}
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.05 }
    }
};
const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};
const PredictionForm: React.FC<PredictionFormProps> = ({ category }) => {
    const [options, setOptions] = useState<any>({ raw_current: {} });
    const currentYear = new Date().getFullYear();
    const [formData, setFormData] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const formRef = useRef<HTMLFormElement>(null);
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
        setError(null);
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
        const required = [];
        if (category !== 'car') required.push('City');
        if (category === 'car' || category === 'bike') required.push('Make', 'Model', 'Year');
        if (category === 'car') required.push('RegisteredIn');
        if (category === 'buy' || category === 'rent') required.push('City', 'Location', 'Type', 'Area', 'Bedrooms', 'Baths');
        const missing = required.filter(f => !formData[f]);
        if (missing.length > 0) {
            setError(`Please fill required fields: ${missing.join(', ')}`);
            setLoading(false);
            setLoading(false);
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
                    baths: Number(formData.Baths)
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
            setResult(data);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Prediction failed. Please check inputs.");

        } finally {
            setLoading(false);
        }
    };
    const toOptions = (arr: string[] = []) => arr.map(s => ({ value: s, label: s }));
    const getFeatureContext = (name: string, value: number) => {
        const n = name.toLowerCase();
        if (n.includes('year')) return value > 0 ? "The newer model" : "The older model";
        if (n.includes('mileage')) return value > 0 ? "The lower" : "The higher";
        if (n.includes('engine')) return "The engine of";
        if (n.includes('registered')) return "The city of";
        if (n.includes('transmission')) return "The transmission of";
        if (n.includes('location')) return "The specific area of";
        if (n.includes('city')) return "Being in the city of";
        if (n.includes('area')) return value > 0 ? "The larger total" : "The smaller total";
        return "The specification of";
    };
    const formatPakistaniPrice = (amount: number): string => {
        const absAmount = Math.abs(amount);
        if (absAmount >= 10000000) return `${(amount / 10000000).toFixed(2)} Crore`;
        if (absAmount >= 100000) return `${(amount / 100000).toFixed(2)} Lac`;
        if (absAmount >= 1000) return `${(amount / 1000).toFixed(1)} Thousand`;
        return amount.toLocaleString();
    };
    const renderInputLabel = (label: string, req: boolean) => (
        <Label className="text-[#e2f0e6] font-black text-sm uppercase tracking-wide mb-2 flex items-center gap-1.5 shadow-sm">
            {label} {req && <span className="text-red-500 text-xl leading-none drop-shadow-sm">*</span>}
        </Label>
    );
    const inputClasses = "!bg-[#e2f0e6] !opacity-100 border-2 border-[#044e22] text-[#044e22] placeholder:text-[#4ea96b]/60 focus:bg-[#e2f0e6] focus:border-[#044e22] focus:ring-2 focus:ring-[#044e22]/20 rounded-xl h-12 shadow-sm transition-all";
    const selectTriggerClasses = "w-full h-12 !bg-[#e2f0e6] !opacity-100 border-2 border-[#044e22] text-[#044e22] focus:ring-2 focus:ring-[#044e22]/20 data-[placeholder]:text-[#4ea96b]/60 rounded-xl shadow-sm";
    const selectContentClasses = "bg-[#e2f0e6] border-2 border-[#044e22] text-[#044e22] shadow-2xl shadow-[#044e22]/10";
    const renderCarInputs = () => {
        const raw = options.raw_current || {};
        const makes = raw.make_model_tree ? Object.keys(raw.make_model_tree) : [];
        const models = formData.Make ? (raw.make_model_tree?.[formData.Make] || []) : [];
        const cities = raw.city || [];
        const engineOptions = raw.engine_capacity || [];
        return (
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                    { label: "Make", field: "Make", type: "combo", opts: makes, req: true },
                    { label: "Model", field: "Model", type: "combo", opts: models, req: true, disabled: !formData.Make },
                    { label: "Year", field: "Year", type: "number", req: true },
                    { label: "Mileage (km)", field: "Mileage", type: "number", req: false },
                    { label: "City", field: "City", type: "combo", opts: cities, req: true },
                    { label: "Registered In", field: "RegisteredIn", type: "combo", opts: raw.registered || cities, req: true },
                    { label: "Color", field: "Color", type: "combo", opts: raw.color || [], req: false },
                    { label: "Engine (cc)", field: "EngineCapacity", type: "combo", opts: engineOptions.map((c: string) => `${c} cc`), req: false }
                ].map((input, idx) => (
                    <motion.div variants={itemVariants} key={idx} className="space-y-1">
                        {renderInputLabel(input.label, input.req)}
                        <div className="relative group">
                            {input.type === 'combo' ? (
                                <Combobox options={toOptions(input.opts)} value={formData[input.field]} onChange={v => handleChange(input.field, v)} placeholder={`Select ${input.label} `} disabled={input.disabled} />
                            ) : (
                                <NumberInput className={inputClasses} placeholder={`Enter ${input.label} `} value={formData[input.field] || ''} onChange={val => handleChange(input.field, val)} />
                            )}
                        </div>
                    </motion.div>
                ))}
                <motion.div variants={itemVariants} className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                    <div className="space-y-1">
                        {renderInputLabel("Transmission", false)}
                        <Select onValueChange={v => handleChange('Transmission', v)} value={formData.Transmission}>
                            <SelectTrigger className={selectTriggerClasses}><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent className={selectContentClasses}>{(raw.transmission || ['Manual', 'Automatic']).map((t: string) => <SelectItem key={t} value={t} className="focus:bg-[#044e22] focus:text-white text-[#044e22] cursor-pointer">{t}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        {renderInputLabel("Assembly", false)}
                        <Select onValueChange={v => handleChange('Assembly', v)} value={formData.Assembly}>
                            <SelectTrigger className={selectTriggerClasses}><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent className={selectContentClasses}>{(raw.assembly || ['Local', 'Imported']).map((c: string) => <SelectItem key={c} value={c} className="focus:bg-[#044e22] focus:text-white text-[#044e22] cursor-pointer">{c}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        {renderInputLabel("Fuel Type", false)}
                        <Select onValueChange={v => handleChange('FuelType', v)} value={formData.FuelType}>
                            <SelectTrigger className={selectTriggerClasses}><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent className={selectContentClasses}>{(raw.fuel_type || ['Petrol', 'Diesel', 'Hybrid']).map((c: string) => <SelectItem key={c} value={c} className="focus:bg-[#044e22] focus:text-white text-[#044e22] cursor-pointer">{c}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                </motion.div>
            </motion.div>
        );
    };
    const renderBikeInputs = () => {
        const raw = options.raw_current || {};
        const makes = raw.make_model_tree ? Object.keys(raw.make_model_tree) : [];
        const models = formData.Make ? (raw.make_model_tree?.[formData.Make] || []) : [];
        const cities = raw.city || [];
        return (
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                    { label: "Make", field: "Make", type: "combo", opts: makes, req: true },
                    { label: "Model", field: "Model", type: "combo", opts: models, req: true, disabled: !formData.Make },
                    { label: "Year", field: "Year", type: "number", req: true },
                    { label: "Mileage (km)", field: "Mileage", type: "number", req: false },
                    { label: "City", field: "City", type: "combo", opts: cities, req: true }
                ].map((input, idx) => (
                    <motion.div variants={itemVariants} key={idx} className="space-y-1">
                        {renderInputLabel(input.label, input.req)}
                        <div className="relative group">
                            {input.type === 'combo' ? (
                                <Combobox options={toOptions(input.opts)} value={formData[input.field]} onChange={v => handleChange(input.field, v)} placeholder={`Select ${input.label} `} disabled={input.disabled} />
                            ) : (
                                <NumberInput className={inputClasses} placeholder={`Enter ${input.label} `} value={formData[input.field] || ''} onChange={val => handleChange(input.field, val)} />
                            )}
                        </div>
                    </motion.div>
                ))}
                <motion.div variants={itemVariants} className="space-y-1">
                    {renderInputLabel("Engine (cc)", false)}
                    <Select value={formData.EngineCapacity} onValueChange={v => handleChange('EngineCapacity', v)}>
                        <SelectTrigger className={selectTriggerClasses}><SelectValue placeholder="Select CC" /></SelectTrigger>
                        <SelectContent className={selectContentClasses}>
                            {(raw.engine_capacity || ['70 cc', '100 cc', '125 cc', '150 cc']).map((c: string) => <SelectItem key={c} value={c.includes('cc') ? c : `${c} cc`} className="focus:bg-[#044e22] focus:text-white text-[#044e22] cursor-pointer">{c.includes('cc') ? c : `${c} cc`}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </motion.div>
            </motion.div>
        );
    };
    const renderPropertyInputs = () => {
        const raw = options.raw_current || {};
        const locationTree = raw.city_location_tree || {};
        const cities = Object.keys(locationTree).length > 0 ? Object.keys(locationTree) : (raw.city || []);
        const areas = formData.City && locationTree[formData.City] ? locationTree[formData.City] : [];
        return (
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div variants={itemVariants} className="space-y-1">
                    {renderInputLabel("City", true)}
                    <Combobox options={toOptions(cities)} value={formData.City} onChange={v => handleChange('City', v)} placeholder="Select City" />
                </motion.div>
                <motion.div variants={itemVariants} className="space-y-1">
                    {renderInputLabel("Location", true)}
                    <Combobox options={toOptions(areas)} value={formData.Location} onChange={v => handleChange('Location', v)} placeholder="Select Area" disabled={!formData.City} />
                </motion.div>
                <motion.div variants={itemVariants} className="space-y-1">
                    {renderInputLabel("Type", true)}
                    <Select value={formData.Type} onValueChange={v => handleChange('Type', v)}>
                        <SelectTrigger className={selectTriggerClasses}><SelectValue placeholder="Select Type" /></SelectTrigger>
                        <SelectContent className={selectContentClasses}><SelectItem value="House" className="focus:bg-[#044e22] focus:text-white text-[#044e22] cursor-pointer">House</SelectItem><SelectItem value="Flat" className="focus:bg-[#044e22] focus:text-white text-[#044e22] cursor-pointer">Flat</SelectItem></SelectContent>
                    </Select>
                </motion.div>
                <motion.div variants={itemVariants} className="space-y-1">
                    {renderInputLabel("Area", true)}
                    <div className="flex gap-2">
                        <NumberInput className={inputClasses} value={formData.Area || ''} onChange={val => handleChange('Area', val)} />
                        <Select onValueChange={v => handleChange('AreaUnit', v)} value={formData.AreaUnit}>
                            <SelectTrigger className={`w-[130px] ${selectTriggerClasses} `}><SelectValue placeholder="Unit" /></SelectTrigger>
                            <SelectContent className={selectContentClasses}><SelectItem value="Marla" className="focus:bg-[#044e22] focus:text-white text-[#044e22] cursor-pointer">Marla</SelectItem><SelectItem value="Kanal" className="focus:bg-[#044e22] focus:text-white text-[#044e22] cursor-pointer">Kanal</SelectItem><SelectItem value="SqFt" className="focus:bg-[#044e22] focus:text-white text-[#044e22] cursor-pointer">SqFt</SelectItem></SelectContent>
                        </Select>
                    </div>
                </motion.div>
                <motion.div variants={itemVariants} className="space-y-1">
                    {renderInputLabel("Bedrooms", false)}
                    <NumberInput className={inputClasses} value={formData.Bedrooms || ''} onChange={val => handleChange('Bedrooms', val)} />
                </motion.div>
                <motion.div variants={itemVariants} className="space-y-1">
                    {renderInputLabel("Baths", false)}
                    <NumberInput className={inputClasses} value={formData.Baths || ''} onChange={val => handleChange('Baths', val)} />
                </motion.div>
            </motion.div>
        );
    };
    return (
        <div className="mt-8 w-full max-w-4xl mx-auto">
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-10">

                <Card className="overflow-hidden border-2 border-[#044e22] bg-[#badcc4] shadow-xl shadow-[#044e22]/5 rounded-3xl">
                    <CardContent className="p-0">
                        <div className="flex items-center gap-4 mb-8 pl-6">
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
                        </div>
                        <div className="p-8 md:p-10 m-6 rounded-3xl bg-[#044e22] backdrop-blur-sm border border-[#044e22]/20 shadow-xl">
                            {category === 'car' && renderCarInputs()}
                            {category === 'bike' && renderBikeInputs()}
                            {(category === 'buy' || category === 'rent') && renderPropertyInputs()}
                        </div>
                    </CardContent>
                </Card>
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
                        className="w-full relative overflow-hidden group bg-[#044e22] hover:bg-[#087030] text-white font-bold h-14 text-base rounded-2xl shadow-lg shadow-[#044e22]/30 hover:shadow-xl hover:shadow-[#044e22]/40 transition-all duration-300 cursor-pointer"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> :
                            <span className="flex items-center justify-center gap-2">
                                <Sparkles className="h-5 w-5 text-white group-hover:rotate-180 transition-transform duration-700 ease-in-out" />
                                Predict Price
                            </span>
                        }
                    </Button>
                </motion.div>
            </form>
            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        className="mt-16"
                    >
                        { }
                        <div className="relative p-[2px] rounded-3xl bg-gradient-to-br from-[#4ea96b] via-[#044e22] to-[#4ea96b] shadow-2xl shadow-[#044e22]/20">
                            <div className="absolute inset-0 bg-[#4ea96b]/10 blur-3xl opacity-30" />
                            <div className="relative text-center p-6 bg-[#badcc4] rounded-[23px] overflow-hidden">
                                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#4ea96b]/40 to-transparent" />
                                <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#badcc4]/10 to-transparent" />
                                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-[#044e22] rounded-3xl p-8 shadow-xl shadow-[#044e22]/20 border border-[#044e22]/20">
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1b5f36] border border-[#4ea96b] text-[#e2f0e6] text-xs font-bold uppercase tracking-widest mb-8">
                                        <Activity className="w-3.5 h-3.5" /> AI Valuation Complete
                                    </div>
                                    <div className="flex flex-col items-center justify-center relative">
                                        <div className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#e2f0e6] via-[#e2f0e6] to-[#4ea96b] tracking-tight mb-2 drop-shadow-sm">
                                            {formatPakistaniPrice(result?.prediction ?? 0)}
                                        </div>
                                        <span className="text-xl text-[#badcc4] font-bold tracking-widest uppercase">PKR Estimated</span>
                                    </div>
                                    <p className="text-xs text-[#badcc4] mt-4 font-bold uppercase tracking-widest opacity-70">
                                        * Disclaimer: Actual price may vary based on condition & location
                                    </p>
                                </motion.div>
                            </div>
                        </div>
                        { }
                        {(() => {
                            const explanationData = result.explanation || [];
                            if (explanationData.length === 0) return null;
                            const filteredExplanation = explanationData.filter((i: any) => i.active);
                            return (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-12">
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-12">
                                        <Card className="overflow-hidden border-2 border-[#044e22] bg-[#badcc4] shadow-xl shadow-[#044e22]/5 rounded-3xl">
                                            <CardContent className="p-0">
                                                <div className="flex items-center gap-4 mb-8 pl-6 pt-6">
                                                    <div className="bg-[#e2f0e6] p-3 rounded-2xl text-[#044e22] ring-2 ring-[#044e22] shadow-sm shadow-[#044e22]/20">
                                                        <TrendingUp className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-2xl font-black text-[#044e22] tracking-tight drop-shadow-sm">
                                                            AI Market Drivers
                                                        </h3>
                                                        <p className="text-[#044e22]/80 text-sm font-medium">How specific features impacted this valuation.</p>
                                                    </div>
                                                </div>
                                                <div className="p-8 md:p-10 m-6 rounded-3xl bg-[#044e22] backdrop-blur-sm border border-[#044e22]/20 shadow-xl">
                                                    <ShapChart data={filteredExplanation} />
                                                    { }
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 border-t border-[#f2efc9]/30 pt-8">
                                                        {filteredExplanation.map((item: any, idx: number) => (
                                                            <div key={idx} className="bg-[#22401A] border border-[#f2efc9] p-4 rounded-xl flex justify-between items-center shadow-lg shadow-[#000000]/20 hover:scale-[1.02] transition-transform duration-300">
                                                                <div>
                                                                    <span className="text-[#f2efc9] font-bold block text-sm mb-1">{item.name}</span>
                                                                    <span className="text-[#f2efc9] text-[10px] uppercase tracking-wider font-semibold">Impact</span>
                                                                </div>
                                                                <div className={`text-lg font-black ${item.value >= 0 ? 'text-[#adc74d]' : 'text-[#badcc4]'} `}>
                                                                    {item.value >= 0 ? '+' : ''}{formatPakistaniPrice(item.value)}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </motion.div>
                            );
                        })()}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
export default PredictionForm;