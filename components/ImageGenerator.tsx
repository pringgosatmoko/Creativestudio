
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageGeneratorProps {
  onBack: () => void;
}

export const ImageGenerator: React.FC<ImageGeneratorProps> = ({ onBack }) => {
  const [sourceImages, setSourceImages] = useState<string[]>([]);
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('Nyata');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  const stylePresets = [
    { name: 'Nyata', icon: 'fa-camera' },
    { name: 'Animasi 3D', icon: 'fa-clapperboard' },
    { name: 'Seni Lukis', icon: 'fa-palette' },
    { name: 'Anime', icon: 'fa-mask' },
    { name: 'Cyberpunk', icon: 'fa-bolt' },
    { name: 'Sinematik', icon: 'fa-film' }
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
    if (!apiKey) {
      alert("API Key tidak ditemukan.");
      return;
    }
    
    setIsGenerating(true);
    setResultImage(null);
    
    try {
      const ai = new GoogleGenAI({ apiKey });
      const parts: any[] = sourceImages.map(img => {
        const mimeType = img.match(/data:([^;]+);/)?.[1] || 'image/png';
        const data = img.split(',')[1];
        return { inlineData: { data, mimeType } };
      });
      
      const styledPrompt = `${prompt}. Gaya: ${style}, kualitas tinggi, detail tajam.`;
      parts.push({ text: styledPrompt });

      const response = await ai.models.generateContent({ 
        model: 'gemini-2.5-flash-image', 
        contents: { parts },
        config: { imageConfig: { aspectRatio: aspectRatio as any } }
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) { 
          setResultImage(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`); 
          break; 
        }
      }
    } catch (e: any) { 
      alert("Gagal membuat gambar: " + e.message);
    } finally { 
      setIsGenerating(false); 
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all"><i className="fa-solid fa-arrow-left"></i></button>
        <button onClick={() => setShowGuide(!showGuide)} className={`w-10 h-10 rounded-xl border transition-all flex items-center justify-center ${showGuide ? 'bg-fuchsia-500 text-black border-fuchsia-400 shadow-[0_0_15px_#d946ef]' : 'bg-white/5 border-white/5 text-fuchsia-400'}`}><i className="fa-solid fa-circle-question"></i></button>
        <h2 className="text-2xl font-black italic uppercase">Buat <span className="text-fuchsia-500">Gambar</span></h2>
      </div>

      <AnimatePresence>
        {showGuide && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="glass-panel p-6 rounded-[2rem] border-fuchsia-500/20 bg-fuchsia-500/10 mb-4">
              <p className="text-[11px] text-slate-400 leading-relaxed font-bold">Pilih gaya gambar, ukuran layar, dan tulis deskripsi gambar yang ingin Anda buat. AI akan memproses permintaan Anda dalam hitungan detik.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-5 space-y-6">
          <section className="glass-panel p-8 rounded-[2.5rem] space-y-6">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-slate-500">Pilih Gaya</label>
              <div className="grid grid-cols-3 gap-2">
                {stylePresets.map((s) => (
                  <button key={s.name} onClick={() => setStyle(s.name)} className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${style === s.name ? 'bg-fuchsia-500/10 border-fuchsia-500 text-fuchsia-400' : 'bg-black/20 border-white/5 text-slate-600 hover:border-white/10'}`}>
                    <i className={`fa-solid ${s.icon} text-sm`}></i>
                    <span className="text-[8px] font-black uppercase">{s.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-slate-500">Ukuran Gambar</label>
              <div className="flex gap-2">
                {ratios.map(r => (
                  <button key={r} onClick={() => setAspectRatio(r)} className={`px-4 py-2 rounded-xl border text-[10px] font-black transition-all ${aspectRatio === r ? 'bg-white text-black' : 'bg-black/20 border-white/5 text-slate-600'}`}>{r}</button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500">Deskripsi Gambar</label>
              <textarea value={prompt} onChange={e => setPrompt(e.target.value)} className="w-full h-24 bg-black/40 border border-white/10 rounded-2xl p-4 text-xs text-white outline-none" placeholder="Contoh: Seekor kucing lucu menggunakan kacamata sedang bersantai di pantai..." />
            </div>

            <button onClick={generateImage} disabled={isGenerating || !prompt} className="w-full py-5 bg-white text-black font-black uppercase rounded-2xl hover:bg-fuchsia-400 transition-all shadow-xl">
              {isGenerating ? "Sedang Memproses..." : "Buat Gambar Sekarang"}
            </button>
          </section>
        </div>
        <div className="xl:col-span-7">
          <div className="glass-panel min-h-[500px] rounded-[3rem] flex items-center justify-center p-8 bg-black/20 relative">
            {resultImage ? (
              <motion.img initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} src={resultImage} className="max-w-full rounded-2xl shadow-2xl" />
            ) : (isGenerating ? (
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin w-12 h-12 border-4 border-slate-800 border-t-fuchsia-500 rounded-full"></div>
                <p className="text-[10px] font-black uppercase text-fuchsia-500 tracking-[0.3em]">Membangun Gambar...</p>
              </div>
            ) : (
              <div className="text-center opacity-20">
                <i className="fa-solid fa-panorama text-6xl mb-4"></i>
                <p className="text-[10px] font-black uppercase tracking-[0.5em]">Hasil Gambar Akan Muncul Di Sini</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
