
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
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [cameraAngle, setCameraAngle] = useState('Standar');
  const [videoStyle, setVideoStyle] = useState('Nyata');
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMsg, setStatusMsg] = useState('Siap');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length + sourceImages.length > 3) {
      alert("Maksimal 3 foto referensi saja.");
      return;
    }
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setSourceImages(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const generateVideo = async () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      alert("API Key tidak ditemukan. Pastikan sistem sudah dikonfigurasi.");
      return;
    }

    setIsGenerating(true);
    setVideoUrl(null);
    setStatusMsg("Menghubungkan ke Server...");
    
    try {
      const ai = new GoogleGenAI({ apiKey });
      const isMultiRef = sourceImages.length > 1;
      const modelName = isMultiRef ? 'veo-3.1-generate-preview' : 'veo-3.1-fast-generate-preview';
      
      const referenceImagesPayload = sourceImages.map(img => ({
        image: {
          imageBytes: img.split(',')[1],
          mimeType: img.match(/data:([^;]+);/)?.[1] || 'image/png',
        },
        referenceType: VideoGenerationReferenceType.ASSET,
      }));

      const finalPrompt = `${prompt}. Gaya: ${videoStyle}. Sudut Kamera: ${cameraAngle}. Kualitas: Tinggi.`;

      let operation = await ai.models.generateVideos({
        model: modelName,
        prompt: finalPrompt,
        image: sourceImages.length === 1 ? {
          imageBytes: sourceImages[0].split(',')[1],
          mimeType: sourceImages[0].match(/data:([^;]+);/)?.[1] || 'image/png'
        } : undefined,
        config: { 
          numberOfVideos: 1, 
          resolution: '720p', 
          aspectRatio: isMultiRef ? '16:9' : aspectRatio,
          referenceImages: isMultiRef ? referenceImagesPayload : undefined
        }
      });

      let timer = 0;
      while (!operation.done) {
        timer += 10;
        setStatusMsg(`Sedang Memproses... (${timer}s)`);
        await new Promise(r => setTimeout(r, 10000));
        operation = await ai.operations.getVideosOperation({ operation });
        if (operation.error) throw new Error(operation.error.message);
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        setStatusMsg("Menyusun Berkas Video...");
        const response = await fetch(`${downloadLink}&key=${apiKey}`);
        const blob = await response.blob();
        setVideoUrl(URL.createObjectURL(blob as any));
        setStatusMsg("Selesai");
      }
    } catch (e: any) { 
      alert("Gagal memproses: " + e.message);
      setStatusMsg("Gagal");
    } finally { 
      setIsGenerating(false); 
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"><i className="fa-solid fa-arrow-left"></i></button>
        <button onClick={() => setShowGuide(!showGuide)} className={`w-10 h-10 rounded-xl border transition-all flex items-center justify-center ${showGuide ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_#22d3ee]' : 'bg-white/5 border-white/5 text-cyan-400'}`}><i className="fa-solid fa-circle-question"></i></button>
        <h2 className="text-2xl font-black italic uppercase">Buat <span className="text-cyan-500">Video</span></h2>
      </div>

      <AnimatePresence>
        {showGuide && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="glass-panel p-6 rounded-[2rem] border-cyan-500/20 bg-cyan-500/10 mb-4">
              <h4 className="text-xs font-black uppercase text-white mb-1">Panduan Membuat Video</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">Pilih foto referensi (opsional) dan ketik deskripsi video yang Anda inginkan. Semakin detail deskripsi Anda, semakin bagus hasil videonya.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-5 space-y-6">
          <section className="glass-panel p-8 rounded-[2.5rem] bg-slate-900/40 space-y-6 border-white/5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500">Ukuran Layar</label>
                <select value={aspectRatio} onChange={e => setAspectRatio(e.target.value as any)} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs text-white outline-none">
                  <option value="16:9">Lebar (16:9)</option>
                  <option value="9:16">Tegak (9:16)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500">Gaya Video</label>
                <select value={videoStyle} onChange={e => setVideoStyle(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs text-white outline-none">
                  <option>Nyata</option>
                  <option>Animasi 3D</option>
                  <option>Kartun/Anime</option>
                  <option>Cyberpunk</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500">Sudut Kamera</label>
              <select value={cameraAngle} onChange={e => setCameraAngle(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs text-white outline-none">
                <option>Standar</option>
                <option>Dekat (Close-up)</option>
                <option>Bergerak (Tracking)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500">Foto Referensi ({sourceImages.length}/3)</label>
              <div className="grid grid-cols-3 gap-2">
                {sourceImages.map((img, i) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden border border-white/10 relative">
                    <img src={img} className="w-full h-full object-cover" />
                  </div>
                ))}
                {sourceImages.length < 3 && (
                  <label className="aspect-square border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center cursor-pointer hover:bg-white/5 transition-all">
                    <i className="fa-solid fa-plus text-slate-700"></i>
                    <input type="file" onChange={handleFileChange} className="hidden" accept="image/*" />
                  </label>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500">Apa yang terjadi di video?</label>
              <textarea value={prompt} onChange={e => setPrompt(e.target.value)} className="w-full h-24 bg-black/40 border border-white/10 rounded-2xl p-4 text-xs text-white focus:border-cyan-500/50 outline-none" placeholder="Contoh: Seorang pria sedang berjalan di tepi pantai saat matahari terbenam..." />
            </div>

            <button onClick={generateVideo} disabled={isGenerating || !prompt} className="w-full py-5 bg-white text-black font-black uppercase rounded-2xl shadow-xl active:scale-95 hover:bg-cyan-400 disabled:opacity-30">
              {isGenerating ? statusMsg : "Mulai Buat Video"}
            </button>
          </section>
        </div>

        <div className="xl:col-span-7">
          <div className="glass-panel min-h-[500px] rounded-[3rem] flex flex-col items-center justify-center p-8 bg-black/20 border-white/5">
            {videoUrl ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full flex flex-col items-center">
                <video src={videoUrl} controls autoPlay loop className="w-full rounded-2xl border-4 border-white/5" />
                <a href={videoUrl} download="satmoko_video.mp4" className="mt-8 px-10 py-4 bg-cyan-500 text-black font-black uppercase text-[10px] rounded-full hover:bg-white transition-all">Simpan Video</a>
              </motion.div>
            ) : (
              <div className="text-center opacity-20">
                <i className={`fa-solid ${isGenerating ? 'fa-spinner fa-spin' : 'fa-video'} text-8xl`}></i>
                <p className="text-[11px] font-black uppercase tracking-[0.5em] mt-4">{statusMsg}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
