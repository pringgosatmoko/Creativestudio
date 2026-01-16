
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';

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

  // Robust Supabase Initialization
  const supabase = useMemo(() => {
    const dbUrl = (window as any).process?.env?.VITE_DATABASE_URL || (import.meta as any).env?.VITE_DATABASE_URL || 'https://urokqoorxuiokizesiwa.supabase.co';
    const dbKey = (window as any).process?.env?.VITE_SUPABASE_ANON_KEY || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_G1udRukMNJjDM6wlVD3xtw_IF8Yrbd8';
    return createClient(dbUrl, dbKey);
  }, []);

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

        await supabase.from('members').insert([{ email: email.toLowerCase(), status: 'pending', full_name: `${fullName} (Paket: ${selectedPlan} Hari)` }]);
        setSuccessMsg('PENDAFTARAN BERHASIL: Silakan hubungi admin untuk aktivasi akun.');
      } else {
        const adminEmail = 'pringgosatmoko@gmail.com';
        // Admin password check
        const adminPass = (window as any).process?.env?.VITE_ADMIN_PASSWORD || (import.meta as any).env?.VITE_ADMIN_PASSWORD || 'admin7362';

        if (email.toLowerCase() === adminEmail && password === adminPass) {
          onSuccess(email, null);
          return;
        }

        const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
        if (loginError) throw loginError;

        const { data: memberData, error: memberError } = await supabase.from('members').select('status, valid_until').eq('email', email.toLowerCase()).single();
        if (memberError || !memberData || memberData.status !== 'active') {
          await supabase.auth.signOut();
          throw new Error("AKSES DITOLAK: Akun belum aktif. Hubungi Admin.");
        }
        onSuccess(email, memberData.valid_until);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal masuk. Cek kembali email/password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[360px] mx-auto space-y-5 px-4">
      <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-[2.5rem] border-white/5 bg-slate-900/60 shadow-2xl space-y-6 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
        <div className="flex justify-between items-center">
          <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-white">
            {isRegister ? 'Pendaftaran Member' : 'Masuk Ke Akun'}
          </h2>
          <div className={`w-1.5 h-1.5 rounded-full ${isRegister ? 'bg-fuchsia-500' : 'bg-cyan-500'} animate-pulse`}></div>
        </div>

        <AnimatePresence mode="wait">
          {error && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] text-center font-black uppercase tracking-widest">{error}</motion.div>}
          {successMsg && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="p-5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] text-center font-black uppercase tracking-widest">{successMsg}</motion.div>}
        </AnimatePresence>
        
        {!successMsg && (
          <div className="space-y-4">
            {isRegister && (
              <>
                <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-white text-xs outline-none focus:border-cyan-500/30 transition-all" placeholder="Nama Lengkap" />
                <select value={selectedPlan} onChange={(e) => setSelectedPlan(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-white text-xs outline-none focus:border-cyan-500/30 transition-all appearance-none">
                  <option value="30">Paket: 30 Hari</option>
                  <option value="90">Paket: 90 Hari</option>
                  <option value="365">Paket: 1 Tahun</option>
                </select>
              </>
            )}
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-white text-xs outline-none focus:border-cyan-500/30 transition-all" placeholder="Email Anda" />
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-white text-xs outline-none focus:border-cyan-500/30 transition-all" placeholder="Kata Sandi" />
            <button type="submit" disabled={isLoading} className="w-full py-5 rounded-2xl bg-white text-black font-black uppercase shadow-xl active:scale-95 transition-all hover:bg-cyan-400 disabled:opacity-30">
              {isLoading ? 'Memproses...' : (isRegister ? 'Daftar Sekarang' : 'Masuk Sekarang')}
            </button>
          </div>
        )}
      </form>
      <div className="text-center pb-10">
        <button onClick={() => setIsRegister(!isRegister)} className="text-[9px] font-black uppercase tracking-widest text-slate-600 hover:text-cyan-400 transition-colors">
          {isRegister ? '← Kembali ke Login' : 'Belum punya akun? Daftar Member'}
        </button>
      </div>
    </motion.div>
  );
};
