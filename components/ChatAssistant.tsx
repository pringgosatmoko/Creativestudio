
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI } from '@google/genai';

interface ChatAssistantProps {
  onBack: () => void;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ onBack }) => {
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', text: string}[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const welcome = "Salam Master. Saya asisten cerdas Satmoko Studio. Apa yang bisa saya bantu untuk proyek kreatif Anda hari ini?";
    setMessages([{ role: 'assistant', text: welcome }]);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    const userMsg = input.trim();
    if (!userMsg || isTyping) return;
    
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        throw new Error("Sistem belum terkonfigurasi: API_KEY hilang di server.");
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          systemInstruction: "Anda adalah asisten cerdas pribadi milik Master Satmoko di Satmoko Studio. Anda ahli dalam AI, strategi kreatif, dan desain. Jawablah dengan nada profesional, berwibawa, namun membantu dalam Bahasa Indonesia.",
        },
      });

      const reply = response.text || "Maaf Master, saya mengalami gangguan pemrosesan data.";
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch (e: any) {
      console.error("AI Node Error:", e);
      setMessages(prev => [...prev, { role: 'assistant', text: `SISTEM ERROR: ${e.message || "Kegagalan komunikasi node."}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] lg:h-[calc(100vh-220px)] gap-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-2 px-2">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all shadow-xl">
            <i className="fa-solid fa-chevron-left text-xs"></i>
          </button>
          <div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter leading-none">Assistant <span className="text-cyan-400">Node</span></h2>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 mt-1">Status: Operational</p>
          </div>
        </div>
        <button onClick={() => setShowGuide(!showGuide)} className={`w-12 h-12 rounded-2xl border transition-all flex items-center justify-center ${showGuide ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)]' : 'bg-white/5 border-white/5 text-cyan-400'}`}>
          <i className="fa-solid fa-info text-xs"></i>
        </button>
      </div>

      <AnimatePresence>
        {showGuide && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="glass-panel p-6 rounded-[2.5rem] border-cyan-500/20 bg-cyan-500/10 mb-2">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center leading-relaxed">
                ASISTEN TERHUBUNG KE GEMINI 3 FLASH • PEMROSESAN NEURAL REAL-TIME
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={scrollRef} className="flex-1 glass-panel rounded-[3rem] p-8 space-y-8 overflow-y-auto custom-scrollbar bg-slate-950/60 shadow-inner relative border-white/5">
        {messages.map((m, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            key={i} 
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[88%] p-6 rounded-[2rem] shadow-2xl ${m.role === 'user' ? 'bg-cyan-600 text-white font-bold rounded-tr-none border border-cyan-400/30' : 'bg-[#1c232d] text-slate-200 border border-white/5 rounded-tl-none'}`}>
              <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{m.text}</p>
              <p className="text-[7px] opacity-30 mt-3 uppercase tracking-widest font-black text-right">
                {m.role === 'user' ? 'NODE_MASTER' : 'NODE_ASSISTANT'}
              </p>
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <div className="flex items-center gap-3 ml-6">
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
          </div>
        )}
      </div>

      <div className="flex gap-4 p-2.5 bg-slate-900/90 rounded-[2.5rem] border border-white/10 shadow-2xl focus-within:border-cyan-500/50 transition-all">
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
          placeholder="Masukkan instruksi atau pertanyaan..." 
          className="flex-1 bg-transparent px-8 py-5 focus:outline-none text-sm text-white placeholder:text-slate-600" 
        />
        <button 
          onClick={handleSend} 
          disabled={isTyping || !input.trim()} 
          className="w-14 h-14 rounded-full bg-white text-black hover:bg-cyan-400 transition-all flex items-center justify-center disabled:opacity-20 shadow-lg active:scale-90 group"
        >
          <i className="fa-solid fa-paper-plane text-xs"></i>
        </button>
      </div>
    </div>
  );
};
