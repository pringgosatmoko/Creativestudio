
import React from 'react';
import { motion } from 'framer-motion';

export const LandingHero: React.FC = () => {
  return (
    <div className="relative w-full max-w-[200px] md:max-w-[280px] aspect-square flex items-center justify-center mt-12 mb-6 overflow-visible select-none">
      
      {/* Background Glow & Flare */}
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 via-transparent to-purple-500/5 blur-[60px] animate-pulse"></div>

      {/* NEON PORTAL RINGS - Repositioned slightly lower for safe zone */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
        className="absolute w-[85%] h-[85%] rounded-full border-[0.5px] border-cyan-400/20 shadow-[0_0_15px_rgba(34,211,238,0.1),inset_0_0_10px_rgba(34,211,238,0.05)] translate-y-2"
      />
      <motion.div 
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute w-[82%] h-[82%] rounded-full border-[1px] border-transparent border-t-purple-500/20 border-b-cyan-400/20 shadow-[0_0_20px_rgba(217,70,239,0.05)] translate-y-2"
      />

      {/* THE 3D LOGO CONTAINER - Adjusted Y-offset for cinematic centering */}
      <motion.div 
        animate={{ 
          y: [0, -8, 0],
          rotateY: [-6, 6, -6],
          rotateX: [2, -2, 2]
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="relative w-[60%] h-[60%] flex items-center justify-center perspective-[1500px] translate-y-2"
      >
        <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)]">
          <defs>
            <linearGradient id="silver-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 1 }} />
              <stop offset="50%" style={{ stopColor: '#94a3b8', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#475569', stopOpacity: 1 }} />
            </linearGradient>
          </defs>

          {/* S - BRAIN CIRCUIT SIDE */}
          <g transform="translate(50, 60) scale(1)">
             {/* Main S Path */}
             <path 
                d="M140 60 C80 60, 60 120, 100 160 S160 220, 100 260 S20 200, 20 200" 
                fill="none" 
                stroke="url(#silver-grad)" 
                strokeWidth="22" 
                strokeLinecap="round"
             />
             {/* Circuit Detail Dots */}
             <circle cx="140" cy="60" r="5" fill="#22d3ee" className="animate-pulse" />
             <circle cx="20" cy="200" r="5" fill="#22d3ee" />
             <circle cx="80" cy="110" r="3" fill="#22d3ee" opacity="0.6" />
             <circle cx="130" cy="190" r="3" fill="#22d3ee" opacity="0.6" />
             <path d="M140 60 L160 40" stroke="#22d3ee" strokeWidth="1" opacity="0.3" />
          </g>

          {/* A - CAMERA LENS SIDE */}
          <g transform="translate(190, 90) scale(1)">
             {/* Body of A / Camera Shape */}
             <path 
                d="M20 200 L80 40 L140 200" 
                fill="none" 
                stroke="url(#silver-grad)" 
                strokeWidth="22" 
                strokeLinecap="round"
             />
             <rect x="62" y="20" width="36" height="12" rx="3" fill="url(#silver-grad)" />
             
             {/* Camera Lens in Center */}
             <g transform="translate(80, 140)">
                <circle r="36" fill="#0f172a" stroke="url(#silver-grad)" strokeWidth="3" />
                <circle r="26" fill="none" stroke="#22d3ee" strokeWidth="0.5" opacity="0.2" />
                {/* Lens Aperture Blades */}
                {[0, 60, 120, 180, 240, 300].map((rot) => (
                   <line 
                     key={rot}
                     x1="0" y1="-26" x2="0" y2="-8" 
                     stroke="#22d3ee" 
                     strokeWidth="1" 
                     transform={`rotate(${rot})`} 
                     opacity="0.4"
                   />
                ))}
                <circle r="10" fill="#22d3ee" opacity="0.1" />
                <circle cx="-6" cy="-6" r="2.5" fill="#fff" opacity="0.4" />
             </g>
          </g>
        </svg>

        {/* Dynamic Light Reflection Shine */}
        <motion.div 
          animate={{ x: [-300, 500] }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear", repeatDelay: 4 }}
          className="absolute w-12 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[40deg] pointer-events-none"
        />
      </motion.div>

      {/* Decorative Brand Text inside the rings */}
      <div className="absolute bottom-6 flex flex-col items-center">
         <motion.p 
           animate={{ opacity: [0.2, 0.6, 0.2] }}
           transition={{ duration: 6, repeat: Infinity }}
           className="text-[7px] font-black text-cyan-400/60 uppercase tracking-[0.5em] italic"
         >
           AI CREATIVE
         </motion.p>
      </div>

      {/* HUD Vertical lines - Repositioned for balance */}
      <div className="absolute left-[-15px] top-1/2 -translate-y-1/2 h-20 w-[0.5px] bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent"></div>
      <div className="absolute right-[-15px] top-1/2 -translate-y-1/2 h-20 w-[0.5px] bg-gradient-to-b from-transparent via-purple-500/10 to-transparent"></div>
    </div>
  );
};
