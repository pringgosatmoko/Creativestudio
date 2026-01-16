
import React, { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { motion, AnimatePresence } from 'framer-motion';

interface StudioCreatorProps {
  onBack: () => void;
}

export const StudioCreator: React.FC<StudioCreatorProps> = ({ onBack }) => {
  const [title, setTitle] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isAdMode, setIsAdMode] = useState(false);
  const [voicePreset, setVoicePreset] = useState('Kore'); // Kore (Male), Puck (Female)
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [totalDuration, setTotalDuration] = useState(15);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'input' | 'story' | 'render'>('input');
  const [storyboard, setStoryboard] = useState<{scene: string, visual: string, audio?: string, type?: string}[]>([]);
  const [showGuide, setShowGuide] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setImages(prev => [...prev, reader.result as string].slice(0, 3));
      reader.readAsDataURL(file);
    });
  };

  const constructProject = async () => {
    if (!title.trim() || !process.env.API_KEY) return;
    setIsProcessing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const parts: any[] = images.map(img => ({ inlineData: { data: img.split(',')[1], mimeType: 'image/png' } }));
      
      const systemPrompt = isAdMode 
        ? `Kamu adalah produser iklan ELIT di Satmoko Studio. Buat storyboard iklan produk: "${title}".
           Struktur WAJIB: 1. HOOK (Visual menarik), 2. PROBLEM (Empati), 3. SOLUTION (Produk), 4. CTA (Action).
           Output JSON array dengan properti: "scene", "visual" (English visual description for AI generation), "audio" (Naskah Voiceover yang persuasif), "type".`
        : `Bikin naskah film animasi pendek: "${title}". Berikan 4 adegan berurutan dengan narasi yang kuat. 
           Output JSON: "scene", "visual" (Detailed English description), "audio" (Narrator script).`;

      parts.push({ text: systemPrompt });

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview', // Upgraded for high-quality complex logic
        contents: { parts },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                scene: { type: Type.STRING },
                visual: { type: Type.STRING },
                audio: { type: Type.STRING },
                type: { type: Type.STRING }
              }
            }
          }
        }
      });

      setStoryboard(JSON.parse(response.text || '[]'));
      setStep('story');
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 px-2 lg:px-0">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all">
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <button onClick={() => setShowGuide(!showGuide)} className={`w-10 h-10 rounded-xl border transition-all flex items-center justify-center ${showGuide ? 'bg-yellow-500 text-black border-yellow-400 shadow-[0_0_15px_#eab308]' : 'bg-white/5 border-white/5 text-yellow-400'}`}>
            <i className="fa-solid fa-circle-question"></i>
          </button>
          <h2 className="text-2xl font-black italic uppercase">Studio <span className="text-yellow-500">Pro</span></h2>
        </div>
      </div>

      <AnimatePresence>
        {showGuide && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="glass-panel p-6 rounded-[2rem] border-yellow-500/20 bg-yellow-500/10 mb-4">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-2xl bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-bolt text-yellow-400"></i>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-bold">
                  <span className="text-yellow-400 uppercase tracking-widest">Otomasi Produksi:</span> Mode Iklan akan menyusun strategi pemasaran (Hook-Problem-Solusi), sementara Mode Normal fokus pada narasi cerita. AI Pro akan merancang pipeline visual & audio Master secara otomatis.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {step === 'input' && (
          <motion.div key="input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto space-y-6">
            <div className="glass-panel p-8 rounded-[3rem] space-y-6 bg-[#0d1117]/80">
              <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                  <i className={`fa-solid fa-bullhorn ${isAdMode ? 'text-yellow-400 shadow-[0_0_10px_#eab308]' : 'text-slate-600'}`}></i>
                  <span className="text-xs font-black uppercase italic">Smart Ad Mode</span>
                </div>
                <button onClick={() => setIsAdMode(!isAdMode)} className={`w-12 h-6 rounded-full transition-all relative ${isAdMode ? 'bg-yellow-500' : 'bg-slate-800'}`}>
                  <motion.div animate={{ x: isAdMode ? 24 : 4 }} className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md"></motion.div>
                </button>
              </div>

              {isAdMode && (
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setVoicePreset('Kore')} className={`py-3 rounded-xl border text-[10px] font-black uppercase transition-all ${voicePreset === 'Kore' ? 'bg-yellow-500/10 border-yellow-500 text-yellow-400' : 'border-white/5 text-slate-600'}`}>Pria (Kore)</button>
                  <button onClick={() => setVoicePreset('Puck')} className={`py-3 rounded-xl border text-[10px] font-black uppercase transition-all ${voicePreset === 'Puck' ? 'bg-yellow-500/10 border-yellow-500 text-yellow-400' : 'border-white/5 text-slate-600'}`}>Wanita (Puck)</button>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500">Visual Anchors (Max 3)</label>
                <div className="grid grid-cols-3 gap-2">
                  {images.map((img, i) => (
                    <div key={i} className="aspect-square bg-black/40 rounded-xl overflow-hidden relative border border-white/5">
                      <img src={img} className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {images.length < 3 && (
                    <label className="aspect-square border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center cursor-pointer hover:bg-white/5 transition-all">
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} multiple />
                      <i className="fa-solid fa-plus text-slate-700"></i>
                    </label>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500">Judul Project / Produk</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder={isAdMode ? "Iklan Kopi Gayo..." : "Kisah Robot Masa Depan..."} className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 px-6 text-sm font-black text-white focus:outline-none focus:border-yellow-500/50 placeholder:text-slate-800" />
              </div>

              <button onClick={constructProject} disabled={isProcessing || !title} className="w-full py-5 bg-white text-black font-black uppercase rounded-2xl shadow-2xl active:scale-95 transition-all hover:bg-yellow-400">
                {isProcessing ? "Synthesizing Pipeline..." : "Construct Storyboard"}
              </button>
            </div>
          </motion.div>
        )}

        {step === 'story' && (
          <motion.div key="story" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/5">
              <h3 className="text-2xl font-black italic uppercase">Storyboard: <span className="text-yellow-500">{title}</span></h3>
              <button onClick={() => setStep('input')} className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase hover:bg-white hover:text-black transition-all">Edit Pipeline</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {storyboard.map((scene, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: i * 0.1 }}
                  key={i} 
                  className="glass-panel p-7 rounded-[2.5rem] border-white/5 relative bg-[#0d1117]/80 flex flex-col gap-5"
                >
                  <div className="absolute top-0 right-8 px-4 py-1.5 bg-yellow-500 text-black text-[9px] font-black uppercase rounded-b-xl shadow-lg">{scene.type || `SCENE ${i+1}`}</div>
                  <h4 className="text-[12px] font-black uppercase text-yellow-500 tracking-wider mb-2">{scene.scene}</h4>
                  <div className="space-y-4">
                    <div className="p-4 bg-black/40 rounded-2xl border border-white/5 shadow-inner">
                      <p className="text-[9px] text-slate-500 uppercase font-black mb-2 tracking-widest">Visual Prompt</p>
                      <p className="text-[11px] text-slate-200 leading-relaxed font-medium">{scene.visual}</p>
                    </div>
                    {scene.audio && (
                      <div className="p-4 bg-yellow-500/5 rounded-2xl border border-yellow-500/10">
                        <p className="text-[9px] text-yellow-500/60 uppercase font-black mb-2 tracking-widest">Voiceover ({voicePreset})</p>
                        <p className="text-[11px] font-black text-white italic leading-relaxed">"{scene.audio}"</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
            <button className="w-full py-6 bg-yellow-500 text-black font-black uppercase rounded-3xl shadow-[0_10px_40px_rgba(234,179,8,0.2)] hover:bg-yellow-400 active:scale-[0.98] transition-all tracking-[0.2em] text-sm">
              Execute Project Final Render
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
