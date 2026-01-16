
import React, { useState, useEffect, useMemo } from 'react';
import { RobotHero } from './components/RobotHero';
import { LoginForm } from './components/LoginForm';
import { ChatAssistant } from './components/ChatAssistant';
import { VideoGenerator } from './components/VideoGenerator';
import { ImageGenerator } from './components/ImageGenerator';
import { StudioCreator } from './components/StudioCreator';
import { MemberControl } from './components/MemberControl';
import { Sidebar } from './components/Sidebar';
import { DashboardMenu } from './components/DashboardMenu';
import { ProfileSettings } from './components/ProfileSettings';
import { motion, AnimatePresence } from 'framer-motion';
import { getEnv } from './utils/env';
import { supabase } from './services/supabase';

export type Feature = 'menu' | 'chat' | 'img2vid' | 'text2vid' | 'txt2img' | 'studio' | 'members' | 'profile';

const App: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [validUntil, setValidUntil] = useState<string | null>(null);
  const [activeFeature, setActiveFeature] = useState<Feature>('menu');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [memberCount, setMemberCount] = useState<number>(0);
  const [envTick, setEnvTick] = useState(0); 

  const aiKeyInfo = useMemo(() => {
    const systemKey = process.env.API_KEY;
    const fallbackKey = getEnv('VITE_GEMINI_API_KEY_1');
    const active = systemKey || fallbackKey;
    
    if (!active || active.length < 5) {
      return { name: 'VOID_CORE', mask: 'XXXX-XXXX', active: false };
    }
    return { 
      name: systemKey ? 'SYSTEM_DEPLOY_KEY' : 'OVERRIDE_KEY', 
      mask: `${active.substring(0, 4)}...${active.substring(active.length - 4)}`, 
      active: true 
    };
  }, [envTick]);

  const adminEmails = useMemo(() => getEnv('VITE_ADMIN_EMAILS').split(',').map((e: string) => e.trim().toLowerCase()), [envTick]);
  const isAdmin = useMemo(() => userEmail && adminEmails.includes(userEmail.toLowerCase()), [userEmail, adminEmails]);
  const isTelegramActive = useMemo(() => !!getEnv('VITE_TELEGRAM_BOT_TOKEN') && !!getEnv('VITE_TELEGRAM_CHAT_ID'), [envTick]);

  useEffect(() => {
    const handleEnvUpdate = () => setEnvTick(t => t + 1);
    window.addEventListener('env_updated', handleEnvUpdate);
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('env_updated', handleEnvUpdate);
    };
  }, []);

  useEffect(() => {
    if (isLoggedIn && supabase) {
      supabase.from('members').select('*', { count: 'exact', head: true })
        .then(({ count }) => setMemberCount(count || 0));
    }
  }, [isLoggedIn]);

  const handleLoginSuccess = (email: string, expiry?: string | null) => {
    setUserEmail(email);
    setValidUntil(expiry || null);
    setIsLoggedIn(true);
    setActiveFeature('menu');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail('');
    setActiveFeature('menu');
  };

  const selectFeature = (feature: Feature) => {
    setActiveFeature(feature);
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#010409] text-slate-100 overflow-x-hidden relative font-sans selection:bg-cyan-500/30">
      <BackgroundEffects />

      <AnimatePresence mode="wait">
        {!isLoggedIn ? (
          <motion.main 
            key="login-screen" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0, scale: 0.95 }} 
            className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 min-h-screen w-full overflow-y-auto"
          >
            <div className="w-full max-w-xl flex flex-col items-center justify-center py-10">
              <RobotHero isLoaded={isLoaded} />
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={isLoaded ? { opacity: 1, y: 0 } : {}} 
                transition={{ delay: 1.2, duration: 1 }} 
                className="w-full"
              >
                <LoginForm onSuccess={handleLoginSuccess} />
              </motion.div>
            </div>
          </motion.main>
        ) : (
          <motion.div key="dashboard-main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 flex-1 flex flex-col h-screen overflow-hidden">
            <div className="flex h-full relative">
              <AnimatePresence>
                {(isSidebarOpen || window.innerWidth >= 1024) && (
                  <Sidebar 
                    activeFeature={activeFeature}
                    onSelect={selectFeature}
                    isAdmin={isAdmin}
                    onClose={() => setIsSidebarOpen(false)}
                    isTelegramActive={isTelegramActive}
                    isAiActive={aiKeyInfo.active}
                    aiMask={aiKeyInfo.mask}
                    aiName={aiKeyInfo.name}
                    onLogout={handleLogout}
                  />
                )}
              </AnimatePresence>

              <main className="flex-1 flex flex-col overflow-hidden relative">
                 <header className="px-8 py-5 border-b border-white/5 flex items-center justify-between bg-[#010409]/80 backdrop-blur-xl z-20">
                    <div className="flex items-center gap-5">
                      <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden w-11 h-11 flex items-center justify-center rounded-2xl bg-white/5 text-slate-400 border border-white/5"><i className="fa-solid fa-bars-staggered text-sm"></i></button>
                      <div className="hidden sm:block">
                        <h2 className="text-[11px] font-black text-white uppercase tracking-[0.5em] mb-0.5">COMMAND CONSOLE</h2>
                        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">System Link: <span className={aiKeyInfo.active ? "text-green-500" : "text-red-500"}>{aiKeyInfo.active ? "SECURE" : "VOID"}</span></p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="text-right mr-4 hidden md:block">
                          <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Identity</p>
                          <p className="text-[10px] font-black text-cyan-400 tracking-tighter uppercase">{isAdmin ? 'ADMIN OVERRIDE' : userEmail.split('@')[0]}</p>
                       </div>
                       <button onClick={() => setActiveFeature('profile')} className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center text-xs font-black text-white uppercase bg-slate-900 shadow-xl hover:border-cyan-500/50 transition-all">
                          {userEmail.charAt(0).toUpperCase()}
                       </button>
                    </div>
                 </header>

                 <div className="flex-1 overflow-y-auto p-6 lg:p-12 custom-scrollbar">
                    <div className="max-w-7xl mx-auto h-full">
                      <AnimatePresence mode="wait">
                        <motion.div key={activeFeature} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="h-full">
                          {activeFeature === 'menu' && <DashboardMenu onSelect={setActiveFeature} nodeCount={memberCount} aiActive={aiKeyInfo.active} isAdmin={isAdmin} userName={isAdmin ? 'Pringgo' : userEmail.split('@')[0]} />}
                          {activeFeature === 'chat' && <ChatAssistant onBack={() => setActiveFeature('menu')} />}
                          {activeFeature === 'txt2img' && <ImageGenerator onBack={() => setActiveFeature('menu')} userEmail={userEmail} />}
                          {activeFeature === 'img2vid' && <VideoGenerator mode="img2vid" onBack={() => setActiveFeature('menu')} userEmail={userEmail} />}
                          {activeFeature === 'text2vid' && <VideoGenerator mode="text2vid" onBack={() => setActiveFeature('menu')} userEmail={userEmail} />}
                          {activeFeature === 'studio' && <StudioCreator onBack={() => setActiveFeature('menu')} />}
                          {activeFeature === 'members' && <MemberControl onBack={() => setActiveFeature('menu')} />}
                          {activeFeature === 'profile' && <ProfileSettings onBack={() => setActiveFeature('menu')} userEmail={userEmail} />}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                 </div>
              </main>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const BackgroundEffects = () => (
  <div className="fixed inset-0 pointer-events-none z-0">
    <div className="absolute top-0 left-0 w-full h-full bg-[#010409]"></div>
    <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-cyan-500/5 blur-[120px] rounded-full animate-pulse"></div>
    <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-fuchsia-500/5 blur-[120px] rounded-full animate-pulse [animation-delay:2s]"></div>
  </div>
);

export default App;
