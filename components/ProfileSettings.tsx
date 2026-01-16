
import React, { useState, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfileSettingsProps {
  onBack: () => void;
  onLogout?: () => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ onBack, onLogout }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  const supabase = useMemo(() => {
    const vEnv = (import.meta as any).env || {};
    const pEnv = (typeof process !== 'undefined' ? process.env : {}) || {};
    const url = vEnv.VITE_DATABASE_URL || pEnv.VITE_DATABASE_URL || 'https://urokqoorxuiokizesiwa.supabase.co';
    const key = vEnv.VITE_SUPABASE_ANON_KEY || pEnv.VITE_SUPABASE_ANON_KEY || 'sb_publishable_G1udRukMNJjDM6wlVD3xtw_IF8Yrbd8';
    return createClient(url, key);
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return setStatus({ type: 'error', msg: 'Password tidak cocok!' });
    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setStatus(error ? { type: 'error', msg: error.message } : { type: 'success', msg: 'Password diperbarui!' });
    setIsLoading(false);
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;
    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    setStatus(error ? { type: 'error', msg: error.message } : { type: 'success', msg: 'Konfirmasi telah dikirim ke email baru!' });
    setIsLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all"><i className="fa-solid fa-chevron-left"></i></button>
        <button onClick={() => setShowGuide(!showGuide)} className={`w-10 h-10 rounded-xl border transition-all flex items-center justify-center ${showGuide ? 'bg-blue-500 text-black border-blue-400 shadow-[0_0_15px_#3b82f6]' : 'bg-white/5 border-white/5 text-blue-400'}`}><i className="fa-solid fa-circle-question"></i></button>
        <h2 className="text-2xl font-black italic uppercase italic tracking-tighter">Pusat <span className="text-cyan-400">Keamanan</span></h2>
      </div>

      <AnimatePresence>
        {showGuide && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="glass-panel p-6 rounded-[2rem] border-blue-500/20 bg-blue-500/10 mb-4">
              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/20 flex items-center justify-center flex-shrink-0"><i className="fa-solid fa-shield-halved text-blue-400"></i></div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-bold">Amankan identitas digital Master. Gunakan password minimal 8 karakter dan pastikan email Master selalu sinkron dengan sistem cloud Satmoko.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {status && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`p-4 rounded-2xl border ${status.type === 'success' ? 'bg-green-500/10 border-green-500 text-green-400' : 'bg-red-500/10 border-red-500 text-red-400'} text-xs font-bold text-center`}>
            {status.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Modul Password */}
        <div className="glass-panel p-8 rounded-[2.5rem] space-y-6">
          <div className="flex items-center gap-3"><i className="fa-solid fa-key text-cyan-400"></i><h3 className="text-sm font-black uppercase italic">Master Password</h3></div>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Sandi Baru" className="w-full glass-input rounded-xl p-4 text-xs font-bold text-white focus:outline-none" />
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Konfirmasi Sandi" className="w-full glass-input rounded-xl p-4 text-xs font-bold text-white focus:outline-none" />
            <button type="submit" disabled={isLoading} className="w-full py-4 bg-white text-black font-black uppercase rounded-xl hover:bg-cyan-400 transition-all text-[10px] tracking-widest active:scale-95">{isLoading ? "Verifikasi..." : "Simpan Perubahan"}</button>
          </form>
        </div>

        {/* Modul Email */}
        <div className="glass-panel p-8 rounded-[2.5rem] space-y-6">
          <div className="flex items-center gap-3"><i className="fa-solid fa-envelope text-fuchsia-400"></i><h3 className="text-sm font-black uppercase italic">Sinkronisasi Email</h3></div>
          <form onSubmit={handleUpdateEmail} className="space-y-4">
            <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="Master Email Baru" className="w-full glass-input rounded-xl p-4 text-xs font-bold text-white focus:outline-none" />
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black text-center">*Link konfirmasi akan dikirim ke inbox baru.</p>
            <button type="submit" disabled={isLoading} className="w-full py-4 bg-white text-black font-black uppercase rounded-xl hover:bg-fuchsia-400 transition-all text-[10px] tracking-widest active:scale-95">{isLoading ? "Proses..." : "Update Email"}</button>
          </form>
        </div>
      </div>

      {onLogout && (
        <div className="pt-10 flex justify-center">
          <button onClick={onLogout} className="px-10 py-5 rounded-[2rem] bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 text-xs font-black uppercase tracking-[0.3em] transition-all flex items-center gap-4 shadow-xl active:scale-95">
            <i className="fa-solid fa-power-off text-lg"></i>
            Keluar Dari Aplikasi
          </button>
        </div>
      )}
    </div>
  );
};
