import React from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { NumberInput } from "@/components/ui/number-input";
import { motion } from "framer-motion";
import { containerVariants, itemVariants, inputClasses, selectTriggerClasses, selectContentClasses, renderInputLabel, toOptions } from "./constants";

interface CarInputsProps {
    formData: any;
    handleChange: (field: string, value: any) => void;
    options: any;
    minimal?: boolean;
}

const CarInputs: React.FC<CarInputsProps> = ({ formData, handleChange, options, minimal = false }) => {
    const raw = options.raw_current || {};
    const makes = raw.make_model_tree ? Object.keys(raw.make_model_tree) : [];
    const models = formData.Make ? (raw.make_model_tree?.[formData.Make] || []) : [];
    const cities = raw.city || [];
    const engineOptions = raw.engine_capacity || [];

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
                { label: "Make", field: "Make", type: "combo", opts: makes, req: true },
                { label: "Model", field: "Model", type: "combo", opts: models, req: true, disabled: !formData.Make, hidden: false }, // Always show Model
                { label: "Year", field: "Year", type: "number", req: true, hidden: minimal },
                { label: "Mileage (km)", field: "Mileage", type: "number", req: true, hidden: minimal },
                { label: "City", field: "City", type: "combo", opts: cities, req: false, hidden: minimal },
                { label: "Registered In", field: "RegisteredIn", type: "combo", opts: raw.registered || cities, req: true },
                { label: "Transmission", field: "Transmission", type: "select", opts: raw.transmission || ['Manual', 'Automatic'], req: true, hidden: !minimal }, // Conditionally render Transmission in main grid
                { label: "Color", field: "Color", type: "combo", opts: raw.color || [], req: false, hidden: minimal },
                { label: "Engine (cc)", field: "EngineCapacity", type: "combo", opts: engineOptions.map((c: string) => `${c} cc`), req: true, hidden: minimal }
            ].filter(i => !i.hidden).map((input) => (
                <motion.div variants={itemVariants} key={input.field} className="space-y-1">
                    {renderInputLabel(input.label, input.req)}
                    <div className="relative group">
                        {input.type === 'combo' ? (
                            <Combobox
                                options={toOptions(input.opts)}
                                value={formData[input.field]}
                                onChange={v => handleChange(input.field, v)}
                                placeholder={`Select ${input.label} `}
                                disabled={input.disabled}
                            />
                        ) : input.type === 'select' ? ( // New condition for select type
                            <Select onValueChange={v => handleChange(input.field, v)} value={formData[input.field]}>
                                <SelectTrigger className={selectTriggerClasses}><SelectValue placeholder="Select" /></SelectTrigger>
                                <SelectContent className={selectContentClasses}>
                                    {input.opts.map((opt: string) => (
                                        <SelectItem key={opt} value={opt} className="focus:bg-[#044e22] focus:text-white text-[#044e22] cursor-pointer">{opt}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <NumberInput
                                className={inputClasses}
                                placeholder={`Enter ${input.label} `}
                                value={formData[input.field] || ''}
                                onChange={val => handleChange(input.field, val)}
                            />
                        )}
                    </div>
                </motion.div>
            ))}
            {!minimal && ( // Wrap the entire bottom section with !minimal condition
                <motion.div variants={itemVariants} className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                    <div className="space-y-1">
                        {renderInputLabel("Transmission", true)}
                        <Select onValueChange={v => handleChange('Transmission', v)} value={formData.Transmission}>
                            <SelectTrigger className={selectTriggerClasses}><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent className={selectContentClasses}>
                                {(raw.transmission || ['Manual', 'Automatic']).map((t: string) => (
                                    <SelectItem key={t} value={t} className="focus:bg-[#044e22] focus:text-white text-[#044e22] cursor-pointer">{t}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <>
                        <div className="space-y-1">
                            {renderInputLabel("Assembly", true)}
                            <Select onValueChange={v => handleChange('Assembly', v)} value={formData.Assembly}>
                                <SelectTrigger className={selectTriggerClasses}><SelectValue placeholder="Select" /></SelectTrigger>
                                <SelectContent className={selectContentClasses}>
                                    {(raw.assembly || ['Local', 'Imported']).map((c: string) => (
                                        <SelectItem key={c} value={c} className="focus:bg-[#044e22] focus:text-white text-[#044e22] cursor-pointer">{c}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            {renderInputLabel("Fuel Type", false)}
                            <Select onValueChange={v => handleChange('FuelType', v)} value={formData.FuelType}>
                                <SelectTrigger className={selectTriggerClasses}><SelectValue placeholder="Select" /></SelectTrigger>
                                <SelectContent className={selectContentClasses}>
                                    {(raw.fuel_type || ['Petrol', 'Diesel', 'Hybrid']).map((c: string) => (
                                        <SelectItem key={c} value={c} className="focus:bg-[#044e22] focus:text-white text-[#044e22] cursor-pointer">{c}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </>
                </motion.div>
            )}
        </motion.div>
    );
};

export default CarInputs;
