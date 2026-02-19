import React from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { NumberInput } from "@/components/ui/number-input";
import { motion } from "framer-motion";
import { containerVariants, itemVariants, inputClasses, selectTriggerClasses, selectContentClasses, renderInputLabel, toOptions } from "./constants";

interface PropertyInputsProps {
    formData: any;
    handleChange: (field: string, value: any) => void;
    options: any;
    minimal?: boolean;
}

const PropertyInputs: React.FC<PropertyInputsProps> = ({ formData, handleChange, options, minimal = false }) => {
    const raw = options.raw_current || {};
    const locationTree = raw.city_location_tree || {};
    const cities = Object.keys(locationTree).length > 0 ? Object.keys(locationTree) : (raw.city || []);
    const areas = formData.City && locationTree[formData.City] ? locationTree[formData.City] : [];

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div variants={itemVariants} className="space-y-1">
                {renderInputLabel("City", true)}
                <Combobox
                    options={toOptions(cities)}
                    value={formData.City}
                    onChange={v => handleChange('City', v)}
                    placeholder="Select City"
                />
            </motion.div>
            <motion.div variants={itemVariants} className="space-y-1">
                {renderInputLabel("Location", true)}
                <Combobox
                    options={toOptions(areas)}
                    value={formData.Location}
                    onChange={v => handleChange('Location', v)}
                    placeholder="Select Area"
                    disabled={!formData.City}
                />
            </motion.div>
            {!minimal && (
                <motion.div variants={itemVariants} className="space-y-1">
                    {renderInputLabel("Type", true)}
                    <Select value={formData.Type} onValueChange={v => handleChange('Type', v)}>
                        <SelectTrigger className={selectTriggerClasses}><SelectValue placeholder="Select Type" /></SelectTrigger>
                        <SelectContent className={selectContentClasses}>
                            <SelectItem value="House" className="focus:bg-[#044e22] focus:text-white text-[#044e22] cursor-pointer">House</SelectItem>
                            <SelectItem value="Flat" className="focus:bg-[#044e22] focus:text-white text-[#044e22] cursor-pointer">Flat</SelectItem>
                        </SelectContent>
                    </Select>
                </motion.div>
            )}
            <motion.div variants={itemVariants} className="space-y-1">
                {renderInputLabel("Area", true)}
                <div className="flex gap-2">
                    <NumberInput className={inputClasses} value={formData.Area || ''} onChange={val => handleChange('Area', val)} />
                    <Select onValueChange={v => handleChange('AreaUnit', v)} value={formData.AreaUnit}>
                        <SelectTrigger className={`w-[130px] ${selectTriggerClasses} `}><SelectValue placeholder="Unit" /></SelectTrigger>
                        <SelectContent className={selectContentClasses}>
                            <SelectItem value="Marla" className="focus:bg-[#044e22] focus:text-white text-[#044e22] cursor-pointer">Marla</SelectItem>
                            <SelectItem value="Kanal" className="focus:bg-[#044e22] focus:text-white text-[#044e22] cursor-pointer">Kanal</SelectItem>
                            <SelectItem value="SqFt" className="focus:bg-[#044e22] focus:text-white text-[#044e22] cursor-pointer">SqFt</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </motion.div>
            {!minimal && (
                <>
                    <motion.div variants={itemVariants} className="space-y-1">
                        {renderInputLabel("Bedrooms", false)}
                        <NumberInput className={inputClasses} value={formData.Bedrooms || ''} onChange={val => handleChange('Bedrooms', val)} />
                    </motion.div>
                    <motion.div variants={itemVariants} className="space-y-1">
                        {renderInputLabel("Baths", false)}
                        <NumberInput className={inputClasses} value={formData.Baths || ''} onChange={val => handleChange('Baths', val)} />
                    </motion.div>
                </>
            )}
        </motion.div>
    );
};

export default PropertyInputs;
