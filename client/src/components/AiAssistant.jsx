import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Bot,
  X,
  Mic,
  MicOff,
  Send,
  Sparkles,
  Sliders,
  Scale,
  RefreshCw,
  Search,
  Check,
  ChevronRight
} from 'lucide-react';

export default function AiAssistant({
  isOpen,
  onClose,
  onApplyNluFilter,
  comparedProducts,
  onClearCompared
}) {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: 'Hello! I am your FabricMart AI Sourcing Assistant. Tell me what fabric you need (e.g. *"Show lightweight linen under $12"* or try Voice Speech input!).'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [comparisonResult, setComparisonResult] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, comparisonResult]);

  // Web Speech API Voice Input
  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your current browser. Please type your query.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    if (isListening) {
      setIsListening(false);
      return;
    }

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      sendMessage(transcript);
    };

    recognition.start();
  };

  const sendMessage = async (textToSend = inputText) => {
    if (!textToSend.trim()) return;

    const userMsg = { sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          userProfile: profile
        })
      });
      const data = await res.json();

      setMessages(prev => [
        ...prev,
        { sender: 'assistant', text: data.text, intent: data.intent }
      ]);

      // If AI produced a search filter intent, apply it to the main marketplace grid!
      if (data.intent === 'search_filter' && data.filter) {
        onApplyNluFilter(data.filter);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { sender: 'assistant', text: 'I parsed your search request and filtered the catalog grid for you!' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Perform multi-product comparison
  const runComparison = async () => {
    if (!comparedProducts || comparedProducts.length < 2) return;
    setIsLoading(true);
    try {
      const ids = comparedProducts.map(p => p._id || p.id);
      const res = await fetch('/api/ai/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds: ids })
      });
      const data = await res.json();
      setComparisonResult(data);
    } catch (err) {
      console.error('Comparison error', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col animate-slideLeft">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-brand-600 to-purple-600 text-white shadow-md">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              FabricMart AI Assistant
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </h3>
            <p className="text-[11px] text-slate-400">Natural Language & Voice Textile Search</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Multi-Product Comparison Bar */}
      {comparedProducts && comparedProducts.length > 0 && (
        <div className="px-6 py-3 bg-purple-950/40 border-b border-purple-800/40 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <Scale className="w-4 h-4 text-purple-400" />
            <span className="text-purple-200 font-semibold">{comparedProducts.length} items in compare tray</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={runComparison}
              className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold"
            >
              Compare Matrix
            </button>
            <button onClick={onClearCompared} className="text-slate-400 hover:text-slate-200">
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-brand-600 text-white rounded-br-none shadow-md'
                  : 'bg-slate-800 text-slate-200 border border-slate-700/70 rounded-bl-none'
              }`}
            >
              {msg.sender === 'assistant' && (
                <div className="flex items-center space-x-1.5 mb-1 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" />
                  <span>FabricMart Intelligence</span>
                </div>
              )}
              <div className="whitespace-pre-line">{msg.text}</div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 p-3 rounded-2xl text-xs text-slate-400 animate-pulse flex items-center space-x-2">
              <Bot className="w-4 h-4 text-indigo-400 animate-spin" />
              <span>Analyzing textile specifications...</span>
            </div>
          </div>
        )}

        {/* Product Comparison Matrix Result */}
        {comparisonResult && (
          <div className="p-4 rounded-2xl bg-slate-950 border border-purple-500/40 text-xs space-y-3">
            <div className="flex items-center justify-between font-bold text-purple-300">
              <span className="flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-purple-400" /> Comparison Spec Matrix
              </span>
              <button onClick={() => setComparisonResult(null)} className="text-slate-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2 overflow-x-auto">
              <table className="w-full text-left text-[11px] text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-1">Fabric</th>
                    <th className="py-1">GSM</th>
                    <th className="py-1">Price</th>
                    <th className="py-1">MOQ</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonResult.matrix?.map((row, i) => (
                    <tr key={i} className="border-b border-slate-800/60">
                      <td className="py-1.5 font-bold text-white truncate max-w-[100px]">{row.name}</td>
                      <td className="py-1.5 text-indigo-400">{row.gsm}</td>
                      <td className="py-1.5 text-emerald-400">{row.price}</td>
                      <td className="py-1.5 text-slate-400">{row.moq}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-slate-400 whitespace-pre-line border-t border-slate-800 pt-2">
              {comparisonResult.summary}
            </p>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Box with Voice Button */}
      <div className="p-4 border-t border-slate-800 bg-slate-950">
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder={isListening ? 'Listening to voice prompt...' : 'Ask AI e.g. "Find heavy denim under 500"...'}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            className="w-full pl-4 pr-24 py-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />

          <div className="absolute right-2 flex items-center space-x-1">
            <button
              onClick={toggleVoiceInput}
              className={`p-2 rounded-lg transition ${isListening ? 'bg-rose-600 text-white animate-bounce' : 'bg-slate-700 text-slate-300 hover:text-white'}`}
              title="Voice Input (Speech Recognition)"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <button
              onClick={() => sendMessage()}
              className="p-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
