import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Cpu, Factory, Award } from 'lucide-react';
import Fabric3DVisualizer from './Fabric3DVisualizer';

export default function Hero({ onExplore, onOpenAi, onCategorySelect }) {
  const quickPills = [
    { name: '14.5oz Indigo Denim', cat: 'Denim' },
    { name: 'Grade 6A Mulberry Silk', cat: 'Silk' },
    { name: 'Organic French Linen', cat: 'Linen' },
    { name: 'Super 120s Merino Wool', cat: 'Wool' },
    { name: '400 GSM Heavy Knit', cat: 'Knits' }
  ];

  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-16 md:pb-24 bg-gradient-to-b from-slate-100/80 via-slate-50 to-white dark:from-slate-950 dark:via-darkbg dark:to-slate-900 border-b border-slate-200/50 dark:border-slate-800/80">
      {/* Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-500/10 dark:bg-brand-500/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-purple-500/10 dark:bg-purple-500/15 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Copy & Actions */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-700 dark:text-brand-300 text-xs font-bold shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>AI-Driven Textile Intelligence & Verification</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              Direct Factory Sourcing for{' '}
              <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Premium Fabrics
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl font-normal leading-relaxed mx-auto lg:mx-0">
              Connect directly with verified textile mills worldwide. Filter by GSM, weave construction, composition, and MOQ using our natural language AI engine.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onExplore}
                className="px-6 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-xl shadow-brand-500/30 hover:shadow-brand-500/50 hover:scale-[1.02] transition-all flex items-center space-x-2"
              >
                <span>Browse Marketplace</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenAi}
                className="px-6 py-3.5 rounded-2xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-sm border border-slate-700/80 shadow-lg hover:scale-[1.02] transition-all flex items-center space-x-2"
              >
                <Cpu className="w-4 h-4 text-purple-400" />
                <span>Ask FabricMart AI</span>
              </button>
            </div>

            {/* Quick Filter Tags */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80">
              <span className="text-xs font-semibold text-slate-400 block mb-2">Trending Sourcing Specs:</span>
              <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                {quickPills.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => onCategorySelect(item.cat)}
                    className="px-3 py-1 rounded-full bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 transition"
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Interactive 3D Cloth Physics Preview Card */}
          <div className="lg:col-span-5 relative">
            <Fabric3DVisualizer fabricName="Indigo Ring-Spun Denim" color="#1e3a8a" gsm={420} />

            {/* Floating Live Metrics Badges */}
            <div className="absolute -bottom-6 -left-6 z-20 hidden sm:flex items-center space-x-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                <Factory className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">1,200+ Verified Mills</p>
                <p className="text-[10px] text-slate-500">GOTS & OEKO-TEX Audit</p>
              </div>
            </div>

            <div className="absolute -top-6 -right-6 z-20 hidden sm:flex items-center space-x-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Zero Escrow Risk</p>
                <p className="text-[10px] text-slate-500">B2B Net 30 Terms Available</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
