
import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface LogoHeroProps {
  isLoaded: boolean;
}

export const LogoHero: React.FC<LogoHeroProps> = ({ isLoaded }) => {
  const [imgError, setImgError] = useState(false);
  const ngapakText = "ORA NGAPAK ORA KEPENAK";

  return (
    <div className="relative flex flex-col items-center w-full select-none">
      {/* Glow Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-96 h-96 bg-cyan-500/10 blur-[130px] rounded-full animate-pulse"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 30 }}
        animate={isLoaded ? { opacity: 1, scale: 1, y: 0 } : {}}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex flex-col items-center"
      >
        {/* Karakter Master Satya */}
        <motion.div 
          animate={{ y: [0, -12, 0] }} 
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} 
          className="relative mb-8"
        >
          {/* Ring Animasi */}
          <div className="absolute inset-0 rounded-full border-2 border-cyan-500/10 scale-[1.2] ring-pulse-custom"></div>
          
          <div className="relative z-10 w-48 h-48 lg:w-56 lg:h-56 overflow-hidden rounded-[3rem] border-4 border-white/10 shadow-[0_30px_70px_rgba(0,0,0,0.5),0_0_40px_rgba(34,211,238,0.1)] bg-[#0d1117] flex items-center justify-center">
            {!imgError ? (
              <img 
                src="https://rpythpxxskujmthnmbnx.supabase.co/storage/v1/object/public/assets/satya_character.jpg" 
                alt="Satya Master" 
                onError={() => setImgError(true)} 
                className="w-full h-full object-cover object-center transform scale-105 hover:scale-110 transition-transform duration-700" 
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-cyan-500/40">
                <i className="fa-solid fa-user-astronaut text-6xl mb-3"></i>
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Master Node</span>
              </div>
            )}
            
            {/* Animasi Scan Line Futuristik */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
               <motion.div 
                 animate={{ y: [-200, 500] }} 
                 transition={{ duration: 4, repeat: Infinity, ease: "linear" }} 
                 className="w-full h-24 bg-gradient-to-b from-transparent via-cyan-400/60 to-transparent" 
               />
            </div>
          </div>
          
          <motion.div 
            animate={{ scale: [1, 1.05, 1] }} 
            transition={{ duration: 3, repeat: Infinity }} 
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-cyan-500 text-black px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-[0.3em] shadow-[0_10px_30px_rgba(34,211,238,0.3)] z-20 whitespace-nowrap border border-cyan-300"
          >
            SYSTEM ONLINE
          </motion.div>
        </motion.div>

        {/* Branding Satmoko Studio */}
        <div className="text-center">
          <h1 className="text-5xl lg:text-6xl font-black italic uppercase tracking-tighter text-white leading-none drop-shadow-2xl">
            SATMOKO <span className="text-cyan-400">STUDIO</span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.7em] text-slate-500 mt-4 ml-2">ADVANCED AI CREATIVE HUB</p>

          <div className="mt-8 flex justify-center gap-3">
            {ngapakText.split(" ").map((word, wIdx) => (
              <motion.span 
                key={wIdx}
                initial={{ opacity: 0 }}
                animate={isLoaded ? { opacity: 1 } : {}}
                transition={{ delay: 1.2 + (wIdx * 0.2) }}
                className="text-[13px] lg:text-[15px] font-black italic uppercase tracking-[0.2em] text-white/30"
              >
                {word}
              </motion.span>
            ))}
          </div>
        </div>
      </motion.div>
      
      <style>{`
        .ring-pulse-custom { animation: orbit-custom 12s linear infinite; }
        @keyframes orbit-custom { 
          0% { transform: scale(1.2) rotate(0deg); opacity: 0.1; } 
          50% { transform: scale(1.25) rotate(180deg); opacity: 0.4; } 
          100% { transform: scale(1.2) rotate(360deg); opacity: 0.1; } 
        }
      `}</style>
    </div>
  );
};
