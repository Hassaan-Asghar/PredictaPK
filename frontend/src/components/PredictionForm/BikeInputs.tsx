import React from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { NumberInput } from "@/components/ui/number-input";
import { motion } from "framer-motion";
import { containerVariants, itemVariants, inputClasses, selectTriggerClasses, selectContentClasses, renderInputLabel, toOptions } from "./constants";

interface BikeInputsProps {
    formData: any;
    handleChange: (field: string, value: any) => void;
    options: any;
    minimal?: boolean;
}

const BikeInputs: React.FC<BikeInputsProps> = ({ formData, handleChange, options, minimal = false }) => {
    const raw = options.raw_current || {};
    const makes = raw.make_model_tree ? Object.keys(raw.make_model_tree) : [];
    const models = formData.Make ? (raw.make_model_tree?.[formData.Make] || []) : [];
    const cities = raw.city || [];

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
                { label: "Make", field: "Make", type: "combo", opts: makes, req: true },
                { label: "Model", field: "Model", type: "combo", opts: models, req: true, disabled: !formData.Make },
                { label: "Year", field: "Year", type: "number", req: true, hidden: minimal },
                { label: "Mileage (km)", field: "Mileage", type: "number", req: false, hidden: minimal },
                { label: "Registered", field: "City", type: "combo", opts: cities, req: true },
                { label: "Engine (cc)", field: "EngineCapacity", type: "combo", opts: (raw.engine_capacity || ['70', '100', '125', '150']).map((c: string) => c.includes('cc') ? c : `${c} cc`), req: false, hidden: minimal }
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
        </motion.div>
    );
};

export default BikeInputs;
