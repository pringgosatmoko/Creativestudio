
import React, { useState, useEffect, useMemo } from 'react';
import { LogoHero } from './components/LogoHero';
import { LoginForm } from './components/LoginForm';
import { ChatAssistant } from './components/ChatAssistant';
import { VideoGenerator } from './components/VideoGenerator';
import { ImageGenerator } from './components/ImageGenerator';
import { StudioCreator } from './components/StudioCreator';
import { MemberControl } from './components/MemberControl';
import { SystemLogs } from './components/SystemLogs';
import { DirectChat } from './components/DirectChat';
import { ProfileSettings } from './components/ProfileSettings';
import { motion, AnimatePresence } from 'framer-motion';

export type Feature = 'menu' | 'chat' | 'img2vid' | 'txt2img' | 'studio' | 'members' | 'logs' | 'direct-chat' | 'profile';

const App: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [activeFeature, setActiveFeature] = useState<Feature>('menu');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const adminEmails = ['pringgosatmoko@gmail.com'];
  const isAdmin = useMemo(() => adminEmails.includes(userEmail.toLowerCase()), [userEmail]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleLoginSuccess = (email: string) => {
    setUserEmail(email);
    setIsLoggedIn(true);
  };

  const renderFeature = () => {
    switch (activeFeature) {
      case 'menu': return <DashboardMenu onSelect={setActiveFeature} isAdmin={isAdmin} />;
      case 'chat': return <ChatAssistant onBack={() => setActiveFeature('menu')} />;
      case 'txt2img': return <ImageGenerator onBack={() => setActiveFeature('menu')} />;
      case 'img2vid': return <VideoGenerator mode="img2vid" onBack={() => setActiveFeature('menu')} />;
      case 'studio': return <StudioCreator onBack={() => setActiveFeature('menu')} />;
      case 'direct-chat': return <DirectChat userEmail={userEmail} isAdmin={isAdmin} adminEmail={adminEmails[0]} onBack={() => setActiveFeature('menu')} />;
      case 'profile': return <ProfileSettings onBack={() => setActiveFeature('menu')} onLogout={() => window.location.reload()} />;
      case 'members': return <MemberControl onBack={() => setActiveFeature('menu')} />;
      case 'logs': return <SystemLogs onBack={() => setActiveFeature('menu')} />;
      default: return <DashboardMenu onSelect={setActiveFeature} isAdmin={isAdmin} />;
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#010409] text-slate-100 overflow-x-hidden font-sans">
      <AnimatePresence mode="wait">
        {!isLoggedIn ? (
          <motion.main 
            key="landing" 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.02, filter: 'blur(10px)' }}
            className="min-h-screen flex flex-col items-center justify-start py-10 city-wallpaper overflow-y-auto no-scrollbar relative"
          >
            {/* Animasi LogoHero di Atas */}
            <div className="w-full flex justify-center mb-4 transform scale-90 lg:scale-100 origin-top">
              <LogoHero isLoaded={isLoaded} />
            </div>
            
            {/* Menu Login di Bawahnya */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={isLoaded ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="w-full max-w-md flex flex-col items-center px-6 z-20 pb-16"
            >
              <LoginForm onSuccess={handleLoginSuccess} />
            </motion.div>
          </motion.main>
        ) : (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-screen overflow-hidden relative">
             <button 
               onClick={() => setIsSidebarOpen(true)}
               className="lg:hidden fixed top-6 right-6 z-[160] w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center backdrop-blur-md shadow-2xl"
             >
               <i className="fa-solid fa-bars text-xl"></i>
             </button>

             <aside className={`
                fixed inset-y-0 left-0 z-[200] w-[280px] bg-[#0d1117] border-r border-white/5 
                transition-transform duration-300 lg:relative lg:translate-x-0 flex flex-col p-6
                ${isSidebarOpen ? 'translate-x-0 shadow-[20px_0_60px_rgba(0,0,0,0.8)]' : '-translate-x-full'}
             `}>
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h1 className="text-xl font-black text-white italic tracking-tighter leading-none uppercase">SATMOKO</h1>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-cyan-400 mt-1">AI CREATIVE V2.8</p>
                  </div>
                  <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-600 p-2"><i className="fa-solid fa-x"></i></button>
                </div>

                <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar">
                  <SidebarLink active={activeFeature === 'menu'} icon="fa-house" label="Beranda" onClick={() => { setActiveFeature('menu'); setIsSidebarOpen(false); }} />
                  <div className="pt-6 pb-2"><p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-700 px-4">Core AI</p></div>
                  <SidebarLink active={activeFeature === 'chat'} icon="fa-comment-dots" label="AI Assistant" onClick={() => { setActiveFeature('chat'); setIsSidebarOpen(false); }} />
                  <SidebarLink active={activeFeature === 'txt2img'} icon="fa-image" label="Visual Art" onClick={() => { setActiveFeature('txt2img'); setIsSidebarOpen(false); }} />
                  <SidebarLink active={activeFeature === 'img2vid'} icon="fa-video" label="Video Engine" onClick={() => { setActiveFeature('img2vid'); setIsSidebarOpen(false); }} />
                  <SidebarLink active={activeFeature === 'studio'} icon="fa-wand-magic-sparkles" label="Ad Creator" onClick={() => { setActiveFeature('studio'); setIsSidebarOpen(false); }} />
                  
                  <div className="pt-6 pb-2"><p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-700 px-4">Workspace</p></div>
                  <SidebarLink active={activeFeature === 'direct-chat'} icon="fa-inbox" label="Direct Inbox" onClick={() => { setActiveFeature('direct-chat'); setIsSidebarOpen(false); }} />
                  <SidebarLink active={activeFeature === 'profile'} icon="fa-user-shield" label="Security" onClick={() => { setActiveFeature('profile'); setIsSidebarOpen(false); }} />

                  {isAdmin && (
                    <>
                      <div className="pt-6 pb-2"><p className="text-[9px] font-black uppercase tracking-[0.4em] text-red-900 px-4">Admin Hub</p></div>
                      <SidebarLink active={activeFeature === 'members'} icon="fa-users-gear" label="Membership" onClick={() => { setActiveFeature('members'); setIsSidebarOpen(false); }} />
                      <SidebarLink active={activeFeature === 'logs'} icon="fa-server" label="Server Status" onClick={() => { setActiveFeature('logs'); setIsSidebarOpen(false); }} />
                    </>
                  )}
                </nav>

                <div className="mt-auto pt-6 border-t border-white/5">
                   <button 
                    onClick={() => window.location.reload()} 
                    className="w-full py-4 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-red-500 hover:text-white transition-all shadow-xl"
                   >
                     LOGOUT SESSION
                   </button>
                </div>
             </aside>

             <main className="flex-1 overflow-y-auto bg-[#010409]">
                <div className="max-w-6xl mx-auto px-6 py-10 lg:py-16">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeFeature}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                    >
                      {renderFeature()}
                    </motion.div>
                  </AnimatePresence>
                </div>
             </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DashboardMenu: React.FC<{ onSelect: (f: Feature) => void; isAdmin: boolean }> = ({ onSelect, isAdmin }) => (
  <div className="space-y-12">
    <header className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
        <p className="text-slate-600 font-black uppercase tracking-[0.4em] text-[10px]">Neural Interface: ONLINE</p>
      </div>
      <h2 className="text-5xl lg:text-7xl font-black italic uppercase tracking-tighter text-white leading-none">
        Command <span className="text-cyan-400">Center</span>
      </h2>
    </header>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <MenuCard icon="fa-comment-dots" title="Assistant" desc="AI knowledge processing node." onClick={() => onSelect('chat')} highlight />
      <MenuCard icon="fa-image" title="Visual Art" desc="Generative visual synthesis." onClick={() => onSelect('txt2img')} />
      <MenuCard icon="fa-film" title="Studio Pro" desc="Professional ad production suite." onClick={() => onSelect('studio')} />
      <MenuCard icon="fa-video" title="Video Engine" desc="Motion frame interpolation." onClick={() => onSelect('img2vid')} />
      <MenuCard icon="fa-inbox" title="Direct Inbox" desc="Secure peer-to-peer transmission." onClick={() => onSelect('direct-chat')} />
      <MenuCard icon="fa-shield" title="Security" desc="Encryption & access protocols." onClick={() => onSelect('profile')} />
    </div>
  </div>
);

const MenuCard: React.FC<{ icon: string; title: string; desc: string; onClick: () => void; highlight?: boolean }> = ({ icon, title, desc, onClick, highlight }) => (
  <button onClick={onClick} className={`glass-panel p-8 rounded-[3rem] text-left border transition-all active:scale-95 group ${highlight ? 'border-cyan-500/30 bg-cyan-500/5 shadow-[0_20px_60px_rgba(34,211,238,0.05)]' : 'border-white/5 hover:border-cyan-500/20'}`}>
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border transition-all ${highlight ? 'bg-cyan-500 text-black border-cyan-400 shadow-lg' : 'bg-slate-900 border-white/5 group-hover:bg-cyan-500 group-hover:text-black'}`}>
       <i className={`fa-solid ${icon} text-2xl`}></i>
    </div>
    <h3 className="text-2xl font-black italic uppercase text-white mb-2 tracking-tighter">{title}</h3>
    <p className="text-[10px] font-bold uppercase text-slate-600 tracking-widest leading-relaxed">{desc}</p>
  </button>
);

const SidebarLink: React.FC<{ active: boolean; onClick: () => void; icon: string; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick} 
    className={`w-full py-4 px-5 rounded-2xl flex items-center gap-4 transition-all group ${active ? 'bg-cyan-500/10 text-white border border-cyan-500/20 shadow-lg' : 'text-slate-600 hover:text-white hover:bg-white/5 border border-transparent'}`}
  >
    <i className={`fa-solid ${icon} text-sm ${active ? 'text-cyan-400' : 'group-hover:text-cyan-400'}`}></i>
    <span className="text-[11px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

export default App;
