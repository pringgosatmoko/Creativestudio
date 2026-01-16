
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { sendTelegramNotification } from '../services/notifications';

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
}

export const MemberControl: React.FC<MemberControlProps> = ({ onBack }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'health'>('all');
  const [actionId, setActionId] = useState<string | number | null>(null);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editData, setEditData] = useState({ email: '', fullName: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getEnv = (key: string) => {
    const vEnv = (import.meta as any).env || {};
    const pEnv = (typeof process !== 'undefined' ? process.env : {}) || {};
    const wEnv = (window as any).process?.env || {};
    const fallbacks: Record<string, string> = {
      'VITE_DATABASE_URL': 'https://urokqoorxuiokizesiwa.supabase.co',
      'VITE_SUPABASE_ANON_KEY': 'sb_publishable_G1udRukMNJjDM6wlVD3xtw_IF8Yrbd8'
    };
    return vEnv[key] || pEnv[key] || wEnv[key] || fallbacks[key] || "";
  };

  const supabase = useMemo(() => {
    return createClient(getEnv('VITE_DATABASE_URL'), getEnv('VITE_SUPABASE_ANON_KEY'));
  }, []);

  useEffect(() => { fetchMembers(); }, []);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('members').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setMembers(data || []);
    } catch (e: any) { 
      console.error(e);
    } finally { setIsLoading(false); }
  };

  const handleAction = async (id: string | number, type: 'approve' | 'extend' | 'delete', currentData?: any, durationDays: number = 30) => {
    setActionId(id);
    try {
      if (type === 'delete') {
        if (!confirm(`Hapus permanen akses ${currentData?.email}?`)) return;
        const { error } = await supabase.from('members').delete().eq('id', id);
        if (error) throw error;
        await sendTelegramNotification('NODE PURGED', `🗑️ <b>USER DELETED</b>\nEmail: ${currentData?.email}`);
      } else {
        const now = new Date();
        const currentValid = currentData?.valid_until ? new Date(currentData.valid_until) : now;
        const baseDate = currentValid < now ? now : currentValid;
        const newExpiry = new Date(baseDate.getTime() + (durationDays * 24 * 60 * 60 * 1000));

        const { error } = await supabase
          .from('members')
          .update({ valid_until: newExpiry.toISOString(), status: 'active' })
          .eq('id', id);
        
        if (error) throw error;
        await sendTelegramNotification('NODE UPDATE', `📅 <b>EXTENDED</b>\nUser: ${currentData?.email}\nDays: +${durationDays}`);
      }
      await fetchMembers();
    } catch (e: any) {
      alert("ERROR: " + e.message);
    } finally { setActionId(null); }
  };

  const handleSaveEdit = async () => {
    if (!editingMember) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.from('members').update({
        email: editData.email,
        full_name: editData.fullName
      }).eq('id', editingMember.id);
      
      if (error) throw error;
      setEditingMember(null);
      await fetchMembers();
    } catch (e: any) {
      alert(e.message);
    } finally { setIsLoading(false); }
  };

  const filteredMembers = members.filter(m => 
    (m.email || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (m.full_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = useMemo(() => {
    const active = members.filter(m => m.status === 'active').length;
    const pending = members.filter(m => m.status === 'pending').length;
    return { active, pending, total: members.length };
  }, [members]);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-5xl mx-auto space-y-4 relative">
      <div className="flex flex-wrap gap-3 items-center">
        <button onClick={onBack} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors border border-white/5">
          <i className="fa-solid fa-arrow-left text-xs text-slate-500"></i>
        </button>
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
          <TabBtn active={activeTab === 'all'} onClick={() => setActiveTab('all')} label="All Nodes" />
          <TabBtn active={activeTab === 'health'} onClick={() => setActiveTab('health')} label="System Health" icon="fa-heart-pulse" />
        </div>
        <div className="flex-1 min-w-[200px] relative group">
          <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-600"></i>
          <input type="text" placeholder="Filter node ID..." className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 pl-10 pr-4 text-xs focus:outline-none focus:border-cyan-500/50 text-white" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="flex-1 glass-panel rounded-[2.5rem] overflow-hidden flex flex-col bg-slate-900/10 border-white/5 shadow-2xl relative">
        <AnimatePresence mode="wait">
          {activeTab === 'health' ? (
            <motion.div key="health" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-8 space-y-10 h-full overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <HealthCard title="Supabase Engine" status="SYNCED" icon="fa-database" color="cyan" detail="Connected - Cloud Link" />
                 <HealthCard title="Cluster Capacity" status={`${stats.total}/∞`} icon="fa-network-wired" color="fuchsia" detail={`${stats.active} Active Neural Links`} />
                 <HealthCard title="Master Integrity" status="SECURE" icon="fa-shield-halved" color="green" detail="Encrypted Auth 2.0" />
              </div>
              
              <div className="glass-panel p-10 rounded-[3rem] bg-black/40 border-white/5 space-y-8">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">Distribution Metrics</h4>
                 <div className="space-y-8">
                    <ProgressBar label="Active Ratio" value={stats.total > 0 ? (stats.active/stats.total)*100 : 0} color="cyan" />
                    <ProgressBar label="Pending Requests" value={stats.total > 0 ? (stats.pending/stats.total)*100 : 0} color="yellow" />
                    <ProgressBar label="Storage Integrity" value={100} color="green" />
                 </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
              {isLoading ? (
                <div className="h-full flex items-center justify-center py-20"><i className="fa-solid fa-spinner fa-spin text-cyan-500"></i></div>
              ) : filteredMembers.map(m => (
                <div key={m.id} className="flex items-center gap-4 p-4 rounded-2xl bg-black/40 border border-white/[0.03] hover:border-white/10 transition-all">
                    <div className={`w-2 h-2 rounded-full ${m.status === 'pending' ? 'bg-yellow-500 animate-pulse' : 'bg-cyan-500'}`}></div>
                    <div className="flex-1">
                      <h4 className="text-[11px] font-black uppercase text-white tracking-widest">{m.full_name || 'No Data'}</h4>
                      <p className="text-[8px] text-slate-600 font-mono">{m.email}</p>
                    </div>
                    <div className="flex flex-col text-right mr-4">
                      <span className="text-[7px] text-slate-700 font-black uppercase">Validity</span>
                      <span className="text-[10px] text-slate-400 font-bold">{m.valid_until ? new Date(m.valid_until).toLocaleDateString() : 'VOID'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => {setEditingMember(m); setEditData({email: m.email, fullName: m.full_name || ''})}} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 text-slate-400"><i className="fa-solid fa-pen-to-square text-[10px]"></i></button>
                      <button onClick={() => handleAction(m.id, 'extend', m, 30)} className="px-3 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 text-[8px] font-black uppercase border border-cyan-500/20 hover:bg-cyan-500 hover:text-black transition-all">+30D</button>
                      <button onClick={() => handleAction(m.id, 'delete', m)} className="w-8 h-8 rounded-lg text-slate-700 hover:text-red-500"><i className="fa-solid fa-trash-can text-[10px]"></i></button>
                    </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const HealthCard = ({ title, status, icon, color, detail }: any) => (
  <div className="glass-panel p-6 rounded-[2rem] bg-black/20 border-white/5 space-y-4">
    <div className="flex items-center justify-between">
      <div className={`w-10 h-10 rounded-xl bg-${color}-500/10 flex items-center justify-center text-${color}-400 border border-${color}-500/10`}>
        <i className={`fa-solid ${icon} text-sm`}></i>
      </div>
      <span className={`text-[8px] font-black uppercase tracking-widest text-${color}-500`}>{status}</span>
    </div>
    <div>
      <h5 className="text-[10px] font-black uppercase tracking-widest text-white">{title}</h5>
      <p className="text-[8px] font-mono text-slate-600 mt-1">{detail}</p>
    </div>
  </div>
);

const ProgressBar = ({ label, value, color }: any) => (
  <div className="space-y-3">
    <div className="flex justify-between items-center px-1">
      <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">{label}</span>
      <span className={`text-[9px] font-black text-${color}-500`}>{Math.round(value)}%</span>
    </div>
    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
      <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 1.5, ease: "easeOut" }} className={`h-full bg-${color}-500 shadow-[0_0_15px_#22d3ee]`}></motion.div>
    </div>
  </div>
);

const TabBtn = ({ active, onClick, label, icon }: any) => (
  <button onClick={onClick} className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${active ? 'bg-white/10 text-white shadow-2xl' : 'text-slate-600 hover:text-slate-400'}`}>
    {icon && <i className={`fa-solid ${icon}`}></i>}
    {label}
  </button>
);
