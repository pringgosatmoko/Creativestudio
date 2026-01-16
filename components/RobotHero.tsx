
import React from 'react';
import { motion } from 'framer-motion';

interface RobotHeroProps {
  isLoaded: boolean;
  isCompact?: boolean;
}

export const RobotHero: React.FC<RobotHeroProps> = ({ isLoaded, isCompact = false }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className={`relative flex flex-col items-center justify-center w-full transition-all duration-1000 ${isCompact ? 'mb-4' : 'mb-12'}`}
    >
      {/* Branding Core Container */}
      <div className="relative flex flex-col items-center justify-center">
        
        {/* Central Branding Elements */}
        <div className="relative z-10 flex flex-col items-center py-6">
          {/* Metallic SA Logo */}
          <motion.div 
            animate={{ 
              scale: isCompact ? 0.75 : 1,
              y: isCompact ? 0 : 0
            }}
            transition={{ duration: 0.8, ease: "circOut" }}
            className="flex items-center justify-center mb-6"
          >
            <div className="relative group">
              <div className="text-[110px] lg:text-[140px] font-black italic tracking-tighter leading-none flex select-none">
                <span className="text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">S</span>
                <span className="text-cyan-400 drop-shadow-[0_0_35px_rgba(34,211,238,0.4)] -ml-4">A</span>
              </div>
              {/* Refined Glossy Overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/5 opacity-30 pointer-events-none mix-blend-overlay"></div>
            </div>
          </motion.div>

          {/* Text Branding */}
          <motion.div 
            animate={{ 
              opacity: isCompact ? 0.9 : 1,
              scale: isCompact ? 0.9 : 1
            }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-1.5"
          >
            <h1 className="text-3xl lg:text-5xl font-black italic uppercase tracking-tighter text-white drop-shadow-2xl">
              SATMOKO <span className="text-slate-500">STUDIO</span>
            </h1>
            <div className="flex items-center justify-center gap-4">
              <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-cyan-500/40"></div>
              <p className="text-cyan-400 font-black italic uppercase tracking-[0.5em] text-[10px] lg:text-[12px]">
                AI CREATIVE CORE
              </p>
              <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-cyan-500/40"></div>
            </div>

            {/* Enhanced Animated Tagline */}
            <div className="pt-4 overflow-hidden">
              <motion.div
                animate={{
                  opacity: isCompact ? [0.4, 0.7, 0.4] : [0.6, 1, 0.6],
                  scale: [1, 1.05, 1],
                  textShadow: [
                    "0 0 0px rgba(34,211,238,0)",
                    "0 0 15px rgba(34,211,238,0.6)",
                    "0 0 0px rgba(34,211,238,0)"
                  ]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative"
              >
                <p className="text-white font-black italic uppercase tracking-[0.6em] text-[10px] lg:text-[14px] leading-none select-none">
                  ORA NGAPAK <span className="text-cyan-400">ORA PENAK</span>
                </p>
                {/* Subtle reflection effect below */}
                <p className="text-cyan-500/10 font-black italic uppercase tracking-[0.6em] text-[10px] lg:text-[14px] leading-none absolute top-full left-0 right-0 transform scale-y-[-1] blur-[1px] mt-1">
                   ORA NGAPAK ORA PENAK
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
