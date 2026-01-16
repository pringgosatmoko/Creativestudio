
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageGeneratorProps {
  onBack: () => void;
}

export const ImageGenerator: React.FC<ImageGeneratorProps> = ({ onBack }) => {
  const [sourceImages, setSourceImages] = useState<string[]>([]);
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('Realistic');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  const stylePresets = [
    { name: 'Realistic', icon: 'fa-camera' },
    { name: 'Disney Pixar', icon: 'fa-clapperboard' },
    { name: '3D Render', icon: 'fa-cube' },
    { name: 'Anime', icon: 'fa-mask' },
    { name: 'Cyberpunk', icon: 'fa-bolt' },
    { name: 'Cinematic', icon: 'fa-film' }
  ];

  const ratios = ['1:1', '16:9', '9:16', '4:3'];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setSourceImages(prev => [...prev, reader.result as string].slice(0, 3));
      reader.readAsDataURL(file);
    });
  };

  const generateImage = async () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return;
    setIsGenerating(true);
    setResultImage(null);
    try {
      const ai = new GoogleGenAI({ apiKey });
      const parts: any[] = sourceImages.map(img => ({ inlineData: { data: img.split(',')[1], mimeType: 'image/png' } }));
      
      // Inject style into prompt for better results
      const styledPrompt = `${prompt}. Style: ${style}, high quality, detailed.`;
      parts.push({ text: styledPrompt });

      const response = await ai.models.generateContent({ 
        model: 'gemini-2.5-flash-image', 
        contents: { parts },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio as any
          }
        }
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) { 
          setResultImage(`data:image/png;base64,${part.inlineData.data}`); 
          break; 
        }
      }
    } catch (e: any) { 
      alert(e.message); 
    } finally { 
      setIsGenerating(false); 
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all"><i className="fa-solid fa-arrow-left"></i></button>
        <button onClick={() => setShowGuide(!showGuide)} className={`w-10 h-10 rounded-xl border transition-all flex items-center justify-center ${showGuide ? 'bg-fuchsia-500 text-black border-fuchsia-400 shadow-[0_0_15px_#d946ef]' : 'bg-white/5 border-white/5 text-fuchsia-400'}`}><i className="fa-solid fa-circle-question"></i></button>
        <h2 className="text-2xl font-black italic uppercase">Gambar <span className="text-fuchsia-500">AI</span></h2>
      </div>

      <AnimatePresence>
        {showGuide && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="glass-panel p-6 rounded-[2rem] border-fuchsia-500/20 bg-fuchsia-500/10 mb-4">
              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 rounded-2xl bg-fuchsia-500/20 flex items-center justify-center flex-shrink-0"><i className="fa-solid fa-wand-magic-sparkles text-fuchsia-400"></i></div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-bold">Pilih gaya favorit Master dan atur rasio gambar untuk kebutuhan publikasi yang berbeda. Master juga bisa menyisipkan referensi visual melalui tombol upload.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-5 space-y-6">
          <section className="glass-panel p-8 rounded-[2.5rem] space-y-6">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Visual Style Preset</label>
              <div className="grid grid-cols-3 gap-2">
                {stylePresets.map((s) => (
                  <button 
                    key={s.name}
                    onClick={() => setStyle(s.name)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${style === s.name ? 'bg-fuchsia-500/10 border-fuchsia-500 text-fuchsia-400' : 'bg-black/20 border-white/5 text-slate-600 hover:border-white/10'}`}
                  >
                    <i className={`fa-solid ${s.icon} text-sm`}></i>
                    <span className="text-[8px] font-black uppercase tracking-tighter">{s.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Aspect Ratio</label>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {ratios.map(r => (
                  <button 
                    key={r}
                    onClick={() => setAspectRatio(r)}
                    className={`px-4 py-2 rounded-xl border text-[10px] font-black transition-all flex-shrink-0 ${aspectRatio === r ? 'bg-white text-black border-white' : 'bg-black/20 border-white/5 text-slate-600'}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Visual Anchors (3)</label>
              <div className="grid grid-cols-3 gap-2">
                {sourceImages.map((img, i) => (
                  <div key={i} className="aspect-square bg-black/40 rounded-xl overflow-hidden relative group">
                    <img src={img} className="w-full h-full object-cover" />
                    <button onClick={() => setSourceImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[8px] opacity-0 group-hover:opacity-100"><i className="fa-solid fa-x"></i></button>
                  </div>
                ))}
                {sourceImages.length < 3 && (
                  <label className="aspect-square border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center cursor-pointer hover:bg-white/5">
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} multiple />
                    <i className="fa-solid fa-plus text-slate-700"></i>
                  </label>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Prompt Deskripsi</label>
              <textarea value={prompt} onChange={e => setPrompt(e.target.value)} className="w-full h-24 glass-input rounded-2xl p-4 text-xs text-white" placeholder="Jelaskan objek yang ingin dibuat..." />
            </div>

            <button onClick={generateImage} disabled={isGenerating || !prompt} className="w-full py-5 bg-white text-black font-black uppercase rounded-2xl disabled:opacity-50 active:scale-95 transition-all shadow-xl">
              {isGenerating ? "Synthesizing Core..." : "Synthesize Image"}
            </button>
          </section>
        </div>
        <div className="xl:col-span-7">
          <div className="glass-panel min-h-[500px] rounded-[3rem] flex items-center justify-center p-8 bg-black/20 relative overflow-hidden">
            {resultImage ? (
              <motion.img initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} src={resultImage} className="max-w-full rounded-2xl shadow-2xl relative z-10" />
            ) : (isGenerating ? (
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin w-12 h-12 border-4 border-slate-800 border-t-fuchsia-500 rounded-full"></div>
                <p className="text-[10px] font-black uppercase text-fuchsia-500 tracking-[0.3em] animate-pulse">Rendering Pixel...</p>
              </div>
            ) : (
              <div className="text-center opacity-20">
                <i className="fa-solid fa-panorama text-6xl mb-4"></i>
                <p className="text-[10px] font-black uppercase tracking-[0.5em]">Symmetry Hub Standby</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
