
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../services/supabase';
import { sendTelegramNotification } from '../services/notifications';

interface ProfileSettingsProps {
  onBack: () => void;
  userEmail: string;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ onBack, userEmail }) => {
  const [newEmail, setNewEmail] = useState(userEmail);
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'success' | 'error' | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setStatus(null);

    try {
      const updates: any = {};
      if (newEmail !== userEmail) updates.email = newEmail;
      if (newPassword) updates.password = newPassword;

      if (Object.keys(updates).length === 0) {
        throw new Error("No changes detected.");
      }

      const { error } = await supabase.auth.updateUser(updates);
      if (error) throw error;

      // Update in members table too
      if (newEmail !== userEmail) {
        await supabase.from('members').update({ email: newEmail }).eq('email', userEmail);
      }

      await sendTelegramNotification('NEURAL UPDATE', `👤 <b>IDENTITY CHANGED</b>\nOld: ${userEmail}\nNew: ${newEmail}\nStatus: Credentials re-synced.`);
      
      setStatus('success');
      setMessage('Identity Sync Complete. Some changes may require re-login.');
      setNewPassword('');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || "Failed to update profile.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="group flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all shadow-lg">
          <i className="fa-solid fa-chevron-left text-xs group-hover:-translate-x-1 transition-transform text-slate-400"></i>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-white">Back</span>
        </button>
        <div className="text-right">
          <h2 className="text-xs font-black text-cyan-500 uppercase tracking-widest">Neural Identity</h2>
          <p className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter italic">{userEmail}</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-10 rounded-[3rem] bg-slate-900/40 border-white/5 shadow-2xl space-y-8">
        <div>
          <h3 className="text-2xl font-display font-black tracking-tighter text-white uppercase italic">Security <span className="text-cyan-400">Hub</span></h3>
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1">Manage your access protocols</p>
        </div>

        {message && (
          <div className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${status === 'success' ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Registered Email</label>
            <input 
              type="email" 
              value={newEmail} 
              onChange={e => setNewEmail(e.target.value)}
              className="w-full glass-input rounded-2xl py-4 px-6 text-sm text-white focus:outline-none"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">New Access Code (Password)</label>
            <input 
              type="password" 
              value={newPassword} 
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Leave blank to keep current"
              className="w-full glass-input rounded-2xl py-4 px-6 text-sm text-white focus:outline-none placeholder:text-slate-800"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-5 bg-white text-black font-black uppercase tracking-widest text-[11px] rounded-2xl hover:bg-cyan-400 transition-all active:scale-95 shadow-2xl disabled:opacity-50"
          >
            {isLoading ? <i className="fa-solid fa-sync fa-spin"></i> : "Update Credentials"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
