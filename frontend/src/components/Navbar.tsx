import React from 'react';
import { Button } from '@/components/ui/button';
import { BarChart2, TrendingUp, Compass, DollarSign } from 'lucide-react';
interface NavbarProps {
    view: 'landing' | 'prediction' | 'budget';
    setView: (view: 'landing' | 'prediction' | 'budget') => void;
}
const Navbar = ({ view, setView }: NavbarProps) => {
    const [isVisible, setIsVisible] = React.useState(true);
    React.useEffect(() => {
        const handleToggle = (e: any) => setIsVisible(!e.detail);
        window.addEventListener('compare-toggled', handleToggle);
        return () => window.removeEventListener('compare-toggled', handleToggle);
    }, []);
    if (!isVisible) return null;
    return (
        <nav className="fixed top-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[74%] md:max-w-5xl z-50 bg-[#bedec7] backdrop-blur-xl border border-[#044e22] shadow-xl shadow-[#044e22]/5 rounded-3xl px-4 md:px-6 py-2 md:py-3 flex justify-between items-center transition-all duration-500">
            {}
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('landing')}>
                <div className="bg-[#044e22] p-1.5 md:p-2 rounded-xl shadow-md shadow-[#044e22]/20 group-hover:bg-[#adc74d] transition-colors duration-300">
                    <Compass className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:text-[#044e22] transition-colors" />
                </div>
                <span className="font-black text-xl md:text-2xl text-[#044e22] tracking-tighter drop-shadow-sm">
                    Predicta<span className="text-[#adc74d]">PK</span>
                </span>
            </div>
            {}
            <div className="hidden md:flex items-center gap-1 bg-white/40 p-1.5 rounded-full border border-white/50 shadow-inner">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setView('landing')}
                    className={`rounded-full px-5 font-bold transition-all duration-300 ${view === 'landing' ? 'bg-[#044e22] text-[#adc74d] shadow-md scale-[1.02]' : 'text-[#044e22] hover:text-[#044e22] hover:bg-white/60'}`}
                >
                    <BarChart2 className="w-4 h-4 mr-2" /> Dashboard
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setView('prediction')}
                    className={`rounded-full px-5 font-bold transition-all duration-300 ${view === 'prediction' ? 'bg-[#044e22] text-[#adc74d] shadow-md scale-[1.02]' : 'text-[#044e22] hover:text-[#044e22] hover:bg-white/60'}`}
                >
                    <TrendingUp className="w-4 h-4 mr-2" /> Predict
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setView('budget')}
                    className={`rounded-full px-5 font-bold transition-all duration-300 ${view === 'budget' ? 'bg-[#044e22] text-[#adc74d] shadow-md scale-[1.02]' : 'text-[#044e22] hover:text-[#044e22] hover:bg-white/60'}`}
                >
                    <DollarSign className="w-4 h-4 mr-2" /> Budget
                </Button>
            </div>
            {}
            <div className="flex md:hidden gap-2 bg-white/40 p-1 rounded-full border border-white/50">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setView('landing')}
                    className={`rounded-full h-9 w-9 transition-all ${view === 'landing' ? 'bg-[#044e22] text-[#adc74d]' : 'text-[#044e22] hover:bg-white/60'}`}
                >
                    <BarChart2 className="w-4 h-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setView('prediction')}
                    className={`rounded-full h-9 w-9 transition-all ${view === 'prediction' ? 'bg-[#044e22] text-[#adc74d]' : 'text-[#044e22] hover:bg-white/60'}`}
                >
                    <TrendingUp className="w-4 h-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setView('budget')}
                    className={`rounded-full h-9 w-9 transition-all ${view === 'budget' ? 'bg-[#044e22] text-[#adc74d]' : 'text-[#044e22] hover:bg-white/60'}`}
                >
                    <DollarSign className="w-4 h-4" />
                </Button>
            </div>
        </nav>
    );
};
export default Navbar;
