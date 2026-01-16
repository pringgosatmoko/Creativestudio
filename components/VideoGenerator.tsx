
import React, { useState } from 'react';
import { GoogleGenAI, VideoGenerationReferenceType } from '@google/genai';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoGeneratorProps {
  mode: 'img2vid' | 'text2vid';
  onBack: () => void;
}

export const VideoGenerator: React.FC<VideoGeneratorProps> = ({ mode, onBack }) => {
  const [sourceImages, setSourceImages] = useState<string[]>([]);
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('Cinematic');
  const [cameraAngle, setCameraAngle] = useState('Eye Level');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  const stylePresets = ['Cinematic', 'Disney Pixar', 'Anime', '3D Animation', 'Hyper-Realistic'];
  const cameraAngles = ['Eye Level', 'Bird\'s Eye', 'Low Angle', 'Angel View (High)', 'Wide Shot'];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setSourceImages(prev => [...prev, reader.result as string].slice(0, 3));
      reader.readAsDataURL(file);
    });
  };

  const generateVideo = async () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return;
    setIsGenerating(true);
    setVideoUrl(null);
    try {
      const ai = new GoogleGenAI({ apiKey });
      const refImgs = sourceImages.map(img => ({
        image: { imageBytes: img.split(',')[1], mimeType: 'image/png' },
        referenceType: VideoGenerationReferenceType.ASSET
      }));

      // Enhanced prompt with style and camera angle
      const enhancedPrompt = `${prompt}. Style: ${style}, Camera: ${cameraAngle}, 4k resolution, smooth motion.`;

      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-generate-preview',
        prompt: enhancedPrompt,
        config: { 
          numberOfVideos: 1, 
          resolution: '720p', 
          aspectRatio: aspectRatio as any, 
          referenceImages: refImgs.length > 0 ? refImgs : undefined 
        }
      });

      while (!operation.done) {
        await new Promise(r => setTimeout(r, 10000));
        operation = await ai.operations.getVideosOperation({ operation });
      }

      const link = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (link) {
        const res = await fetch(`${link}&key=${apiKey}`);
        setVideoUrl(URL.createObjectURL(await res.blob()));
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
        <button onClick={() => setShowGuide(!showGuide)} className={`w-10 h-10 rounded-xl border transition-all flex items-center justify-center ${showGuide ? 'bg-blue-500 text-black border-blue-400 shadow-[0_0_15px_#3b82f6]' : 'bg-white/5 border-white/5 text-blue-400'}`}><i className="fa-solid fa-circle-question"></i></button>
        <h2 className="text-2xl font-black italic uppercase">Video <span className="text-blue-500">AI</span></h2>
      </div>

      <AnimatePresence>
        {showGuide && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="glass-panel p-6 rounded-[2rem] border-blue-500/20 bg-blue-500/10 mb-4">
              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/20 flex items-center justify-center flex-shrink-0"><i className="fa-solid fa-film text-blue-400"></i></div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-bold">Hidupkan foto Anda! Master bisa memilih gaya visual, sudut kamera (termasuk Angel View), dan rasio video sesuai kebutuhan project (16:9 Landscape atau 9:16 Portrait).</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-5 space-y-6">
          <section className="glass-panel p-8 rounded-[2.5rem] space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Video Style</label>
                <select value={style} onChange={e => setStyle(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-[10px] font-bold text-white uppercase focus:outline-none">
                  {stylePresets.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Camera Angle</label>
                <select value={cameraAngle} onChange={e => setCameraAngle(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-[10px] font-bold text-white uppercase focus:outline-none">
                  {cameraAngles.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Aspect Ratio</label>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setAspectRatio('16:9')} className={`py-3 rounded-xl border text-[10px] font-black uppercase transition-all ${aspectRatio === '16:9' ? 'bg-white text-black border-white' : 'bg-black/20 border-white/5 text-slate-600'}`}>16:9 Landscape</button>
                <button onClick={() => setAspectRatio('9:16')} className={`py-3 rounded-xl border text-[10px] font-black uppercase transition-all ${aspectRatio === '9:16' ? 'bg-white text-black border-white' : 'bg-black/20 border-white/5 text-slate-600'}`}>9:16 Portrait</button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Visual Anchors (3)</label>
              <div className="grid grid-cols-3 gap-2">
                {sourceImages.map((img, i) => (
                  <div key={i} className="aspect-video bg-black/40 rounded-xl overflow-hidden relative group">
                    <img src={img} className="w-full h-full object-cover" />
                    <button onClick={() => setSourceImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[8px] opacity-0 group-hover:opacity-100"><i className="fa-solid fa-x"></i></button>
                  </div>
                ))}
                {sourceImages.length < 3 && (
                  <label className="aspect-video border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center cursor-pointer hover:bg-white/5">
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} multiple />
                    <i className="fa-solid fa-plus text-slate-700"></i>
                  </label>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Motion Narrative</label>
              <textarea value={prompt} onChange={e => setPrompt(e.target.value)} className="w-full h-24 glass-input rounded-2xl p-4 text-xs text-white" placeholder="Skenario gerakan video..." />
            </div>

            <button onClick={generateVideo} disabled={isGenerating || !prompt} className="w-full py-5 bg-white text-black font-black uppercase rounded-2xl shadow-xl active:scale-95 transition-all">
              {isGenerating ? "Rendering Motion..." : "Generate Motion"}
            </button>
          </section>
        </div>
        <div className="xl:col-span-7">
          <div className="glass-panel min-h-[400px] h-full rounded-[3rem] flex items-center justify-center p-6 bg-black/20 relative overflow-hidden">
            {videoUrl ? (
              <motion.video initial={{ opacity: 0 }} animate={{ opacity: 1 }} src={videoUrl} controls autoPlay loop className="w-full max-h-full rounded-2xl shadow-2xl relative z-10" />
            ) : (isGenerating ? (
              <div className="flex flex-col items-center gap-6">
                <div className="relative">
                  <div className="animate-spin w-16 h-16 border-4 border-slate-800 border-t-blue-500 rounded-full"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <i className="fa-solid fa-film text-blue-500/40 animate-pulse"></i>
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-[10px] font-black uppercase text-blue-500 tracking-[0.4em]">Processing Frames...</p>
                  <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest italic">Est: 1-2 Minutes</p>
                </div>
              </div>
            ) : (
              <div className="text-center opacity-20">
                <i className="fa-solid fa-clapperboard text-6xl mb-4"></i>
                <p className="text-[10px] font-black uppercase tracking-[0.5em]">Monitor Standby</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
