
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';

interface Member {
  id: string | number;
  email: string;
  full_name?: string;
  status: 'active' | 'inactive' | 'pending';
  valid_until?: string | null;
  created_at: string;
}

interface MemberControlProps {
  onBack: () => void;
  onChatUser?: (email: string) => void;
}

export const MemberControl: React.FC<MemberControlProps> = ({ onBack, onChatUser }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'health'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = useMemo(() => {
    const vEnv = (import.meta as any).env || {};
    const pEnv = (typeof process !== 'undefined' ? process.env : {}) || {};
    const url = vEnv.VITE_DATABASE_URL || pEnv.VITE_DATABASE_URL || 'https://urokqoorxuiokizesiwa.supabase.co';
    const key = vEnv.VITE_SUPABASE_ANON_KEY || pEnv.VITE_SUPABASE_ANON_KEY || 'sb_publishable_G1udRukMNJjDM6wlVD3xtw_IF8Yrbd8';
    return createClient(url, key);
  }, []);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase.from('members').select('*').order('created_at', { ascending: false });
      setMembers(data || []);
    } catch (e) {
      console.error("Fetch failed", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (id: string | number, type: 'approve' | 'extend' | 'delete', currentData?: any) => {
    try {
      if (type === 'delete') {
        if (!confirm(`Hapus permanen ${currentData?.email}?`)) return;
        await supabase.from('members').delete().eq('id', id);
      } else {
        const days = 30;
        const now = new Date();
        const currentValid = currentData?.valid_until ? new Date(currentData.valid_until) : now;
        const baseDate = currentValid < now ? now : currentValid;
        const newExpiry = new Date(baseDate.getTime() + (days * 24 * 60 * 60 * 1000));
        await supabase.from('members').update({ valid_until: newExpiry.toISOString(), status: 'active' }).eq('id', id);
      }
      fetchMembers();
    } catch (e) { alert("Error database"); }
  };

  const handleBackupJSON = () => {
    const dataStr = JSON.stringify(members, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `satmoko_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleRestoreJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!Array.isArray(json)) throw new Error("Format data tidak valid (Harus Array)");
        
        setIsLoading(true);
        // Use upsert to restore records based on their existing IDs or emails
        const { error } = await supabase.from('members').upsert(json, { onConflict: 'email' });
        if (error) throw error;
        
        alert("RESTORE SUCCESS: Node database telah diperbarui.");
        fetchMembers();
      } catch (err: any) {
        alert("RESTORE FAILED: " + err.message);
      } finally {
        setIsLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleExportCSV = () => {
    if (members.length === 0) return alert("Data kosong.");
    
    const headers = ['id', 'email', 'full_name', 'status', 'valid_until', 'created_at'].join(',');
    const rows = members.map(m => [
      m.id,
      m.email,
      `"${m.full_name || ''}"`,
      m.status,
      m.valid_until || '',
      m.created_at
    ].join(',')).join('\n');
    
    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `satmoko_members_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const filteredMembers = members.filter(m => {
    const matchesSearch = (m.email || '').toLowerCase().includes(searchTerm.toLowerCase()) || (m.full_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || (activeTab === 'pending' && m.status === 'pending');
    return matchesSearch && matchesTab;
  });

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'BELUM AKTIF';
    const d = new Date(dateString);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getDaysRemaining = (dateString?: string | null) => {
    if (!dateString) return 0;
    const diff = new Date(dateString).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <div className="flex flex-col min-h-screen max-w-4xl mx-auto space-y-6 pb-20 px-4 pt-4">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="w-11 h-11 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all"><i className="fa-solid fa-arrow-left"></i></button>
        <div className="flex bg-[#0d1117] p-1 rounded-2xl border border-white/5 backdrop-blur-md">
          <TabBtn active={activeTab === 'health'} onClick={() => setActiveTab('health')} label="MESIN" icon="fa-gears" />
          <TabBtn active={activeTab === 'all'} onClick={() => setActiveTab('all')} label="MEMBERS" icon="fa-users" />
          <TabBtn active={activeTab === 'pending'} onClick={() => setActiveTab('pending')} label="PENDING" icon="fa-clock" />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'health' ? (
          <motion.div key="health" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="glass-panel p-8 rounded-[2.5rem] bg-black/40 border-white/5 space-y-8 shadow-2xl">
              <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500">AI ENGINE STATUS</h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">API KEY</span>
                  <span className="text-[11px] font-black uppercase tracking-widest text-green-500 neon-glow-green">LINKED</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">TEMPERATURE</span>
                  <span className="text-[11px] font-black uppercase tracking-widest text-cyan-400">1.0 (Optimal)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">MODEL CORE</span>
                  <span className="text-[11px] font-black uppercase tracking-widest text-white">GEMINI 3 PRO</span>
                </div>
              </div>
            </div>
            
            <div className="glass-panel p-8 rounded-[2.5rem] bg-black/40 border-white/5 space-y-8 shadow-2xl">
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-database text-cyan-400 text-sm"></i>
                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500">DATABASE OPERATIONS</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={handleExportCSV} 
                  className="w-full py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-cyan-500 hover:text-black transition-all flex items-center justify-center gap-4 group"
                >
                  <i className="fa-solid fa-file-csv text-lg text-cyan-400 group-hover:text-black"></i>
                  <span>Export Members (CSV)</span>
                </button>
                
                <button 
                  onClick={handleBackupJSON} 
                  className="w-full py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-blue-500 hover:text-white transition-all flex items-center justify-center gap-4 group"
                >
                  <i className="fa-solid fa-download text-lg text-blue-400 group-hover:text-white"></i>
                  <span>Backup Database (JSON)</span>
                </button>
                
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  className="w-full py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-fuchsia-500 hover:text-white transition-all flex items-center justify-center gap-4 group"
                >
                  <i className="fa-solid fa-upload text-lg text-fuchsia-400 group-hover:text-white"></i>
                  <span>Restore Database (JSON)</span>
                </button>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleRestoreJSON} 
                  className="hidden" 
                  accept=".json" 
                />
              </div>

              <div className="pt-4 border-t border-white/5">
                <p className="text-[9px] text-slate-600 font-bold uppercase italic leading-relaxed">
                  *Gunakan fitur Backup secara berkala untuk menjaga integritas data. Fitur Restore akan menimpa data yang memiliki email yang sama.
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="members" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="relative group">
              <i className="fa-solid fa-magnifying-glass absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 text-xs"></i>
              <input 
                type="text" 
                placeholder="Cari email member..." 
                className="w-full bg-[#0d1117] border border-white/5 rounded-2xl py-5 pl-12 pr-6 text-xs text-white placeholder-slate-800 focus:outline-none focus:border-cyan-500/30 transition-all shadow-inner"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              {filteredMembers.map(m => {
                const daysLeft = getDaysRemaining(m.valid_until);
                const isExpired = daysLeft <= 0 && m.status === 'active';
                const isPending = m.status === 'pending';
                
                return (
                  <motion.div 
                    layout
                    key={m.id} 
                    className="p-6 rounded-[2.2rem] bg-slate-900/60 border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all shadow-xl backdrop-blur-md"
                  >
                    <div className="flex items-center gap-5">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${isPending ? 'bg-yellow-500 shadow-[0_0_12px_rgba(234,179,8,0.5)]' : (isExpired ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]' : 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.5)]')} animate-pulse`}></div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-3">
                           <h4 className="text-[13px] font-black text-white uppercase tracking-tight leading-tight">
                             {m.full_name || 'MEMBER NODE'}
                           </h4>
                           {m.status === 'active' && !isExpired && (
                             <span className="text-[9px] px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-black uppercase italic">
                               {daysLeft} HARI LAGI
                             </span>
                           )}
                        </div>
                        <div className="flex flex-col gap-1">
                           <p className="text-[10px] text-slate-600 font-bold tracking-tight">{m.email}</p>
                           <p className={`text-[10px] font-black uppercase italic tracking-wider ${isExpired ? 'text-red-500' : 'text-cyan-400/60'}`}>
                             BERLAKU S/D: {formatDate(m.valid_until)}
                           </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2.5">
                      {onChatUser && (
                        <button 
                          onClick={() => onChatUser(m.email)} 
                          className="w-12 h-12 rounded-2xl bg-cyan-500/5 text-cyan-500 border border-cyan-500/10 flex items-center justify-center hover:bg-cyan-500 hover:text-black transition-all active:scale-90"
                        >
                          <i className="fa-solid fa-comment-dots text-sm"></i>
                        </button>
                      )}
                      
                      {isPending ? (
                        <button 
                          onClick={() => handleAction(m.id, 'approve', m)} 
                          className="px-6 py-2 bg-cyan-500 text-black font-black text-[10px] uppercase rounded-2xl hover:bg-white transition-all shadow-lg active:scale-95"
                        >
                          APPROVE
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleAction(m.id, 'extend', m)} 
                          title="Perpanjang 30 Hari" 
                          className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 hover:text-green-400 hover:bg-green-500/10 transition-all active:scale-90"
                        >
                          <i className="fa-solid fa-clock-rotate-left text-sm"></i>
                        </button>
                      )}
                      
                      <button 
                        onClick={() => handleAction(m.id, 'delete', m)} 
                        className="w-12 h-12 text-slate-800 hover:text-red-500 flex items-center justify-center transition-all active:scale-90"
                      >
                        <i className="fa-solid fa-trash-can text-sm"></i>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
              {filteredMembers.length === 0 && !isLoading && (
                <div className="py-24 text-center opacity-10">
                  <i className="fa-solid fa-user-slash text-6xl mb-6"></i>
                  <p className="text-[12px] font-black uppercase tracking-[0.6em]">Node Database Empty</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TabBtn: React.FC<{ active: boolean; onClick: () => void; label: string; icon?: string }> = ({ active, onClick, label, icon }) => (
  <button onClick={onClick} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 tracking-widest ${active ? `bg-white/5 text-white shadow-xl` : 'text-slate-600 hover:text-slate-400'}`}>
    {icon && <i className={`fa-solid ${icon} text-xs`}></i>}
    {label}
  </button>
);
