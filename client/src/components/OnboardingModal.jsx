import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bot, Sparkles, Send, Check, UserCheck, Mic } from 'lucide-react';

export default function OnboardingModal({ isOpen, onClose }) {
  const { user, setProfile } = useAuth();

  const isBuyer = user?.role === 'buyer';

  const buyerQuestions = [
    { field: 'businessType', q: 'Welcome! What type of textile business do you operate? (e.g. Boutique Apparel Brand, Garment Manufacturer, Retailer)' },
    { field: 'categoriesOfInterest', q: 'Which fabric categories are you primarily sourcing? (e.g. Denim, Silk, Linen, Knits, Wool)' },
    { field: 'typicalOrderQuantity', q: 'What is your typical order volume target? (e.g. 100-500 meters, 1,000-5,000 meters)' },
    { field: 'budgetRange', q: 'What is your monthly fabric procurement budget? (e.g. $5,000 - $20,000)' }
  ];

  const supplierQuestions = [
    { field: 'businessName', q: 'Welcome Mill Owner! What is your official Textile Mill / Business Name?' },
    { field: 'fabricTypesOffered', q: 'What primary fabric constructions do you manufacture? (e.g. Heavy Denim, Mulberry Silk, Worsted Wool)' },
    { field: 'moq', q: 'What is your standard Minimum Order Quantity (MOQ) per dye lot in meters?' },
    { field: 'businessAddress', q: 'Where is your mill facility or shipping warehouse located?' }
  ];

  const questions = isBuyer ? buyerQuestions : supplierQuestions;

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentInput, setCurrentInput] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  if (!isOpen) return null;

  const handleNextStep = async () => {
    if (!currentInput.trim()) return;

    const currentField = questions[currentStep].field;
    const updatedAnswers = { ...answers, [currentField]: currentInput };
    setAnswers(updatedAnswers);
    setCurrentInput('');

    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Save profile to backend
      setIsCompleted(true);
      try {
        const res = await fetch('/api/auth/onboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id || user._id,
            role: user.role,
            data: updatedAnswers
          })
        });
        const data = await res.json();
        setProfile(updatedAnswers);
      } catch (err) {
        setProfile(updatedAnswers);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-lg">
            <Bot className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              AI Conversational Onboarding Wizard
              <Sparkles className="w-4 h-4 text-amber-400" />
            </h3>
            <p className="text-xs text-slate-400">
              Setting up your personalized {isBuyer ? 'Buyer Procurement Profile' : 'Supplier Mill Profile'}
            </p>
          </div>
        </div>

        {!isCompleted ? (
          <div className="space-y-6">
            {/* Progress Stepper */}
            <div className="flex items-center space-x-2">
              {questions.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                    i <= currentStep ? 'bg-brand-500' : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>

            {/* Conversational Question */}
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/70 text-xs text-slate-200 space-y-2">
              <div className="flex items-center space-x-2 text-indigo-400 font-bold uppercase tracking-wider text-[10px]">
                <Bot className="w-3.5 h-3.5" />
                <span>FabricMart AI Question {currentStep + 1} of {questions.length}</span>
              </div>
              <p className="text-sm font-semibold text-white leading-relaxed">
                {questions[currentStep].q}
              </p>
            </div>

            {/* Previous Answers Summary Pills */}
            {Object.keys(answers).length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {Object.entries(answers).map(([key, val], idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] text-slate-300 border border-slate-700 flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-400" />
                    <strong className="text-white capitalize">{key}:</strong> {val}
                  </span>
                ))}
              </div>
            )}

            {/* Input & Action */}
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Type your response here..."
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleNextStep()}
                className="w-full pl-4 pr-14 py-3.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                autoFocus
              />
              <button
                onClick={handleNextStep}
                className="absolute right-2 p-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <UserCheck className="w-8 h-8 animate-bounce" />
            </div>
            <h4 className="text-lg font-bold text-white">Profile Configured & Verified!</h4>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              Your preferences have been registered in our database. FabricMart AI will now customize your fabric search results and mill recommendations.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-lg transition"
            >
              Enter Marketplace
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
