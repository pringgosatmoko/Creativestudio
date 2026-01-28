
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { LogoHero } from './components/LogoHero';
import { LoginForm } from './components/LoginForm';
import { ChatAssistant } from './components/ChatAssistant';
import { VideoGenerator } from './components/VideoGenerator';
import { ImageGenerator } from './components/ImageGenerator';
import { StudioCreator } from './components/StudioCreator';
import { StoryboardToVideo } from './components/StoryboardToVideo';
import { VoiceCloning } from './components/VoiceCloning';
import { MemberControl } from './components/MemberControl';
import { SystemLogs } from './components/SystemLogs';
import { DirectChat } from './components/DirectChat';
import { ProfileSettings } from './components/ProfileSettings';
import { StartAnimation } from './components/StartAnimation';
import { SloganAnimation } from './components/SloganAnimation';
import { LandingHero } from './components/LandingHero';
import { StorageManager } from './components/StorageManager';
import { PriceManager } from './components/PriceManager';
import { ProductSlider } from './components/ProductSlider';
import { VideoDirector } from './components/VideoDirector';
import { AspectRatioEditor } from './components/AspectRatioEditor';
import { TopupCenter } from './components/TopupCenter';
import { LandingFooter } from './components/LandingFooter';
import { motion, AnimatePresence } from 'framer-motion';
import { isAdmin as checkAdmin, updatePresence, supabase, sendTelegramNotification } from './lib/api';

export type Feature = 'menu' | 'chat' | 'img2vid' | 'txt2img' | 'studio' | 'storyboard-to-video' | 'voice-cloning' | 'members' | 'logs' | 'direct-chat' | 'profile' | 'storage' | 'price-center' | 'video-director' | 'aspect-ratio' | 'topup';
export type Lang = 'id' | 'en';

const SideIcon = ({ active, icon, onClick, label }: { active: boolean, icon: string, onClick: () => void, label: string }) => (
  <button 
    onClick={onClick} 
    className={`flex-1 lg:w-full p-3 lg:p-4 rounded-xl lg:rounded-2xl flex flex-col lg:flex-row items-center gap-1 lg:gap-4 transition-all relative group ${active ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
  >
    <div className="w-6 flex justify-center text-base lg:text-lg"><i className={`fa-solid ${icon}`}></i></div>
    <span className="text-[7px] lg:text-[10px] font-bold uppercase tracking-widest">{label}</span>
  </button>
);

const MenuCard = ({ icon, title, desc, onClick, color }: any) => {
  const iconColors: any = {
    cyan: 'text-cyan-400 bg-cyan-400/10',
    fuchsia: 'text-fuchsia-400 bg-fuchsia-400/10',
    emerald: 'text-emerald-400 bg-emerald-400/10',
    orange: 'text-orange-400 bg-orange-400/10',
    red: 'text-red-400 bg-red-400/10',
    blue: 'text-blue-400 bg-blue-400/10',
    yellow: 'text-yellow-400 bg-yellow-400/10'
  };

  return (
    <motion.button 
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick} 
      className={`cyber-card p-5 lg:p-8 rounded-3xl text-left flex flex-col gap-4 lg:gap-6 h-full border border-white/5 bg-slate-900/40`}
    >
      <div className={`w-10 h-10 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center text-lg lg:text-2xl ${iconColors[color] || iconColors.cyan} border border-white/5`}>
        <i className={`fa-solid ${icon}`}></i>
      </div>
      <div>
        <h3 className="text-xs lg:text-sm font-bold uppercase text-white tracking-widest leading-none mb-2">{title}</h3>
        <p className="text-[8px] lg:text-[9px] text-slate-500 font-medium uppercase tracking-widest leading-relaxed line-clamp-2">{desc}</p>
      </div>
      <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
        <span className="text-[6px] lg:text-[7px] font-bold text-slate-600 uppercase tracking-[0.3em]">Mandiri</span>
        <i className="fa-solid fa-arrow-right-long text-[10px] text-slate-700"></i>
      </div>
    </motion.button>
  );
};

const DashboardMenu = ({ onSelect, isAdmin, t, credits }: { onSelect: (f: Feature) => void, isAdmin: boolean, t: any, credits: number }) => (
  <div className="max-w-7xl mx-auto space-y-8 lg:space-y-12 py-4 lg:py-6 relative">
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 lg:gap-8 border-b border-white/5 pb-8 lg:pb-12">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
           <span className="px-2 py-0.5 bg-cyan-500 text-black text-[8px] font-bold rounded-md uppercase tracking-widest">SISTEM AKTIF</span>
           <span className="text-[9px] text-slate-600 font-mono hidden sm:block">STATUS: STABIL // ENKRIPSI: AES-256</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold uppercase text-white tracking-tighter leading-none">Menu <span className="text-cyan-400">Utama</span></h1>
        <p className="text-[9px] lg:text-[11px] font-medium uppercase tracking-[0.4em] text-slate-500 leading-tight">{t.subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          onClick={() => onSelect('topup')} 
          className="glass-panel p-4 lg:p-6 rounded-3xl hover:bg-cyan-500/5 transition-all flex items-center gap-4 lg:gap-6 group border-white/5"
        >
          <div className="w-10 h-10 lg:w-14 lg:h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all"><i className="fa-solid fa-wallet text-lg"></i></div>
          <div className="text-right">
            <p className="text-[7px] lg:text-[9px] font-bold uppercase text-slate-500 tracking-widest mb-1">SALDO ANDA</p>
            <p className="text-xl lg:text-3xl font-bold text-cyan-400 tabular-nums leading-none">{credits.toLocaleString()} <span className="text-[10px] lg:text-xs not-italic">CR</span></p>
          </div>
        </motion.button>
      </div>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 pb-40 lg:pb-20">
      <MenuCard icon="fa-user-shield" title={t.profile} desc="Ubah Email, Password & Keamanan" onClick={() => onSelect('profile')} color="blue" />
      <MenuCard icon="fa-clapperboard" title={t.videoDirector} desc="Spesialis Alur Cerita & Sutradara AI" onClick={() => onSelect('video-director')} color="orange" />
      <MenuCard icon="fa-brain" title={t.aiAssistant} desc="Asisten Pintar Berbasis Kecerdasan Buatan" onClick={() => onSelect('chat')} color="cyan" />
      <MenuCard icon="fa-film" title={t.studio} desc="Modul Otomatisasi Video Iklan Profesional" onClick={() => onSelect('studio')} color="yellow" />
      <MenuCard icon="fa-rectangle-list" title={t.storyboardToVid} desc="Ubah Naskah Panjang Jadi Video Utuh" onClick={() => onSelect('storyboard-to-video')} color="emerald" />
      <MenuCard icon="fa-image" title={t.visualArt} desc="Pembuatan Gambar Kualitas Tinggi" onClick={() => onSelect('txt2img')} color="fuchsia" />
      <MenuCard icon="fa-vector-square" title={t.aspectRatio} desc="Ubah Ukuran Gambar Secara Otomatis" onClick={() => onSelect('aspect-ratio')} color="emerald" />
      <MenuCard icon="fa-video" title={t.video} desc="Pembuatan Video Sinematik Veo 3.1" onClick={() => onSelect('img2vid')} color="cyan" />
      <MenuCard icon="fa-microphone-lines" title={t.voice} desc="Kloning Suara Manusia dengan AI" onClick={() => onSelect('voice-cloning')} color="emerald" />
      <MenuCard icon="fa-envelope" title={t.inbox} desc="Layanan Pesan Antar Pengguna" onClick={() => onSelect('direct-chat')} color="cyan" />
    </div>

    {isAdmin && (
      <div className="space-y-6 pt-6 lg:pt-12 pb-48 lg:pb-24">
        <div className="flex items-center gap-6">
          <span className="h-px bg-red-500/20 flex-1"></span>
          <p className="text-[8px] lg:text-[10px] font-bold uppercase text-red-500 tracking-[0.4em]">PANEL ADMIN</p>
          <span className="h-px bg-red-500/20 flex-1"></span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MenuCard icon="fa-user-gear" title={t.members} onClick={() => onSelect('members')} color="red" />
          <MenuCard icon="fa-server" title={t.logs} onClick={() => onSelect('logs')} color="red" />
          <MenuCard icon="fa-database" title={t.storage} onClick={() => onSelect('storage')} color="red" />
          <MenuCard icon="fa-tags" title={t.priceCenter} onClick={() => onSelect('price-center')} color="red" />
        </div>
      </div>
    )}
  </div>
);

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [userCredits, setUserCredits] = useState(0);
  const [expiryDate, setExpiryDate] = useState<string | null>(null);
  const [activeFeature, setActiveFeature] = useState<Feature>('menu');
  const [lang, setLang] = useState<Lang>('id');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const isAdmin = useMemo(() => userEmail ? checkAdmin(userEmail.toLowerCase()) : false, [userEmail]);
  const adminEmail = "rlirp3fop@mozmail.com";

  const refreshUserData = useCallback(async (emailToUse?: string) => {
    const email = emailToUse || userEmail;
    if (email) {
      if (checkAdmin(email)) { 
        setUserCredits(999999); 
        setExpiryDate(null); 
        return; 
      }
      const { data } = await supabase.from('members').select('credits, valid_until').eq('email', email.toLowerCase()).single();
      if (data) { 
        setUserCredits(data.credits || 0); 
        setExpiryDate(data.valid_until || null); 
      }
    }
  }, [userEmail]);

  // Handle Persistence on Refresh
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setUserEmail(session.user.email);
        setIsLoggedIn(true);
        refreshUserData(session.user.email);
      }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.email) {
        setUserEmail(session.user.email);
        setIsLoggedIn(true);
        refreshUserData(session.user.email);
      } else if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false);
        setUserEmail('');
        setActiveFeature('menu');
      }
    });

    return () => subscription.unsubscribe();
  }, [refreshUserData]);

  useEffect(() => {
    if (isLoggedIn && userEmail) {
      const normalizedEmail = userEmail.toLowerCase();
      updatePresence(normalizedEmail);
      refreshUserData();
      const heartbeat = setInterval(() => { 
        updatePresence(normalizedEmail); 
        refreshUserData(); 
      }, 15000);
      return () => clearInterval(heartbeat);
    }
  }, [isLoggedIn, userEmail, refreshUserData]);

  const handleLoginSuccess = (email: string, expiry?: string | null) => {
    setUserEmail(email);
    setExpiryDate(expiry || null);
    setIsLoggedIn(true);
    sendTelegramNotification(`👤 *User Login*\nEmail: ${email}`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setUserEmail('');
    setUserCredits(0);
    setExpiryDate(null);
    setActiveFeature('menu');
    setAuthMode('login');
  };

  const translations = {
    id: { 
      home: "BERANDA", 
      aiAssistant: "ASISTEN AI", 
      visualArt: "GAMBAR", 
      aspectRatio: "RASIO", 
      voice: "SUARA", 
      video: "VIDEO", 
      studio: "STUDIO IKLAN", 
      storyboardToVid: "SCENE STORYBOARD", 
      videoDirector: "SUTRADARA", 
      inbox: "PESAN", 
      members: "PENGGUNA", 
      logs: "LOGS", 
      storage: "DATA", 
      priceCenter: "HARGA", 
      logout: "KELUAR", 
      subtitle: "PUSAT KREASI DIGITAL PROFESIONAL", 
      adminSection: "AKSES ADMIN AMAN", 
      topup: "ISI SALDO", 
      navFitur: "FITUR", 
      navKontak: "KONTAK", 
      navInfo: "INFO", 
      featuresTitle: "MODUL KREATIF AI", 
      contactTitle: "DAPATKAN AKSES", 
      websiteInfo: "Infrastruktur AI Perusahaan.", 
      login: "MASUK", 
      register: "DAFTAR",
      profile: "PROFIL"
    },
    en: { 
      home: "HOME", 
      aiAssistant: "AI CHAT", 
      visualArt: "ART", 
      aspectRatio: "RATIO", 
      voice: "VOICE", 
      video: "VIDEO", 
      studio: "AD STUDIO", 
      storyboardToVid: "SCENE STORY", 
      videoDirector: "DIRECTOR", 
      inbox: "INBOX", 
      members: "USERS", 
      logs: "LOGS", 
      storage: "DATA", 
      priceCenter: "PRICES", 
      logout: "EXIT", 
      subtitle: "PROFESSIONAL CREATIVE COMMAND CENTER", 
      adminSection: "SECURE ADMIN ACCESS", 
      topup: "TOPUP", 
      navFitur: "FEATURES", 
      navKontak: "CONTACT", 
      navInfo: "INFO", 
      featuresTitle: "AI CREATIVE MODULES", 
      contactTitle: "GET ACCESS", 
      websiteInfo: "Enterprise AI Infrastructure.", 
      login: "LOGIN", 
      register: "REGISTER",
      profile: "PROFILE"
    }
  };
  const t = translations[lang];

  return (
    <div className="h-screen w-full bg-[#020617] text-slate-100 font-sans selection:bg-cyan-500/30 overflow-hidden flex flex-col relative">
      <div className="scan-line"></div>
      
      <AnimatePresence mode="wait">
        {showIntro ? (
          <StartAnimation key="intro" onComplete={() => setShowIntro(false)} />
        ) : !isLoggedIn ? (
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full w-full flex flex-col overflow-y-auto no-scrollbar scroll-smooth">
            {/* STICKY NAV */}
            <nav className="fixed top-0 left-0 w-full z-[500] h-20 px-6 lg:px-16 flex items-center justify-between glass-panel border-b border-white/5 bg-[#020617]/90 backdrop-blur-3xl">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-cyan-500 flex items-center justify-center text-black font-bold text-sm">S</div>
                 <span className="text-sm font-bold uppercase tracking-[0.3em] hidden sm:block">SATMOKO <span className="text-cyan-400">STUDIO</span></span>
              </div>
              <div className="hidden lg:flex items-center gap-10">
                 <a href="#hero" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">BERANDA</a>
                 <a href="#portal" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">LOGIN</a>
              </div>
              <a href="#portal" onClick={() => setAuthMode('register')} className="px-6 py-2.5 bg-white text-black text-[9px] font-bold uppercase rounded-xl shadow-xl hover:bg-cyan-500 hover:text-white transition-all">MULAI SEKARANG</a>
            </nav>

            {/* HERO + LOGIN SECTION COHESIVE */}
            <section id="hero" className="min-h-screen flex flex-col items-center justify-center px-6 pt-32 pb-20 bg-gradient-to-b from-[#020617] to-[#010409] relative overflow-hidden">
               {/* ANIMATION HERO */}
               <div className="mb-8 scale-90 sm:scale-100">
                  <LandingHero />
               </div>
               
               {/* BRANDING */}
               <div className="text-center space-y-4 mb-12 relative z-20">
                  <LogoHero isLoaded={true} />
                  <SloganAnimation />
               </div>

               {/* LOGIN FORM - RIGHT BELOW ANIMATION */}
               <motion.div 
                 id="portal" 
                 initial={{ opacity: 0, y: 30 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.5 }}
                 className="w-full max-w-md mx-auto relative z-20"
               >
                  <LoginForm onSuccess={handleLoginSuccess} lang={lang} forcedMode={authMode} />
               </motion.div>

               <div className="mt-20 group flex flex-col items-center gap-4 opacity-30">
                  <span className="text-[9px] font-bold uppercase text-slate-600 tracking-widest">INFO LEBIH LANJUT</span>
                  <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center animate-bounce text-cyan-400"><i className="fa-solid fa-chevron-down text-[10px]"></i></div>
               </div>
            </section>

            <section className="px-6 lg:px-16 py-20 bg-black/20">
               <ProductSlider lang={lang} />
            </section>

            <section id="features" className="py-40 px-6 lg:px-16">
               <div className="max-w-7xl mx-auto text-center mb-20">
                  <h2 className="text-4xl lg:text-5xl font-bold uppercase text-white tracking-tighter">{t.featuresTitle}</h2>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* Additional info grid can go here */}
               </div>
            </section>

            <section id="info" className="py-20 border-t border-white/5 bg-black/40">
               <LandingFooter lang={lang} />
            </section>
          </motion.div>
        ) : (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-screen overflow-hidden bg-[#020617] relative">
             {/* SIDEBAR */}
             <aside className="hidden lg:flex flex-col w-[280px] bg-[#0f172a]/95 border-r border-white/5 py-10 px-6 flex-shrink-0 z-50">
                <div className="flex items-center gap-4 mb-16">
                  <div onClick={() => setActiveFeature('menu')} className="w-12 h-12 rounded-2xl bg-cyan-500 flex items-center justify-center text-black shadow-lg cursor-pointer transition-all active:scale-95"><i className="fa-solid fa-bolt-lightning text-xl"></i></div>
                  <div>
                    <p className="text-xs font-bold uppercase text-white tracking-widest leading-none">SATMOKO</p>
                    <p className="text-[8px] font-bold uppercase text-cyan-400 tracking-[0.4em] mt-2">v7.6_SISTEM</p>
                  </div>
                </div>
                <nav className="flex-1 flex flex-col gap-3">
                  <SideIcon active={activeFeature === 'menu'} icon="fa-house" onClick={() => setActiveFeature('menu')} label={t.home} />
                  <SideIcon active={activeFeature === 'chat'} icon="fa-comment-dots" onClick={() => setActiveFeature('chat')} label={t.aiAssistant} />
                  <SideIcon active={activeFeature === 'txt2img'} icon="fa-image" onClick={() => setActiveFeature('txt2img')} label={t.visualArt} />
                  <SideIcon active={activeFeature === 'img2vid'} icon="fa-video" onClick={() => setActiveFeature('img2vid')} label={t.video} />
                </nav>
                <div className="mt-auto space-y-4">
                  <button onClick={() => setActiveFeature('profile')} className={`w-full py-4 rounded-2xl border flex items-center justify-center gap-4 ${activeFeature === 'profile' ? 'bg-white text-black' : 'bg-white/5 text-slate-500 border-white/5'}`}><i className="fa-solid fa-user-shield"></i> <span className="text-[9px] font-bold uppercase">PROFIL</span></button>
                </div>
             </aside>

             {/* MAIN AREA */}
             <main className="flex-1 overflow-y-auto no-scrollbar relative px-4 lg:px-12 py-6 lg:py-10 pb-48 lg:pb-10">
                
                {/* GLOBAL LOGOUT BUTTON - SELALU MUNCUL DI SEMUA HALAMAN (kecuali profile karena sudah ada) */}
                {activeFeature !== 'profile' && (
                  <div className="absolute top-6 right-6 lg:top-10 lg:right-12 z-[100] flex items-center gap-3">
                     <button 
                        onClick={handleLogout}
                        data-testid="global-logout-btn"
                        className="group flex items-center gap-3 bg-red-500/10 hover:bg-red-500 border border-red-500/20 hover:border-red-400 px-4 py-2 lg:px-6 lg:py-3 rounded-xl lg:rounded-2xl transition-all shadow-xl active:scale-95"
                     >
                        <i className="fa-solid fa-power-off text-red-500 group-hover:text-white text-xs lg:text-base"></i>
                        <span className="text-[8px] lg:text-[10px] font-black uppercase text-red-500 group-hover:text-white tracking-widest">{t.logout}</span>
                     </button>
                  </div>
                )}

                <div className="max-w-[1400px] mx-auto h-full">
                  <AnimatePresence mode="wait">
                    <motion.div key={activeFeature} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="h-full">
                      {(() => {
                        const props = { onBack: () => setActiveFeature('menu'), lang, userEmail, credits: userCredits, validUntil: expiryDate, refreshCredits: refreshUserData };
                        switch (activeFeature) {
                          case 'chat': return <ChatAssistant {...props} />;
                          case 'img2vid': return <VideoGenerator mode="img2vid" {...props} />;
                          case 'txt2img': return <ImageGenerator {...props} />;
                          case 'aspect-ratio': return <AspectRatioEditor {...props} />;
                          case 'studio': return <StudioCreator {...props} />;
                          case 'storyboard-to-video': return <StoryboardToVideo {...props} />;
                          case 'voice-cloning': return <VoiceCloning {...props} />;
                          case 'video-director': return <VideoDirector {...props} />;
                          case 'members': return <MemberControl {...props} />;
                          case 'logs': return <SystemLogs {...props} />;
                          case 'storage': return <StorageManager {...props} />;
                          case 'price-center': return <PriceManager {...props} />;
                          case 'direct-chat': return <DirectChat isAdmin={isAdmin} adminEmail={adminEmail} {...props} />;
                          case 'profile': return (
                            <div className="space-y-6">
                              <ProfileSettings {...props} onLogout={handleLogout} />
                            </div>
                          );
                          case 'topup': return <TopupCenter {...props} />;
                          default: return <DashboardMenu onSelect={setActiveFeature} isAdmin={isAdmin} t={t} credits={userCredits} />;
                        }
                      })()}
                    </motion.div>
                  </AnimatePresence>
                </div>
             </main>

             {/* BOTTOM NAV MOBILE */}
             <div className="lg:hidden fixed bottom-0 left-0 w-full z-[400] bg-[#020617]/95 border-t border-white/5 px-4 py-3 flex items-center justify-between shadow-2xl backdrop-blur-3xl">
                <SideIcon active={activeFeature === 'menu'} icon="fa-house" onClick={() => setActiveFeature('menu')} label={t.home} />
                <SideIcon active={activeFeature === 'chat'} icon="fa-comment-dots" onClick={() => setActiveFeature('chat')} label={t.aiAssistant} />
                <SideIcon active={activeFeature === 'txt2img'} icon="fa-image" onClick={() => setActiveFeature('txt2img')} label={t.visualArt} />
                <SideIcon active={activeFeature === 'img2vid'} icon="fa-video" onClick={() => setActiveFeature('img2vid')} label={t.video} />
                <SideIcon active={activeFeature === 'profile'} icon="fa-user-shield" onClick={() => setActiveFeature('profile')} label={t.profile} />
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
