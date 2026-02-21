"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PredictionForm from "@/components/PredictionForm"
import { Car, Bike, Home, Building } from "lucide-react"
interface DashboardTabsProps {
    history: any[];
    setHistory: React.Dispatch<React.SetStateAction<any[]>>;
    viewMode?: 'predict' | 'budget';
}

export default function DashboardTabs({ history, setHistory, viewMode }: DashboardTabsProps) {
    return (
        <Tabs defaultValue="auto" className="space-y-8 w-full">
            <div className="flex justify-center">
                <TabsList className="w-[360px] bg-[#badcc4] backdrop-blur-md border-2 border-[#044e22] p-1.5 h-auto rounded-2xl shadow-2xl shadow-[#044e22]/15">
                    <TabsTrigger
                        value="auto"
                        className="rounded-xl px-6 py-3 text-sm font-black text-[#044e22] data-[state=active]:!bg-[#044e22] data-[state=active]:!text-white data-[state=active]:!shadow-xl data-[state=active]:shadow-[#044e22]/40 transition-all duration-300 hover:text-[#044e22] hover:bg-[#044e22]/10 hover:scale-105 data-[state=active]:scale-100"
                    >
                        <Car className="w-4 h-4 mr-2" /> Automobile
                    </TabsTrigger>
                    <TabsTrigger
                        value="realestate"
                        className="rounded-xl px-6 py-3 text-sm font-black text-[#044e22] data-[state=active]:!bg-[#044e22] data-[state=active]:!text-white data-[state=active]:!shadow-xl data-[state=active]:shadow-[#044e22]/40 transition-all duration-300 hover:text-[#044e22] hover:bg-[#044e22]/10 hover:scale-105 data-[state=active]:scale-100"
                    >
                        <Home className="w-4 h-4 mr-2" /> Real Estate
                    </TabsTrigger>
                </TabsList>
            </div>
            <TabsContent value="auto" className="animate-in fade-in zoom-in-95 duration-500 ease-out">
                <Tabs defaultValue="car" className="w-full">
                    <div className="flex justify-center mb-4">
                        <TabsList className="w-[360px] bg-[#badcc4]/60 backdrop-blur-sm border border-[#044e22] p-1 h-auto rounded-xl shadow-md">
                            <TabsTrigger value="car" className="rounded-lg data-[state=active]:!bg-[#044e22] data-[state=active]:!text-white data-[state=active]:shadow-md text-[#044e22] font-semibold hover:text-[#044e22] hover:bg-[#044e22]/10 transition-colors">
                                <Car className="w-3.5 h-3.5 mr-2" /> Car Price
                            </TabsTrigger>
                            <TabsTrigger value="bike" className="rounded-lg data-[state=active]:!bg-[#044e22] data-[state=active]:!text-white data-[state=active]:shadow-md text-[#044e22] font-semibold hover:text-[#044e22] hover:bg-[#044e22]/10 transition-colors">
                                <Bike className="w-3.5 h-3.5 mr-2" /> Bike Price
                            </TabsTrigger>
                        </TabsList>
                    </div>
                    <TabsContent value="car"><PredictionForm category="car" history={history} setHistory={setHistory} viewMode={viewMode} /></TabsContent>
                    <TabsContent value="bike"><PredictionForm category="bike" history={history} setHistory={setHistory} viewMode={viewMode} /></TabsContent>
                </Tabs>
            </TabsContent>
            <TabsContent value="realestate" className="animate-in fade-in zoom-in-95 duration-500 ease-out">
                <Tabs defaultValue="buy" className="w-full">
                    <div className="flex justify-center mb-4">
                        <TabsList className="w-[360px] bg-[#badcc4]/60 backdrop-blur-sm border border-[#044e22] p-1 h-auto rounded-xl shadow-md">
                            <TabsTrigger value="buy" className="rounded-lg data-[state=active]:!bg-[#044e22] data-[state=active]:!text-white data-[state=active]:shadow-md text-[#044e22] font-semibold hover:text-[#044e22] hover:bg-[#044e22]/10 transition-colors">
                                <Home className="w-3.5 h-3.5 mr-2" /> Buy Property
                            </TabsTrigger>
                            <TabsTrigger value="rent" className="rounded-lg data-[state=active]:!bg-[#044e22] data-[state=active]:!text-white data-[state=active]:shadow-md text-[#044e22] font-semibold hover:text-[#044e22] hover:bg-[#044e22]/10 transition-colors">
                                <Building className="w-3.5 h-3.5 mr-2" /> Rent Property
                            </TabsTrigger>
                        </TabsList>
                    </div>
                    <TabsContent value="buy"><PredictionForm category="buy" history={history} setHistory={setHistory} viewMode={viewMode} /></TabsContent>
                    <TabsContent value="rent"><PredictionForm category="rent" history={history} setHistory={setHistory} viewMode={viewMode} /></TabsContent>
                </Tabs>
            </TabsContent>
        </Tabs>
    )
}
