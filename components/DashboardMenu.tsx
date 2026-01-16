
import React from 'react';
import { motion } from 'framer-motion';

interface DashboardMenuProps {
  onSelect: (feature: any) => void;
  nodeCount: number;
  aiActive: boolean;
  isAdmin: boolean;
  userName: string;
}

export const DashboardMenu: React.FC<DashboardMenuProps> = ({ onSelect, nodeCount, aiActive, isAdmin, userName }) => (
  <div className="space-y-20 pb-40">
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
       <div className="space-y-4">
          <p className="text-cyan-500 text-[10px] font-black uppercase tracking-[0.6em]">System Authentication Complete</p>
          <h2 className="text-5xl md:text-6xl font-display font-black tracking-tighter uppercase italic text-gradient">Master <span className="text-cyan-400">{userName}</span></h2>
          <p className="text-slate-500 text-sm font-medium max-w-lg leading-relaxed">Welcome to your elite creative workspace. All neural cores are synchronized and ready for synthesis. Select a module to begin.</p>
       </div>
       <div className="grid grid-cols-2 gap-4">
          <StatBox label="Member Nodes" value={nodeCount} sub="Active" />
          <StatBox label="AI Latency" value="14.2" sub="ms" />
       </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6">
      <div className="md:col-span-2 lg:col-span-4 h-[500px]">
        <MenuCard 
          icon="fa-brain-circuit" 
          color="cyan" 
          title="Neural Core" 
          desc="Advanced strategic reasoning and creative logic engine." 
          onClick={() => onSelect('chat')} 
          status={aiActive ? 'CONNECTED' : 'STANDBY'}
          isFeatured
          imageUrl="https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1200"
        />
      </div>
      <div className="md:col-span-2 lg:col-span-2">
        <MenuCard icon="fa-wand-magic-sparkles" color="fuchsia" title="Visual Arts" desc="High-fidelity image synthesis." onClick={() => onSelect('txt2img')} />
      </div>
      <div className="md:col-span-2 lg:col-span-2">
        <MenuCard icon="fa-film" color="blue" title="Motion Studio" desc="Cinematic video rendering engine." onClick={() => onSelect('img2vid')} />
      </div>
      <div className="md:col-span-1 lg:col-span-2">
        <MenuCard icon="fa-bolt-lightning" color="orange" title="Automation" desc="Autonomous workflow orchestration." onClick={() => onSelect('studio')} />
      </div>
      {isAdmin && <div className="md:col-span-3 lg:col-span-2"><MenuCard icon="fa-server" color="slate" title="Records Hub" desc="Identity management panel." onClick={() => onSelect('members')} /></div>}
    </div>

    <div className="pt-24 border-t border-white/5">
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-10 mb-16">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
             <div className="w-12 h-1 bg-fuchsia-500"></div>
             <p className="text-fuchsia-500 text-[11px] font-black uppercase tracking-[0.6em]">Studio Artifacts</p>
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-black tracking-tighter uppercase italic">Creative <span className="text-cyan-400">Inspiration</span></h2>
        </div>
        <button className="px-8 py-4 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-cyan-400 transition-all shadow-xl">
          Explore Gallery
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        <GalleryCard img="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800" title="Organic Synthesis" category="GEN_VISUAL" />
        <GalleryCard img="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=800" title="Neural Pathway" category="NEURAL_ART" />
        <GalleryCard img="https://images.unsplash.com/photo-1635339001026-6114ad115ef4?auto=format&fit=crop&q=80&w=800" title="Cyber Citadel" category="ENV_SYNTH" />
        <GalleryCard img="https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=800" title="Spectrum Core" category="ABSTRACT" />
      </div>
    </div>
  </div>
);

const StatBox = ({ label, value, sub }: any) => (
  <div className="glass-panel px-8 py-5 rounded-[2rem] bg-slate-900/40 border-white/5 min-w-[160px]">
    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 block">{label}</span>
    <div className="flex items-end gap-3"><span className="text-3xl font-black text-white tracking-tighter">{value}</span><span className="text-[9px] font-black text-cyan-500 mb-1">{sub}</span></div>
  </div>
);

const GalleryCard = ({ img, title, category }: any) => (
  <motion.div whileHover={{ y: -12, scale: 1.02 }} className="group relative aspect-[3/4] rounded-[2.5rem] overflow-hidden border border-white/5 bg-slate-900 shadow-2xl">
    <img src={img} alt={title} className="w-full h-full object-cover opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-[1.5s]" />
    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8">
       <span className="text-[8px] font-black text-cyan-400 bg-cyan-400/10 px-3 py-1.5 rounded-full uppercase tracking-widest mb-3 inline-block border border-cyan-400/20">{category}</span>
       <h4 className="text-xl font-bold text-white uppercase tracking-tighter mb-2">{title}</h4>
       <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest italic">Satmoko Artifact v4.0</p>
    </div>
  </motion.div>
);

const MenuCard = ({ icon, color, title, desc, onClick, status, isFeatured, imageUrl }: any) => (
  <button onClick={onClick} className={`group w-full h-full glass-panel ${isFeatured ? 'p-12' : 'p-10'} rounded-[3rem] text-left hover:border-white/20 transition-all bg-slate-900/40 flex flex-col justify-between relative overflow-hidden shadow-2xl`}>
    {isFeatured && imageUrl && <div className="absolute inset-0 opacity-15 group-hover:scale-110 transition-all duration-[3s]"><img src={imageUrl} className="w-full h-full object-cover" /><div className="absolute inset-0 bg-gradient-to-br from-[#010409] to-transparent"></div></div>}
    <div className="relative z-10">
      <div className={`w-14 h-14 rounded-2xl bg-${color}-500/10 border border-${color}-500/20 flex items-center justify-center text-${color}-400 mb-8 group-hover:rotate-[8deg] transition-all`}><i className={`fa-solid ${icon} text-2xl`}></i></div>
      <h3 className="text-xl font-display font-black text-white mb-3 uppercase tracking-tighter italic leading-none">{title}</h3>
      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed opacity-80">{desc}</p>
    </div>
    <div className="relative z-10 mt-10 flex items-center justify-between">
      {status ? <div className="flex items-center gap-3"><div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_10px_#22d3ee]"></div><span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">{status}</span></div> : <div></div>}
      <i className="fa-solid fa-arrow-right text-xs opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all"></i>
    </div>
  </button>
);
