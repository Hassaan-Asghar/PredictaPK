"use client"

import * as React from "react"
import { Check, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface ComboboxProps {
    options: { value: string; label: string }[]
    value: string
    onChange: (value: string) => void
    placeholder?: string
    searchPlaceholder?: string
    emptyText?: string
    disabled?: boolean
}

export function Combobox({
    options,
    value,
    onChange,
    placeholder = "Select option...",
    searchPlaceholder = "Search...",
    emptyText = "No option found.",
    disabled = false,
}: ComboboxProps) {
    const [open, setOpen] = React.useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between glass-input bg-[#e2f0e6] hover:bg-[#e2f0e6]/90 text-[#044e22] border-2 border-[#044e22] data-[placeholder]:text-[#044e22]/80 rounded-xl h-12 shadow-sm transition-all disabled:opacity-100 disabled:bg-[#e2f0e6] disabled:cursor-not-allowed group/combo pr-10 relative"
                    disabled={disabled}
                >
                    {value
                        ? options.find((option) => option.value === value)?.label || value
                        : <span className="text-[#044e22]/60">{placeholder}</span>}
                    <div className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center border-l border-[#044e22] rounded-r-lg group-hover/combo:bg-[#044e22] group-hover/combo:text-white transition-colors">
                        <ChevronDown className="h-4 w-4 shrink-0 opacity-50 text-[#044e22] group-hover/combo:text-white group-hover/combo:opacity-100" />
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-[--radix-popover-trigger-width] p-0 bg-[#e2f0e6] border-2 border-[#044e22] text-[#044e22] shadow-2xl shadow-[#044e22]/10 overflow-hidden rounded-xl z-50"
                style={{ width: 'var(--radix-popover-trigger-width)' }}
            >
                <Command
                    className="bg-[#e2f0e6] border-none text-[#044e22]"
                    filter={(value, search) => {
                        if (value.toLowerCase().includes(search.toLowerCase())) return 1
                        return 0
                    }}
                >
                    <CommandInput placeholder={searchPlaceholder} className="text-[#044e22] placeholder:text-[#044e22]/60 border-b border-[#044e22]" />
                    <CommandList className="max-h-[250px] overflow-y-auto p-1 custom-scrollbar">
                        <CommandEmpty className="py-6 text-center text-sm text-[#044e22]">{emptyText}</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.label}
                                    onSelect={(currentValue) => {
                                        onChange(option.value === value ? "" : option.value)
                                        setOpen(false)
                                    }}
                                    className="data-[selected=true]:bg-[#044e22] data-[selected=true]:text-white aria-selected:bg-[#044e22] aria-selected:text-white text-[#044e22] cursor-pointer rounded-lg my-0.5 px-3 py-3 transition-colors hover:bg-[#044e22] hover:text-white font-medium group"
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4 text-current",
                                            value === option.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
