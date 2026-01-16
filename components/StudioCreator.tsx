
import React, { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { motion, AnimatePresence } from 'framer-motion';

interface StoryboardItem {
  scene: string;
  visual: string;
  audio: string;
  videoUrl?: string | null;
  isRendering?: boolean;
}

export const StudioCreator: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [title, setTitle] = useState('');
  const [mode, setMode] = useState<'ad' | 'normal'>('ad');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [voice, setVoice] = useState('Zephyr');
  const [duration, setDuration] = useState('8s');
  const [refImage, setRefImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState('Standby');
  const [step, setStep] = useState<'input' | 'story'>('input');
  const [storyboard, setStoryboard] = useState<StoryboardItem[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  const voices = ['Zephyr', 'Puck', 'Charon', 'Kore', 'Fenrir'];
  const durations = ['6s', '8s', '16s', '32s', '60s'];

  const handleRefImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setRefImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const constructProject = async () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return alert("API_KEY tidak ditemukan.");

    setIsProcessing(true);
    setStatusMsg("Membangun Konsep...");
    try {
      const ai = new GoogleGenAI({ apiKey });
      if (mode === 'normal') {
        setStoryboard([{ scene: "Main Node", visual: title, audio: "Natural Ambience" }]);
        setStep('story');
        return;
      }
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview', 
        contents: `Buat storyboard iklan 4 adegan untuk kampanye: ${title}. Durasi per adegan total ${duration}. Sinkronkan dengan voice over ${voice}.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                scene: { type: Type.STRING },
                visual: { type: Type.STRING },
                audio: { type: Type.STRING }
              },
              required: ["scene", "visual", "audio"]
            }
          }
        }
      });
      const data = JSON.parse(response.text || '[]');
      setStoryboard(data.map((item: any) => ({ ...item, videoUrl: null, isRendering: false })));
      setStep('story');
    } catch (e: any) { 
      alert("Error: " + e.message); 
    } finally { 
      setIsProcessing(false); 
      setStatusMsg("Standby");
    }
  };

  const executeIndividualRender = async (index: number) => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return alert("API_KEY tidak ditemukan.");

    const item = storyboard[index];
    const newStoryboard = [...storyboard];
    newStoryboard[index].isRendering = true;
    setStoryboard(newStoryboard);
    try {
      const ai = new GoogleGenAI({ apiKey });
      const renderPrompt = `Commercial scene: ${item.visual}. High end production, cinematic lightning. Style matching with ${voice} voice. Duration: ${duration}. Aspect: ${aspectRatio}.`;
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: renderPrompt,
        image: refImage ? {
          imageBytes: refImage.split(',')[1],
          mimeType: refImage.match(/data:([^;]+);/)?.[1] || 'image/png'
        } : undefined,
        config: { numberOfVideos: 1, resolution: '720p', aspectRatio: aspectRatio }
      });
      while (!operation.done) {
        await new Promise(r => setTimeout(r, 10000));
        operation = await ai.operations.getVideosOperation({ operation });
        if (operation.error) throw new Error(operation.error.message);
      }
      const uri = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (uri) {
        const resp = await fetch(`${uri}&key=${apiKey}`);
        const blob = await resp.blob();
        const url = URL.createObjectURL(blob as any);
        const updated = [...storyboard];
        updated[index].videoUrl = url;
        updated[index].isRendering = false;
        setStoryboard(updated);
      }
    } catch (e: any) { 
      alert("Render Gagal: " + e.message);
      const reset = [...storyboard];
      reset[index].isRendering = false;
      setStoryboard(reset);
    }
  };

  const executeRender = async () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return alert("API_KEY tidak ditemukan.");

    setIsProcessing(true);
    setVideoUrl(null);
    setStatusMsg("Inisialisasi Veo Node...");
    try {
      const ai = new GoogleGenAI({ apiKey });
      const promptVisual = storyboard.map(s => s.visual).join(". ");
      const renderPrompt = `Professional ${mode === 'ad' ? 'commercial ad' : 'video'} for ${title}. ${promptVisual}. High end production, cinematic lightning. Voice profile: ${voice}. Duration: ${duration}.`;
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: renderPrompt,
        image: refImage ? {
          imageBytes: refImage.split(',')[1],
          mimeType: refImage.match(/data:([^;]+);/)?.[1] || 'image/png'
        } : undefined,
        config: { numberOfVideos: 1, resolution: '720p', aspectRatio: aspectRatio }
      });
      let timer = 0;
      while (!operation.done) {
        timer += 10;
        setStatusMsg(`Rendering Ad Content... (${timer}s)`);
        await new Promise(r => setTimeout(r, 10000));
        operation = await ai.operations.getVideosOperation({ operation });
        if (operation.error) throw new Error(operation.error.message);
      }
      const uri = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (uri) {
        setStatusMsg("Finalizing...");
        const resp = await fetch(`${uri}&key=${apiKey}`);
        const blob = await resp.blob();
        setVideoUrl(URL.createObjectURL(blob as any));
        setStatusMsg("Render Sukses");
      }
    } catch (e: any) { 
      alert("Gagal: " + e.message);
      setStatusMsg("Gagal");
    } finally { 
      setIsProcessing(false); 
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-white transition-all">
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <button onClick={() => setShowGuide(!showGuide)} className={`w-10 h-10 rounded-xl border transition-all flex items-center justify-center ${showGuide ? 'bg-yellow-500 text-black border-yellow-400 shadow-[0_0_15px_#eab308]' : 'bg-white/5 border-white/5 text-yellow-500'}`}>
          <i className="fa-solid fa-circle-question"></i>
        </button>
        <h2 className="text-2xl font-black italic uppercase">Studio <span className="text-yellow-500">Pro</span></h2>
      </div>

      <AnimatePresence>
        {showGuide && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="glass-panel p-6 rounded-[2rem] border-yellow-500/20 bg-yellow-500/10 mb-4 relative">
              <button onClick={() => setShowGuide(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><i className="fa-solid fa-xmark text-xs"></i></button>
              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 rounded-2xl bg-yellow-500/20 flex items-center justify-center flex-shrink-0"><i className="fa-solid fa-bolt-lightning text-yellow-500"></i></div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-white mb-1">Panduan Studio Pro</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-medium">Buat konten video profesional. **Mode Iklan** akan otomatis merancang storyboard 4 adegan berdasarkan konsep Anda. **Mode Normal** melakukan rendering langsung tanpa storyboard. Master juga bisa merender adegan per adegan untuk pratinjau cepat.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {step === 'input' ? (
          <motion.div key="input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass-panel p-8 rounded-[3rem] bg-slate-900/40 space-y-6">
              <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5">
                <button onClick={() => setMode('ad')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'ad' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'text-slate-500'}`}>Mode Iklan</button>
                <button onClick={() => setMode('normal')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'normal' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'text-slate-500'}`}>Mode Normal</button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Ratio Video</label>
                  <select value={aspectRatio} onChange={e => setAspectRatio(e.target.value as any)} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs text-white outline-none">
                    <option value="16:9">Lanskap (16:9)</option>
                    <option value="9:16">Portrait (9:16)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Master Voice</label>
                  <select value={voice} onChange={e => setVoice(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs text-white outline-none">
                    {voices.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Durasi Target</label>
                <div className="grid grid-cols-5 gap-2">
                  {durations.map(d => (
                    <button key={d} onClick={() => setDuration(d)} className={`py-2 rounded-lg text-[9px] font-black transition-all ${duration === d ? 'bg-yellow-500 text-black' : 'bg-black/40 text-slate-600 border border-white/5'}`}>{d}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Lock Reference (Visual Anchor)</label>
                <div className="aspect-video border-2 border-dashed border-white/10 rounded-[2rem] overflow-hidden bg-black/40 relative group hover:border-yellow-500/50 transition-all">
                  {refImage ? (
                    <>
                      <img src={refImage} className="w-full h-full object-cover" />
                      <button onClick={() => setRefImage(null)} className="absolute top-4 right-4 w-10 h-10 bg-black/60 rounded-full text-white flex items-center justify-center"><i className="fa-solid fa-xmark"></i></button>
                    </>
                  ) : (
                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                      <i className="fa-solid fa-cloud-arrow-up text-3xl text-slate-700 mb-2"></i>
                      <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Upload Master Reference</span>
                      <input type="file" onChange={handleRefImage} className="hidden" accept="image/*" />
                    </label>
                  )}
                </div>
              </div>
            </div>
            <div className="glass-panel p-8 rounded-[3rem] bg-slate-900/40 flex flex-col justify-center space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Deskripsi Proyek</label>
                <textarea value={title} onChange={e => setTitle(e.target.value)} placeholder="Contoh: Iklan Katering Zephyr yang bersih dan mewah..." className="w-full h-48 bg-black/40 border border-white/10 rounded-3xl p-6 text-sm text-white focus:border-yellow-500/50 outline-none transition-all custom-scrollbar" />
              </div>
              <button onClick={constructProject} disabled={isProcessing || !title} className="w-full py-6 bg-white text-black font-black uppercase rounded-2xl hover:bg-yellow-400 active:scale-95 transition-all disabled:opacity-30 shadow-2xl">
                {isProcessing ? "Processing Node..." : (mode === 'ad' ? "Generate Storyboard" : "Initialize Render")}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="story" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {storyboard.map((s, i) => (
                <div key={i} className="glass-panel p-6 rounded-3xl bg-black/40 border-white/5 space-y-4 shadow-xl border-yellow-500/10 flex flex-col h-full">
                  <div className="flex justify-between items-center">
                    <div className="w-8 h-8 rounded-full bg-yellow-500 text-black flex items-center justify-center font-black text-xs italic shadow-lg">{i+1}</div>
                    <button onClick={() => executeIndividualRender(i)} disabled={s.isRendering} className={`text-[9px] font-black uppercase px-3 py-1 rounded-full border transition-all ${s.isRendering ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500' : 'bg-white/5 text-slate-500 border-white/10 hover:text-white'}`}>
                      {s.isRendering ? <i className="fa-solid fa-circle-notch fa-spin"></i> : "Render Scene"}
                    </button>
                  </div>
                  <h4 className="text-[10px] font-black text-yellow-500 uppercase tracking-widest leading-tight">{s.scene}</h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-medium flex-1">{s.visual}</p>
                  {s.videoUrl && (
                    <div className="mt-2 aspect-video rounded-xl overflow-hidden border border-yellow-500/30">
                      <video src={s.videoUrl} autoPlay loop muted className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="pt-3 border-t border-white/5">
                    <p className="text-[8px] text-slate-600 uppercase font-black mb-1">Audio Profile ({voice})</p>
                    <p className="text-[11px] text-white italic leading-tight">"{s.audio}"</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="glass-panel p-10 rounded-[4rem] bg-black/20 flex flex-col items-center border-white/5 space-y-8 shadow-inner">
              <div className="w-full max-w-2xl space-y-6">
                <button onClick={executeRender} disabled={isProcessing} className="w-full py-8 bg-yellow-500 text-black font-black uppercase rounded-[2.5rem] hover:bg-white active:scale-95 transition-all shadow-[0_20px_60px_#eab30830] text-lg">
                  {isProcessing ? statusMsg : "Execute Full Combined Render"}
                </button>
                <div className="text-center">
                  <button onClick={() => setStep('input')} className="text-[10px] font-black uppercase text-slate-600 hover:text-white tracking-[0.3em] transition-all">Back to Configuration</button>
                </div>
              </div>
              {videoUrl && (
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full">
                  <video src={videoUrl} controls autoPlay loop className="w-full rounded-[3.5rem] shadow-2xl border-8 border-white/5" />
                  <div className="mt-10 flex justify-center">
                    <a href={videoUrl} download="satmoko_ad_master.mp4" className="px-14 py-5 bg-yellow-500 text-black font-black uppercase text-[12px] rounded-full tracking-widest hover:bg-white transition-all shadow-2xl active:scale-95">Download Master Copy</a>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
