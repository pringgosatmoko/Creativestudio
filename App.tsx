
import React, { useState, useEffect, useMemo } from 'react';
import { RobotHero } from './components/RobotHero';
import { LoginForm } from './components/LoginForm';
import { ChatAssistant } from './components/ChatAssistant';
import { VideoGenerator } from './components/VideoGenerator';
import { ImageGenerator } from './components/ImageGenerator';
import { StudioCreator } from './components/StudioCreator';
import { MemberControl } from './components/MemberControl';
import { DirectChat } from './components/DirectChat';
import { ProfileSettings } from './components/ProfileSettings';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';

export type Feature = 'menu' | 'chat' | 'img2vid' | 'txt2img' | 'studio' | 'members' | 'direct-chat' | 'profile';

const MenuCard: React.FC<{ icon: string; title: string; desc: string; onClick: () => void }> = ({ icon, title, desc, onClick }) => {
  return (
    <button onClick={onClick} className="glass-panel p-10 rounded-[3rem] text-left border border-white/5 hover:border-cyan-500/40 transition-all active:scale-[0.98] group bg-slate-900/20 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
        <i className={`fa-solid ${icon} text-6xl`}></i>
      </div>
      <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mb-8 border border-white/5 group-hover:bg-cyan-500 group-hover:text-black transition-all shadow-xl">
         <i className={`fa-solid ${icon} text-2xl text-cyan-400 group-hover:text-black`}></i>
      </div>
      <h3 className="text-2xl font-black italic uppercase text-white mb-3 tracking-tighter">{title}</h3>
      <p className="text-[11px] font-bold uppercase text-slate-500 tracking-widest leading-relaxed opacity-60 group-hover:opacity-100 transition-opacity">{desc}</p>
    </button>
  );
};

const DashboardMenu: React.FC<{ onSelect: (f: Feature) => void; isAdmin: boolean; dbStatus: string; currentTime: Date; onLogout: () => void }> = ({ onSelect, isAdmin, dbStatus, currentTime, onLogout }) => {
  return (
    <div className="space-y-12 pb-10">
      <header className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full flex items-center gap-2">
               <span className="w-1 h-1 rounded-full bg-cyan-500 animate-pulse"></span>
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">NODE ID: {currentTime.toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
               <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"></div>
               <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Satmoko-Active</span>
            </div>
          </div>
        </div>
        <motion.h2 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }}
          className="text-5xl lg:text-8xl font-black italic uppercase tracking-tighter leading-[0.9] text-white"
        >
          Selamat datang<br /><span className="text-cyan-400 neon-glow-cyan">Seniman Digital</span>
        </motion.h2>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <MenuCard icon="fa-shield-halved" title="Control Admin" desc="Core Systems & Database." onClick={() => onSelect('members')} />
        <MenuCard icon="fa-wand-magic-sparkles" title="Gambar AI" desc="Intelligent Visual Synthesis." onClick={() => onSelect('txt2img')} />
        <MenuCard icon="fa-film" title="Video AI" desc="Motion Graphics Engine." onClick={() => onSelect('img2vid')} />
        <MenuCard icon="fa-bolt-lightning" title="Studio Pro" desc="Production Automation." onClick={() => onSelect('studio')} />
        <MenuCard icon="fa-inbox" title="Inbox" desc="P2P Messaging Terminal." onClick={() => onSelect('direct-chat')} />
        <MenuCard icon="fa-user-gear" title="Profile" desc="Security & Node Config." onClick={() => onSelect('profile')} />
      </div>
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: string; label: string }> = ({ active, onClick, icon, label }) => {
  return (
    <button 
      onClick={onClick} 
      title={label}
      className={`w-full aspect-square rounded-[2rem] flex flex-col items-center justify-center gap-1.5 transition-all relative group ${active ? 'bg-cyan-500 text-black shadow-xl shadow-cyan-500/20' : 'text-slate-600 hover:text-white hover:bg-white/5'}`}
    >
      <i className={`fa-solid ${icon} text-lg ${active ? 'text-black' : ''}`}></i>
      <span className={`text-[8px] font-black uppercase tracking-tighter ${active ? 'text-black' : 'opacity-0 group-hover:opacity-100'}`}>{label}</span>
      {active && <motion.div layoutId="activeNav" className="absolute left-0 w-1 h-8 bg-cyan-400 rounded-full" />}
    </button>
  );
};

const MobileNavBtn: React.FC<{ active: boolean; onClick: () => void; icon: string; label: string }> = ({ active, onClick, icon, label }) => {
  return (
    <button onClick={onClick} className={`w-full py-5 px-8 rounded-3xl flex items-center gap-5 transition-all ${active ? 'bg-cyan-500 text-black shadow-xl shadow-cyan-500/20' : 'bg-white/5 text-slate-400 border border-white/10'}`}>
      <i className={`fa-solid ${icon} text-lg`}></i>
      <span className="text-xs font-black uppercase italic tracking-widest">{label}</span>
    </button>
  );
};

const BottomNavBtn: React.FC<{ active: boolean; onClick: () => void; icon: string; label: string }> = ({ active, onClick, icon, label }) => {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1.5 flex-1 ${active ? 'text-cyan-400' : 'text-slate-600'}`}>
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${active ? 'bg-cyan-500/10 border border-cyan-500/20 shadow-lg' : ''}`}>
         <i className={`fa-solid ${icon} text-sm`}></i>
      </div>
      <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );
};

const App: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  
  const [isKeySelected, setIsKeySelected] = useState(() => {
    // @ts-ignore
    return typeof window !== 'undefined' && !window.aistudio;
  });
  
  const [activeFeature, setActiveFeature] = useState<Feature>('menu');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dbStatus, setDbStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  
  const adminEmails = ['pringgosatmoko@gmail.com'];
  const isAdmin = useMemo(() => adminEmails.includes(userEmail.toLowerCase()), [userEmail]);

  const supabase = useMemo(() => {
    const vEnv = (import.meta as any).env || {};
    const pEnv = (typeof process !== 'undefined' ? process.env : {}) || {};
    const url = vEnv.VITE_DATABASE_URL || pEnv.VITE_DATABASE_URL || 'https://urokqoorxuiokizesiwa.supabase.co';
    const key = vEnv.VITE_SUPABASE_ANON_KEY || pEnv.VITE_SUPABASE_ANON_KEY || 'sb_publishable_G1udRukMNJjDM6wlVD3xtw_IF8Yrbd8';
    return createClient(url, key);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const checkSystems = async () => {
      try {
        const { error } = await supabase.from('members').select('id').limit(1);
        setDbStatus(error ? 'offline' : 'online');
      } catch {
        setDbStatus('offline');
      }
      
      if (isLoggedIn) {
        try {
          // @ts-ignore
          const studio = window.aistudio;
          if (studio && typeof studio.hasSelectedApiKey === 'function') {
            const hasKey = await studio.hasSelectedApiKey();
            setIsKeySelected(hasKey);
          } else {
            setIsKeySelected(true);
          }
        } catch {
          setIsKeySelected(true);
        }
      }
    };
    checkSystems();
  }, [isLoggedIn, supabase]);

  const handleOpenSelectKey = async () => {
    try {
      // @ts-ignore
      const studio = window.aistudio;
      if (studio && typeof studio.openSelectKey === 'function') {
        await studio.openSelectKey();
      }
    } catch (e) {
      console.warn("Manual key select not supported");
    }
    setIsKeySelected(true);
  };

  useEffect(() => {
    const t1 = setTimeout(() => setIsLoaded(true), 100);
    const t2 = setTimeout(() => setShowLogin(true), 1500); 
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const handleLoginSuccess = (email: string) => {
    setUserEmail(email);
    setIsLoggedIn(true);
    setActiveFeature('menu');
  };

  const handleLogout = () => {
    window.location.reload(); 
  };

  const selectFeature = (feature: Feature) => {
    setActiveFeature(feature);
    setIsSidebarOpen(false);
    const mainContent = document.getElementById('main-content-area');
    if (mainContent) mainContent.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderFeature = () => {
    switch (activeFeature) {
      case 'menu': return <DashboardMenu onSelect={selectFeature} isAdmin={isAdmin} dbStatus={dbStatus} currentTime={currentTime} onLogout={handleLogout} />;
      case 'members': return <MemberControl onBack={() => setActiveFeature('menu')} onChatUser={() => selectFeature('direct-chat')} />;
      case 'txt2img': return <ImageGenerator onBack={() => setActiveFeature('menu')} />;
      case 'img2vid': return <VideoGenerator mode="img2vid" onBack={() => setActiveFeature('menu')} />;
      case 'studio': return <StudioCreator onBack={() => setActiveFeature('menu')} />;
      case 'direct-chat': return <DirectChat userEmail={userEmail} isAdmin={isAdmin} adminEmail={adminEmails[0]} onBack={() => setActiveFeature('menu')} />;
      case 'chat': return <ChatAssistant onBack={() => setActiveFeature('menu')} />;
      case 'profile': return <ProfileSettings onBack={() => setActiveFeature('menu')} onLogout={handleLogout} />;
      default: return <DashboardMenu onSelect={selectFeature} isAdmin={isAdmin} dbStatus={dbStatus} currentTime={currentTime} onLogout={handleLogout} />;
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#010409] text-slate-100 overflow-hidden relative font-sans">
      <AnimatePresence mode="wait">
        {!isLoggedIn ? (
          <motion.main key="splash" initial={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.1 }} transition={{ duration: 0.8 }} className="absolute inset-0 z-[200] flex flex-col items-center justify-center city-wallpaper px-4 overflow-y-auto no-scrollbar">
            <div className="w-full max-w-2xl flex flex-col items-center py-12">
              <RobotHero isLoaded={isLoaded} isCompact={showLogin} />
              <AnimatePresence>
                {showLogin && (
                  <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.3 }} className="w-full">
                    <LoginForm onSuccess={handleLoginSuccess} />
                    <p className="text-[10px] font-black uppercase tracking-[0.8em] text-slate-500 text-center mt-12 opacity-50 italic">SECURED BY SATMOKO V1.8 2026</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.main>
        ) : !isKeySelected ? (
          <motion.main key="key-sync" className="absolute inset-0 z-[150] flex flex-col items-center justify-center city-wallpaper px-4">
             <div className="w-full max-w-2xl flex flex-col items-center py-12">
               <RobotHero isLoaded={true} isCompact={true} />
               <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel p-10 rounded-[3rem] text-center space-y-8 max-w-md border-cyan-500/20 shadow-2xl bg-black/80 backdrop-blur-3xl">
                  <div className="w-24 h-24 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto border border-cyan-500/20 shadow-[0_0_30px_rgba(34,211,238,0.1)]">
                    <i className="fa-solid fa-key text-5xl text-cyan-400"></i>
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">AI Engine Sync Required</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed px-6">Hubungkan kunci akses untuk mengaktifkan modul kecerdasan buatan Satmoko Studio.</p>
                  </div>
                  <div className="pt-2 space-y-4">
                    <button onClick={handleOpenSelectKey} className="w-full py-6 bg-white text-black font-black uppercase rounded-2xl shadow-xl hover:bg-cyan-400 transition-all active:scale-95 text-xs tracking-widest">Link AI Engine</button>
                    <button onClick={handleLogout} className="text-[10px] font-black uppercase text-slate-600 hover:text-red-500 tracking-widest transition-colors block w-full text-center">Terminate Session</button>
                  </div>
                  <div className="pt-6 border-t border-white/5 opacity-40"><p className="text-[8px] font-black text-slate-500 uppercase italic">Master Node: {userEmail}</p></div>
               </motion.div>
             </div>
          </motion.main>
        ) : (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-screen overflow-hidden">
             <aside className="hidden lg:flex w-[88px] glass-panel border-r border-white/5 flex-col items-center py-8 bg-[#010409]/90 backdrop-blur-3xl z-[100]">
                <div className="mb-12 cursor-pointer group" onClick={() => selectFeature('menu')}>
                   <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-cyan-500/50 transition-all">
                      <span className="text-white font-black italic text-xl">S</span>
                   </div>
                </div>
                <nav className="flex-1 space-y-4 w-full px-2">
                   <NavButton active={activeFeature === 'menu'} onClick={() => selectFeature('menu'} icon="fa-grid-horizontal" label="Home" />
                   <NavButton active={activeFeature === 'members'} onClick={() => selectFeature('members')} icon="fa-shield-halved" label="Admin" />
                   <NavButton active={activeFeature === 'txt2img'} onClick={() => selectFeature('txt2img')} icon="fa-wand-magic-sparkles" label="Draw" />
                   <NavButton active={activeFeature === 'img2vid'} onClick={() => selectFeature('img2vid')} icon="fa-film" label="Move" />
                   <NavButton active={activeFeature === 'studio'} onClick={() => selectFeature('studio')} icon="fa-bolt-lightning" label="Pro" />
                   <NavButton active={activeFeature === 'direct-chat'} onClick={() => selectFeature('direct-chat')} icon="fa-inbox" label="Inbox" />
                   <NavButton active={activeFeature === 'profile'} onClick={() => selectFeature('profile')} icon="fa-user-gear" label="Safe" />
                </nav>
                <button onClick={handleLogout} className="mt-8 w-12 h-12 rounded-2xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all flex items-center justify-center border border-red-500/20 active:scale-90">
                   <i className="fa-solid fa-power-off"></i>
                </button>
             </aside>
             <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                <header className="lg:hidden h-16 border-b border-white/5 bg-[#010409]/95 backdrop-blur-xl flex items-center justify-between px-6 z-50">
                   <button onClick={() => setIsSidebarOpen(true)} className="text-slate-400"><i className="fa-solid fa-bars-staggered"></i></button>
                   <h1 className="text-xs font-black italic uppercase">SATMOKO <span className="text-cyan-400">STUDIO</span></h1>
                   <div className={`w-2 h-2 rounded-full ${dbStatus === 'online' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500'} animate-pulse`}></div>
                </header>
                <main id="main-content-area" className="flex-1 overflow-y-auto pt-4 lg:pt-10 pb-32 lg:pb-10 custom-scrollbar bg-[#010409]">
                   <div className="max-w-6xl mx-auto px-4 lg:px-12">
                      <AnimatePresence mode="wait">
                         <motion.div key={activeFeature} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}>
                            {renderFeature()}
                         </motion.div>
                      </AnimatePresence>
                   </div>
                </main>
                <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-[#010409]/95 backdrop-blur-2xl border-t border-white/5 flex items-center justify-around z-50 pb-2">
                   <BottomNavBtn active={activeFeature === 'menu'} onClick={() => selectFeature('menu')} icon="fa-house" label="HOME" />
                   <BottomNavBtn active={activeFeature === 'members'} onClick={() => selectFeature('members')} icon="fa-shield-halved" label="ADMIN" />
                   <BottomNavBtn active={activeFeature === 'studio'} onClick={() => selectFeature('studio')} icon="fa-bolt-lightning" label="STUDIO" />
                   <BottomNavBtn active={activeFeature === 'direct-chat'} onClick={() => selectFeature('direct-chat')} icon="fa-inbox" label="INBOX" />
                </nav>
             </div>
             <AnimatePresence>
                {isSidebarOpen && (
                  <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] lg:hidden" />
                    <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} className="fixed inset-y-0 left-0 w-80 bg-[#0b0f1a] z-[120] p-8 flex flex-col lg:hidden">
                       <div className="flex justify-between items-center mb-10">
                          <h2 className="text-xl font-black italic uppercase">NAVIGATION</h2>
                          <button onClick={() => setIsSidebarOpen(false)} className="text-slate-500"><i className="fa-solid fa-xmark text-xl"></i></button>
                       </div>
                       <nav className="space-y-2 flex-1 overflow-y-auto no-scrollbar">
                          <MobileNavBtn active={activeFeature === 'menu'} onClick={() => selectFeature('menu')} icon="fa-grid-horizontal" label="Dashboard" />
                          <MobileNavBtn active={activeFeature === 'members'} onClick={() => selectFeature('members')} icon="fa-shield-halved" label="Control Admin" />
                          <MobileNavBtn active={activeFeature === 'studio'} onClick={() => selectFeature('studio')} icon="fa-bolt-lightning" label="Studio Pro" />
                          <MobileNavBtn active={activeFeature === 'direct-chat'} onClick={() => selectFeature('direct-chat')} icon="fa-inbox" label="Inbox" />
                       </nav>
                       <button onClick={handleLogout} className="mt-8 py-5 bg-red-500 text-white font-black uppercase rounded-2xl text-[10px] tracking-widest flex items-center justify-center gap-3 active:scale-95"><i className="fa-solid fa-power-off"></i> Logout</button>
                    </motion.aside>
                  </>
                )}
             </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
