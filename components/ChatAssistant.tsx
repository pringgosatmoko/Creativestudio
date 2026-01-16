
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { GoogleGenAI } from '@google/genai';

interface ChatAssistantProps {
  onBack: () => void;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ onBack }) => {
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', text: string}[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const welcome = "Halo. Satmoko Intelligence Core siap melayani. Saya telah disinkronkan dengan seluruh modul kreatif di Satmoko Studio. Ada yang bisa saya bantu, Master?";
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
      const getEnv = (key: string) => {
        const vEnv = (import.meta as any).env || {};
        const pEnv = (typeof process !== 'undefined' ? process.env : {}) || {};
        const wEnv = (window as any).process?.env || {};
        return vEnv[key] || pEnv[key] || wEnv[key] || "";
      };

      const apiKey = getEnv('VITE_GEMINI_API_KEY_1') || 
                     getEnv('VITE_GEMINI_API_KEY_2') || 
                     getEnv('VITE_GEMINI_API_KEY_3') || 
                     getEnv('VITE_API_KEY') || 
                     getEnv('API_KEY');

      if (!apiKey) {
        throw new Error("API Key tidak ditemukan. Master, pastikan 'VITE_GEMINI_API_KEY_1' sudah diset.");
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          systemInstruction: `
            IDENTITAS: Kamu adalah "Satmoko Intelligence Core", AI elit yang terintegrasi di dalam aplikasi "Satmoko Studio".
            MASTER: Master Pringgosatmoko.
            
            PENGETAHUAN PRODUK (FITUR APP):
            1. Intelligence (Neural Core Chat): Modul chat ini sendiri untuk asistensi ide.
            2. Visual Arts: Fitur Image Synthesis menggunakan Gemini 2.5 Flash Image untuk menciptakan artefak visual (gambar) dari teks atau referensi gambar.
            3. Motion Studio (Video Engine): Menggunakan mesin Google Veo (veo-3.1) untuk merender video berkualitas tinggi (text-to-video atau image-to-video).
            4. Automation (Smart Workflows): Modul orkestrasi otomatis untuk membuat storyboard dan alur cerita kreatif secara instan.
            5. Records Hub: Panel kontrol database untuk manajemen user (Khusus Admin).
            
            TUGAS:
            - Bantu user/Master memahami cara kerja tiap fitur.
            - Berikan saran kreatif untuk prompt gambar atau video.
            - Jika ditanya tentang aplikasi ini, jelaskan sebagai portal kreatif AI paling elit di ekosistem Satmoko.
            
            GAYA BAHASA:
            - Gunakan bahasa Indonesia yang Elegan, Profesional, dan Sedikit Futuristik.
            - Jawaban harus Padat, Berwibawa, namun Sangat Membantu.
            - Sapa user dengan sebutan "Master" jika itu Pringgo, atau "Operator" jika user umum.
          `,
        },
      });

      const reply = response.text || "Terjadi gangguan pada transmisi data, Master.";
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch (e: any) {
      console.error("Gemini SDK Error:", e);
      setMessages(prev => [...prev, { role: 'assistant', text: `SYNC ERROR: ${e.message}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] gap-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-2 px-2">
        <button onClick={onBack} className="group flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all shadow-lg">
          <i className="fa-solid fa-chevron-left text-xs group-hover:-translate-x-1 transition-transform text-slate-400"></i>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-white">Back</span>
        </button>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/5 border border-cyan-500/10">
           <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></div>
           <span className="text-[9px] font-black text-cyan-500 uppercase tracking-widest">Core Status: Optimized</span>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 glass-panel rounded-[2.5rem] p-6 lg:p-8 space-y-6 overflow-y-auto custom-scrollbar bg-slate-900/40">
        {messages.map((m, i) => (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-5 rounded-[1.5rem] shadow-xl ${m.role === 'user' ? 'bg-cyan-500 text-black font-bold' : 'bg-slate-800 text-slate-200 border border-white/5'}`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/5 p-4 rounded-2xl flex gap-1.5 items-center">
              <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-4 p-2 bg-slate-900/60 rounded-[2.2rem] border border-white/5 focus-within:border-cyan-500/50 transition-all shadow-2xl backdrop-blur-2xl">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Tanyakan sesuatu tentang Satmoko Studio..."
          className="flex-1 bg-transparent px-6 py-4 focus:outline-none text-sm text-white"
        />
        <button onClick={handleSend} disabled={isTyping || !input.trim()} className="w-12 h-12 rounded-full bg-white text-black hover:bg-cyan-400 transition-all flex items-center justify-center disabled:opacity-50">
          <i className="fa-solid fa-paper-plane"></i>
        </button>
      </div>
    </div>
  );
};
