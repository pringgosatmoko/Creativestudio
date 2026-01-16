
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../services/supabase';
import { getEnv } from '../utils/env';
import { sendTelegramNotification } from '../services/notifications';

interface LoginFormProps { 
  onSuccess: (email: string, expiry?: string | null) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('30');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      if (isRegister) {
        const { error: authError } = await supabase.auth.signUp({ 
          email, 
          password, 
          options: { data: { full_name: fullName } } 
        });
        if (authError) throw authError;

        await supabase.from('members').insert([{ 
          email: email.toLowerCase(), 
          status: 'pending', 
          full_name: `${fullName} (Plan: ${selectedPlan})` 
        }]);
        
        await sendTelegramNotification('SATMOKO HUD', `🆕 <b>PENDING NODE</b>\nUser: ${email}\nNama: ${fullName}\nStatus: Verification Required.`);
        setSuccessMsg('REGISTER SUCCESS: Menunggu persetujuan Master Pringgo.');
        setTimeout(() => setIsRegister(false), 3000);
      } else {
        const adminEmail = getEnv('VITE_ADMIN_EMAILS');
        const adminPass = getEnv('VITE_ADMIN_PASSWORD');

        if (email.toLowerCase() === adminEmail && password === adminPass) {
          await sendTelegramNotification('SATMOKO HUD', `👑 <b>MASTER LOGIN</b>\nUser: ${email}\nStatus: Override Active.`);
          onSuccess(email, null);
          return;
        }

        const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
        if (loginError) throw loginError;

        const { data: member, error: mError } = await supabase.from('members')
          .select('status, valid_until, full_name')
          .eq('email', email.toLowerCase())
          .single();

        if (mError || !member || member.status !== 'active') {
          await supabase.auth.signOut();
          throw new Error("ACCESS DENIED: Akun belum aktif atau menunggu persetujuan.");
        }

        if (member.valid_until && new Date(member.valid_until) < new Date()) {
          await supabase.auth.signOut();
          throw new Error("ACCESS EXPIRED: Silakan perpanjang masa aktif.");
        }

        await sendTelegramNotification('SATMOKO HUD', `🔑 <b>NODE LOGIN</b>\nUser: ${email}\nIdentity: ${member.full_name}`);
        onSuccess(email, member.valid_until);
      }
    } catch (err: any) {
      setError(err.message || 'Verification Failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div className="w-full max-w-[380px] mx-auto space-y-6 px-4">
      <form onSubmit={handleSubmit} className="glass-panel p-8 md:p-10 rounded-[2.5rem] border-white/5 bg-[#0a1120]/60 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
        {/* Holographic scan line overlay */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-cyan-400/20 shadow-[0_0_10px_rgba(34,211,238,0.5)] opacity-50"></div>
        
        <div className="flex justify-between items-center mb-8">
          <div className="flex flex-col">
            <h2 className="text-[12px] font-black uppercase tracking-[0.4em] text-cyan-400">
              {isRegister ? 'DEPLOY NEW NODE' : 'ESTABLISH LINK'}
            </h2>
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1.5 opacity-60">Identity Verification Protocol</p>
          </div>
          <div className={`w-2.5 h-2.5 rounded-full ${isRegister ? 'bg-fuchsia-500 shadow-[0_0_10px_#d946ef]' : 'bg-cyan-500 shadow-[0_0_10px_#22d3ee]'} animate-pulse`}></div>
        </div>

        {error && <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] text-center font-black uppercase tracking-widest leading-relaxed">{error}</div>}
        {successMsg && <div className="mb-6 p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] text-center font-black uppercase tracking-widest leading-relaxed">{successMsg}</div>}
        
        <div className="space-y-4">
          {isRegister && (
            <div className="relative group">
              <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder-slate-600 text-[13px] focus:border-fuchsia-500/50 outline-none transition-all focus:bg-black/60" placeholder="Full Identity Name" />
              <i className="fa-solid fa-user absolute right-5 top-1/2 -translate-y-1/2 text-slate-700 text-xs group-focus-within:text-fuchsia-400 transition-colors"></i>
            </div>
          )}
          <div className="relative group">
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder-slate-600 text-[13px] focus:border-cyan-500/50 outline-none transition-all focus:bg-black/60" placeholder="Neural ID (Email)" />
            <i className="fa-solid fa-id-card absolute right-5 top-1/2 -translate-y-1/2 text-slate-700 text-xs group-focus-within:text-cyan-400 transition-colors"></i>
          </div>
          <div className="relative group">
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder-slate-600 text-[13px] focus:border-cyan-500/50 outline-none transition-all focus:bg-black/60" placeholder="Access Code" />
            <i className="fa-solid fa-key absolute right-5 top-1/2 -translate-y-1/2 text-slate-700 text-xs group-focus-within:text-cyan-400 transition-colors"></i>
          </div>
        </div>

        <button type="submit" disabled={isLoading} className={`w-full mt-10 py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] transition-all active:scale-[0.98] shadow-2xl relative group overflow-hidden ${isRegister ? 'bg-fuchsia-600 text-white shadow-fuchsia-500/20' : 'bg-white text-black hover:bg-cyan-400 transition-colors'}`}>
          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none"></div>
          {isLoading ? <i className="fa-solid fa-circle-notch fa-spin text-sm"></i> : <span>{isRegister ? 'INITIATE DEPLOY' : 'ESTABLISH LINK'}</span>}
        </button>
      </form>
      
      <div className="flex flex-col items-center gap-5 pt-2">
        <button onClick={() => setIsRegister(!isRegister)} className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 hover:text-cyan-400 transition-all">
          {isRegister ? '← Return to Link Interface' : 'Request New Neural Identity?'}
        </button>
        <div className="h-[1px] w-12 bg-slate-800/50"></div>
        <div className="flex flex-col items-center gap-1 opacity-40">
           <p className="text-[7px] font-black text-slate-700 uppercase tracking-[0.4em]">Satmoko Studio Global Hub</p>
           <p className="text-[6px] font-bold text-slate-800 uppercase tracking-widest italic">Encryption Mode: SECURE-AES-256</p>
        </div>
      </div>
    </motion.div>
  );
};
