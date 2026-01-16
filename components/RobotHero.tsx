
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RobotHeroProps {
  isLoaded: boolean;
}

export const RobotHero: React.FC<RobotHeroProps> = ({ isLoaded }) => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [bootPhase, setBootPhase] = useState(0);
  
  const messages = [
    "Initializing Neural Core...",
    "Scanning Master Frequency...",
    "Syncing Creative Modules...",
    "Satmoko Protocol: Active"
  ];

  useEffect(() => {
    if (isLoaded) {
      const interval = setInterval(() => {
        setMessageIndex((prev) => (prev + 1) % messages.length);
      }, 2500);
      
      const bootTimer = setInterval(() => {
        setBootPhase(p => (p < 5 ? p + 1 : p));
      }, 500);

      return () => {
        clearInterval(interval);
        clearInterval(bootTimer);
      };
    }
  }, [isLoaded]);

  return (
    <div className="relative flex flex-col items-center w-full max-w-md mx-auto overflow-visible mb-4 mt-8">
      {/* Background Atmospheric Glows */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center -top-20">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1], 
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="w-[300px] h-[300px] bg-cyan-500 rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1], 
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute w-[400px] h-[400px] bg-fuchsia-600 rounded-full blur-[120px]"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isLoaded ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center w-full"
      >
        {/* THE NEURAL CORE (The "Robot" Eye/Brain) */}
        <div className="relative mb-12 h-64 w-full flex items-center justify-center scale-75 md:scale-100">
          
          {/* Outer Rotating Rings */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute w-64 h-64 border-[0.5px] border-cyan-500/20 rounded-full shadow-[inset_0_0_30px_rgba(34,211,238,0.1)]"
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute w-56 h-56 border-[1px] border-fuchsia-500/10 rounded-full"
          />
          <motion.div 
            animate={{ rotate: 360, scale: [1, 1.05, 1] }}
            transition={{ rotate: { duration: 30, repeat: Infinity, ease: "linear" }, scale: { duration: 4, repeat: Infinity } }}
            className="absolute w-48 h-48 border-[2px] border-dashed border-cyan-500/30 rounded-full"
          />

          {/* Central AI Core Body */}
          <motion.div 
            animate={{ 
              y: [0, -15, 0],
              boxShadow: ["0 0 20px rgba(34,211,238,0.2)", "0 0 60px rgba(34,211,238,0.5)", "0 0 20px rgba(34,211,238,0.2)"]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-32 h-32 bg-[#020617] rounded-3xl border border-white/10 flex items-center justify-center overflow-hidden z-20"
          >
            {/* Inner Core Eye */}
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-16 h-16 bg-cyan-400 rounded-full blur-md opacity-80"
            />
            <div className="absolute w-8 h-8 bg-white rounded-full blur-[2px] shadow-[0_0_20px_#fff]"></div>
            
            {/* Tech Grid Overlay */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#22d3ee 0.5px, transparent 0.5px)', backgroundSize: '8px 8px' }}></div>
          </motion.div>

          {/* Scanning Laser */}
          <motion.div
            animate={{ top: ['10%', '90%', '10%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute left-[20%] right-[20%] h-[1px] bg-cyan-400 shadow-[0_0_10px_#22d3ee] z-30 opacity-70"
          />

          {/* Particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ 
                y: [-20, -100], 
                x: [0, (i % 2 === 0 ? 40 : -40)],
                opacity: [0, 1, 0] 
              }}
              transition={{ duration: 2 + i, repeat: Infinity, delay: i * 0.5 }}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full blur-[1px]"
              style={{ bottom: '40%' }}
            />
          ))}

          {/* Floor Reflection */}
          <div className="absolute -bottom-10 w-40 h-4 bg-cyan-500/10 rounded-full blur-xl"></div>
        </div>

        {/* Branding Interface */}
        <div className="text-center mt-4 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
          >
            <h2 className="text-5xl font-display font-black text-white uppercase italic tracking-tighter leading-none">
              SATMOKO<span className="text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.6)]">STUDIO</span>
            </h2>
            <div className="flex items-center justify-center gap-3 mt-4">
              <div className="h-[1px] w-8 bg-slate-800"></div>
              <p className="text-[9px] font-black uppercase tracking-[0.6em] text-slate-500">NEURAL INTERFACE V4.0</p>
              <div className="h-[1px] w-8 bg-slate-800"></div>
            </div>
          </motion.div>
        </div>

        {/* System Diagnostics */}
        <div className="flex flex-col items-center gap-4 w-full px-12">
          <div className="flex gap-2.5 w-full justify-center">
            {[0, 1, 2, 3, 4].map(i => (
              <motion.div 
                key={i}
                initial={{ opacity: 0.1 }}
                animate={bootPhase >= i ? { 
                  backgroundColor: "#22d3ee", 
                  opacity: 1,
                  scaleY: [1, 1.5, 1],
                  boxShadow: "0 0 10px rgba(34,211,238,0.6)"
                } : { 
                  backgroundColor: "#1e293b", 
                  opacity: 0.2 
                }}
                transition={{ duration: 0.5 }}
                className="w-12 h-1 rounded-full"
              />
            ))}
          </div>
          
          <div className="h-6 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={messageIndex}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.4 }}
                className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-500/70"
              >
                {messages[messageIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
