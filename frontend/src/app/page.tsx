"use client"
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Dashboard from "@/components/PredictionForm/Dashboard"
import Navbar from "@/components/Navbar"
const DashboardTabs = dynamic(() => import('@/components/DashboardTabs'), {
  ssr: false,
})
const ParticleField = () => {
  const [particles, setParticles] = useState<Array<{ left: string; top: string; animationDuration: string; animationDelay: string }>>([])
  useEffect(() => {
    const newParticles = [...Array(40)].map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDuration: `${5 + Math.random() * 10}s`,
      animationDelay: `${Math.random() * 5}s`
    }))
    setParticles(newParticles)
  }, [])
  return (
    <div className="absolute inset-0">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute w-1.5 h-1.5 bg-[#044e22] rounded-full shadow-lg shadow-[#044e22]/50"
          style={{
            left: p.left,
            top: p.top,
            animation: `particle-float ${p.animationDuration} ease-in-out infinite`,
            animationDelay: p.animationDelay
          }}
        />
      ))}
    </div>
  )
}
export default function Page() {
  const [view, setView] = useState<'landing' | 'prediction' | 'budget'>('landing')
  const [history, setHistory] = useState<any[]>([])
  useEffect(() => {
    const savedHistory = localStorage.getItem('predicta_history')
    if (savedHistory) {
      try { setHistory(JSON.parse(savedHistory)) } catch (e) { console.error(e) }
    }
  }, []) 
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('predicta_history', JSON.stringify(history));
    }
  }, [history]);
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-white to-gray-50 overflow-hidden flex flex-col items-center justify-center selection:bg-emerald-500/20 selection:text-emerald-900">
      <Navbar view={view} setView={setView} />
      { }
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        { }
        <div className="absolute inset-0 bg-gradient-to-br from-[#e2f0e6] via-[#e2f0e6]/50 to-white" />
        { }
        <div className="absolute inset-0 opacity-[0.3]" style={{
          backgroundImage: `
            linear-gradient(30deg, transparent 48%, #4ea96b 49%, #4ea96b 51%, transparent 52%),
            linear-gradient(150deg, transparent 48%, #044e22 49%, #044e22 51%, transparent 52%),
            linear-gradient(90deg, transparent 48%, #4ea96b 49%, #4ea96b 51%, transparent 52%)
          `,
          backgroundSize: '80px 46px, 80px 46px, 40px 69px',
          animation: 'grid-shift 20s linear infinite'
        }} />
        { }
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#badcc4]/40 via-transparent to-transparent opacity-60 animate-wave-1" />
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-[#4ea96b]/10 via-transparent to-transparent opacity-50 animate-wave-2" />
          <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-tr from-[#e2f0e6]/50 via-transparent to-transparent opacity-40 animate-wave-3" />
        </div>
        { }
        <div className="absolute top-[15%] left-[10%] w-96 h-96 rounded-full bg-emerald-200/25 blur-[120px] animate-float-drift-1" />
        <div className="absolute top-[60%] right-[15%] w-80 h-80 rounded-full bg-green-300/20 blur-[100px] animate-float-drift-2" />
        <div className="absolute bottom-[25%] left-[45%] w-72 h-72 rounded-full bg-emerald-100/30 blur-[90px] animate-float-drift-3" />
        { }
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute h-px w-full top-[40%] bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent animate-scan-line" />
        </div>
        { }
        <ParticleField />
        { }
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.015] mix-blend-overlay" />
        { }
        <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-gradient-radial from-emerald-200/30 to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-gradient-radial from-green-200/30 to-transparent blur-3xl" />
      </div>
      <div id="predicta-main-container" className="relative z-10 w-full max-w-5xl px-4 pt-24 pb-8 md:pt-32 md:pb-12">
        { }
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-6 text-center space-y-5"
        >
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/10 border border-[#044e22] shadow-lg shadow-emerald-500/10 mb-4 group ring-1 ring-[#4ea96b]/50 hover:shadow-xl hover:shadow-emerald-500/20 transition-all duration-300 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#044e22] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#044e22]"></span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#044e22] group-hover:text-[#044e22] transition-colors">Next-Gen AI Valuation</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#044e22] via-[#4ea96b] to-[#044e22] drop-shadow-[0_2px_rgba(4,78,34,0.3)] mb-2">
            PredictaPK
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold text-[#044e22] tracking-wide mb-4">
            Real Time Market Valuator
          </h2>
          <p className="text-[#044e22] text-sm md:text-base max-w-2xl mx-auto font-medium leading-relaxed opacity-90">
            Unlocking market intelligence for <span className="font-bold underline decoration-[#4ea96b] decoration-2 underline-offset-4">Vehicles</span> & <span className="font-bold underline decoration-[#4ea96b] decoration-2 underline-offset-4">Real Estate</span> with precision AI.
            Get instant accurate valuations, track market trends, and make informed decisions with our advanced prediction engine.
          </p>
        </motion.header>
        {view === 'landing' ? (
          <Dashboard
            recentSearches={history}
            onStartPrediction={() => setView('prediction')}
            onDeleteSearch={(idx) => {
              const newHistory = [...history];
              newHistory.splice(idx, 1);
              setHistory(newHistory);
              localStorage.setItem('predicta_history', JSON.stringify(newHistory));
            }}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="-mt-4 w-full flex flex-col items-center"
          >
            <DashboardTabs history={history} setHistory={setHistory} viewMode={view === 'budget' ? 'budget' : 'predict'} />
          </motion.div>
        )}
        <footer className="mt-20 text-center border-t border-emerald-100 pt-8">
          <p className="text-gray-500 text-sm font-medium hover:text-[#044e22] transition-colors cursor-pointer">
            © {new Date().getFullYear()} Predicta PK. Precision Intelligence.
          </p>
        </footer>
      </div>
    </main >
  )
}