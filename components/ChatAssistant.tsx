
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

interface ChatAssistantProps {
  onBack: () => void;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ onBack }) => {
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', text: string}[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const getEnv = (key: string) => {
    const vEnv = (import.meta as any).env || {};
    const pEnv = (typeof process !== 'undefined' ? process.env : {}) || {};
    const wEnv = (window as any).process?.env || {};
    const fallbacks: Record<string, string> = {
      'VITE_DATABASE_URL': 'https://urokqoorxuiokizesiwa.supabase.co',
      'VITE_SUPABASE_ANON_KEY': 'sb_publishable_G1udRukMNJjDM6wlVD3xtw_IF8Yrbd8'
    };
    return vEnv[key] || pEnv[key] || wEnv[key] || fallbacks[key] || "";
  };

  const supabase = useMemo(() => createClient(getEnv('VITE_DATABASE_URL'), getEnv('VITE_SUPABASE_ANON_KEY')), []);

  useEffect(() => {
    const welcome = "Halo. Asisten Satmoko bot siap melayani. Saya telah disinkronkan dengan seluruh modul kreatif di Satmoko Studio. Ada yang bisa saya bantu, Master?";
    setMessages([{ role: 'assistant', text: welcome }]);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("API Key tidak ditemukan.");

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          systemInstruction: `Kamu adalah "Asisten Satmoko bot", AI elit di "Satmoko Studio". Sapa user dengan Master.`,
        },
      });

      const reply = response.text || "Gagal sinkronisasi data.";
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'assistant', text: `ERROR: ${e.message}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] gap-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-2 px-2">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all">
            <i className="fa-solid fa-chevron-left text-xs"></i>
          </button>
          <button onClick={() => setShowGuide(!showGuide)} className={`w-10 h-10 rounded-xl border transition-all flex items-center justify-center ${showGuide ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_#22d3ee]' : 'bg-white/5 border-white/5 text-cyan-400'}`}>
            <i className="fa-solid fa-circle-question"></i>
          </button>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/5 border border-cyan-500/10">
           <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></div>
           <span className="text-[9px] font-black text-cyan-500 uppercase tracking-widest">Bot Status: Optimized</span>
        </div>
      </div>

      <AnimatePresence>
        {showGuide && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="glass-panel p-5 rounded-3xl border-cyan-500/20 bg-cyan-500/10 mb-2 relative">
              <button onClick={() => setShowGuide(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><i className="fa-solid fa-xmark text-xs"></i></button>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-brain-circuit text-cyan-400"></i>
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-white mb-1">Mengenal Asisten Bot</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-medium">Partner diskusi cerdas Anda. Gunakan untuk curhat ide kreatif atau bertanya cara pakai aplikasi. Ketik apa saja, AI akan merespon segera.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={scrollRef} className="flex-1 glass-panel rounded-[2.5rem] p-6 lg:p-8 space-y-6 overflow-y-auto custom-scrollbar bg-slate-900/40 shadow-inner">
        {messages.map((m, i) => (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-5 rounded-[1.8rem] shadow-xl ${m.role === 'user' ? 'bg-cyan-500 text-black font-bold rounded-tr-none' : 'bg-slate-800 text-slate-200 border border-white/5 rounded-tl-none'}`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <div className="flex justify-start"><div className="bg-white/5 p-4 rounded-2xl flex gap-1.5 items-center"><span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce"></span><span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.2s]"></span><span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.4s]"></span></div></div>
        )}
      </div>

      <div className="flex gap-4 p-2 bg-slate-900/60 rounded-[2.2rem] border border-white/5 focus-within:border-cyan-500/50 transition-all shadow-2xl backdrop-blur-2xl">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Tanyakan sesuatu..." className="flex-1 bg-transparent px-6 py-4 focus:outline-none text-sm text-white" />
        <button onClick={handleSend} disabled={isTyping || !input.trim()} className="w-12 h-12 rounded-full bg-white text-black hover:bg-cyan-400 transition-all flex items-center justify-center disabled:opacity-50"><i className="fa-solid fa-paper-plane"></i></button>
      </div>
    </div>
  );
};
