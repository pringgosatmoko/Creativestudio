
import React from 'react';
import { motion } from 'framer-motion';

interface SidebarProps {
  activeFeature: string;
  onSelect: (feature: any) => void;
  isAdmin: boolean;
  onClose: () => void;
  isTelegramActive: boolean;
  isAiActive: boolean;
  aiMask: string;
  aiName: string;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeFeature, onSelect, isAdmin, onClose, isTelegramActive, isAiActive, aiMask, aiName, onLogout 
}) => {
  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-72 glass-panel border-r border-white/5 flex flex-col py-6 lg:relative bg-[#020617]/98 backdrop-blur-3xl shadow-2xl">
      <div className="px-7 mb-10 flex justify-between items-center">
        <div onClick={() => onSelect('menu')} className="cursor-pointer group">
          <h1 className="text-2xl font-display font-black tracking-tighter text-white uppercase group-hover:text-cyan-400 transition-colors">SATMOKO</h1>
          <p className="text-[8px] font-black uppercase tracking-[0.4em] text-cyan-500/80">AI MASTER CORE</p>
        </div>
        <button onClick={() => onClose()} className="lg:hidden text-slate-500 p-2"><i className="fa-solid fa-xmark"></i></button>
      </div>
      
      <nav className="flex-1 flex flex-col gap-1.5 px-4 overflow-y-auto custom-scrollbar">
        <NavButton active={activeFeature === 'menu'} onClick={() => onSelect('menu')} icon="fa-grid-horizontal" label="Dashboard" />
        <NavButton active={activeFeature === 'chat'} onClick={() => onSelect('chat')} icon="fa-brain-circuit" label="Intelligence" />
        <NavButton active={activeFeature === 'txt2img'} onClick={() => onSelect('txt2img')} icon="fa-wand-magic-sparkles" label="Visual Arts" />
        <NavButton active={activeFeature === 'img2vid'} onClick={() => onSelect('img2vid')} icon="fa-film" label="Motion Studio" />
        <NavButton active={activeFeature === 'studio'} onClick={() => onSelect('studio')} icon="fa-bolt-lightning" label="Automation" />
        <div className="h-[1px] bg-white/5 my-4 mx-4"></div>
        <NavButton active={activeFeature === 'profile'} onClick={() => onSelect('profile')} icon="fa-user-gear" label="Profile Settings" />
        {isAdmin && <NavButton active={activeFeature === 'members'} onClick={() => onSelect('members')} icon="fa-shield-halved" label="Records Hub" />}
      </nav>

      <div className="px-4 mt-6 space-y-4">
         <div className="glass-panel p-5 rounded-[1.8rem] bg-slate-900/40 border-cyan-500/10 space-y-3">
            <div className="flex justify-between items-center">
               <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest">Environment Audit:</span>
               <span className="text-[7px] text-green-500 font-bold uppercase tracking-tighter">Verified</span>
            </div>
            <div className="space-y-1.5">
               <div className="flex justify-between items-center text-[7px] font-bold uppercase tracking-widest">
                  <span className="text-slate-500">NEURAL_KEY:</span>
                  <span className={isAiActive ? 'text-green-500' : 'text-red-500'}>{isAiActive ? 'LINKED' : 'VOID'}</span>
               </div>
               <div className="flex justify-between items-center text-[7px] font-bold uppercase tracking-widest">
                  <span className="text-slate-500">TELEGRAM:</span>
                  <span className={isTelegramActive ? 'text-green-500' : 'text-red-500'}>{isTelegramActive ? 'ACTIVE' : 'OFFLINE'}</span>
               </div>
            </div>
         </div>

         <div className="p-5 rounded-[2rem] bg-black/40 border border-white/5 space-y-4 shadow-inner">
            <HealthBar label="Neural Link" value={98.4} color="cyan" icon="fa-link" />
            <HealthBar label="Core Temp" value={32.1} color="fuchsia" icon="fa-fire-flame-curved" />
         </div>
      </div>

      <div className="px-4 pt-6 mt-4 border-t border-white/5">
        <button onClick={() => onLogout()} className="w-full py-3.5 bg-red-500/5 hover:bg-red-500/10 text-red-500/70 rounded-xl transition-all flex items-center px-6 gap-3.5 border border-red-500/10 text-[9px] font-black uppercase tracking-[0.2em]">
          <i className="fa-solid fa-power-off text-[10px]"></i>
          <span>Terminated Session</span>
        </button>
      </div>
    </aside>
  );
};

const HealthBar = ({ label, value, color, icon }: any) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center text-[8px] font-black text-slate-500 uppercase tracking-widest">
      <span className="flex items-center gap-2"><i className={`fa-solid ${icon} text-${color}-500`}></i> {label}</span>
      <span className="text-white">{value}%</span>
    </div>
    <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
      <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 2 }} className={`h-full bg-${color}-500 shadow-[0_0_10px_rgba(34,211,238,0.3)]`}></motion.div>
    </div>
  </div>
);

const NavButton = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`w-full py-4 rounded-2xl transition-all flex items-center px-6 gap-4 border ${active ? 'bg-cyan-500/5 text-white border-cyan-500/20 shadow-xl' : 'text-slate-500 hover:text-slate-200 border-transparent hover:bg-white/[0.04]'}`}>
    <i className={`fa-solid ${icon} ${active ? 'text-cyan-400' : 'text-slate-600'} text-sm w-6 text-center transition-colors`}></i>
    <span className="text-[11px] font-black uppercase tracking-[0.2em]">{label}</span>
  </button>
);
