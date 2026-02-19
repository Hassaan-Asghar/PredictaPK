import { Label } from "@/components/ui/label";

export const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.05 }
    }
};

export const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export const inputClasses = "!bg-[#e2f0e6] !opacity-100 border-2 border-[#044e22] text-[#044e22] placeholder:text-[#4ea96b]/60 focus:bg-[#e2f0e6] focus:border-[#044e22] focus:ring-2 focus:ring-[#044e22]/20 rounded-xl h-12 shadow-sm transition-all";
export const selectTriggerClasses = "w-full h-12 !bg-[#e2f0e6] !opacity-100 border-2 border-[#044e22] text-[#044e22] focus:ring-2 focus:ring-[#044e22]/20 data-[placeholder]:text-[#4ea96b]/60 rounded-xl shadow-sm";
export const selectContentClasses = "bg-[#e2f0e6] border-2 border-[#044e22] text-[#044e22] shadow-2xl shadow-[#044e22]/10";

export const renderInputLabel = (label: string, req: boolean) => (
    <Label className="text-[#e2f0e6] font-black text-sm uppercase tracking-wide mb-2 flex items-center gap-1.5 shadow-sm">
        {label} {req && <span className="text-[#adc74d] text-xl leading-none drop-shadow-sm">*</span>}
    </Label>
);

export const toOptions = (arr: string[] = []) => arr.map(s => ({ value: s, label: s }));
