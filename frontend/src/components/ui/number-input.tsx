import * as React from "react"
import { ChevronUp, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
export interface NumberInputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
    onChange?: (value: string | number) => void
    stepAmount?: number
}
const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
    ({ className, onChange, value, stepAmount = 1, ...props }, ref) => {
        const inputRef = React.useRef<HTMLInputElement>(null)
        const handleIncrement = (e: React.MouseEvent) => {
            e.preventDefault()
            const current = Number(value || 0)
            const next = current + stepAmount
            if (onChange) onChange(next)
        }
        const handleDecrement = (e: React.MouseEvent) => {
            e.preventDefault()
            const current = Number(value || 0)
            const next = current >= stepAmount ? current - stepAmount : 0
            if (onChange) onChange(next)
        }
        return (
            <div className="relative">
                <Input
                    type="number"
                    className={cn("no-spinners pr-10", className)}
                    ref={ref}
                    value={value}
                    onChange={(e) => onChange && onChange(e.target.value)}
                    {...props}
                />
                <div className="absolute right-1 top-1 bottom-1 flex flex-col border-l border-[#044e22] w-8">
                    <button
                        type="button"
                        onClick={handleIncrement}
                        className="flex-1 flex items-center justify-center text-[#044e22] hover:bg-[#044e22] hover:text-[#e2f0e6] rounded-tr-lg transition-colors"
                    >
                        <ChevronUp className="h-3 w-3" />
                    </button>
                    { }
                    <div className="h-[1px] bg-[#044e22]" />
                    <button
                        type="button"
                        onClick={handleDecrement}
                        className="flex-1 flex items-center justify-center text-[#044e22] hover:bg-[#044e22] hover:text-[#e2f0e6] rounded-br-lg transition-colors"
                    >
                        <ChevronDown className="h-3 w-3" />
                    </button>
                </div>
            </div>
        )
    }
)
NumberInput.displayName = "NumberInput"
export { NumberInput }
