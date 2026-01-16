
import React, { useState, useEffect, useMemo } from 'react';
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
}

export const MemberControl: React.FC<MemberControlProps> = ({ onBack }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'members' | 'health'>('members');
  const [searchTerm, setSearchTerm] = useState('');
  const [showGuide, setShowGuide] = useState(false);
  
  const [dbStatus, setDbStatus] = useState<'Online' | 'Offline' | 'Mengecek'>('Mengecek');
  const [aiStatus, setAiStatus] = useState<'Online' | 'Offline' | 'Mengecek'>('Mengecek');

  const supabase = useMemo(() => {
    const vEnv = (import.meta as any).env || {};
    const url = vEnv.VITE_DATABASE_URL || 'https://urokqoorxuiokizesiwa.supabase.co';
    const key = vEnv.VITE_SUPABASE_ANON_KEY || 'sb_publishable_G1udRukMNJjDM6wlVD3xtw_IF8Yrbd8';
    return createClient(url, key);
  }, []);

  useEffect(() => {
    fetchMembers();
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const { error } = await supabase.from('members').select('id').limit(1);
      setDbStatus(error ? 'Offline' : 'Online');
    } catch { setDbStatus('Offline'); }
    setAiStatus(process.env.API_KEY ? 'Online' : 'Offline');
  };

  const fetchMembers = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('members').select('*').order('created_at', { ascending: false });
    if (data) setMembers(data);
    setIsLoading(false);
  };

  const updateMemberStatus = async (id: string | number, status: 'active' | 'inactive') => {
    const validUntil = status === 'active' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null;
    await supabase.from('members').update({ status, valid_until: validUntil }).eq('id', id);
    fetchMembers();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all"><i className="fa-solid fa-chevron-left"></i></button>
          <button onClick={() => setShowGuide(!showGuide)} className={`w-10 h-10 rounded-xl border transition-all flex items-center justify-center ${showGuide ? 'bg-cyan-500 text-black border-cyan-400' : 'bg-white/5 border-white/5 text-cyan-400'}`}><i className="fa-solid fa-circle-question"></i></button>
          <h2 className="text-2xl font-black italic uppercase tracking-tighter">Kelola <span className="text-cyan-400">Pengguna</span></h2>
        </div>
        <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5">
          <button onClick={() => setActiveTab('members')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'members' ? 'bg-cyan-500 text-black' : 'text-slate-500'}`}>DAFTAR MEMBER</button>
          <button onClick={() => setActiveTab('health')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'health' ? 'bg-cyan-500 text-black' : 'text-slate-500'}`}>STATUS SERVER</button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'health' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatusCard title="Database Cloud" status={dbStatus} color={dbStatus === 'Online' ? 'cyan' : 'red'} icon="fa-database" />
            <StatusCard title="Koneksi AI" status={aiStatus} color={aiStatus === 'Online' ? 'cyan' : 'red'} icon="fa-brain" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="glass-panel p-4 rounded-3xl border-white/5 bg-black/20 flex gap-4">
              <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Cari nama atau email..." className="flex-1 bg-black/40 border border-white/5 rounded-2xl py-3 px-6 text-xs text-white outline-none" />
              <button onClick={fetchMembers} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white"><i className="fa-solid fa-rotate"></i></button>
            </div>
            <div className="glass-panel rounded-[2.5rem] overflow-hidden border-white/5 bg-[#0d1117]">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/5 text-[10px] uppercase font-black text-slate-500">
                      <th className="px-8 py-6">Nama / Email</th>
                      <th className="px-8 py-6">Status</th>
                      <th className="px-8 py-6">Masa Aktif</th>
                      <th className="px-8 py-6 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {members.filter(m => m.email.includes(searchTerm)).map(m => (
                      <tr key={m.id} className="hover:bg-white/5 text-xs font-medium">
                        <td className="px-8 py-6">
                          <p className="text-white font-black">{m.full_name || 'Tanpa Nama'}</p>
                          <p className="text-[10px] text-slate-500">{m.email}</p>
                        </td>
                        <td className="px-8 py-6 uppercase font-black text-[9px]">
                          <span className={m.status === 'active' ? 'text-cyan-400' : 'text-red-500'}>{m.status}</span>
                        </td>
                        <td className="px-8 py-6 text-[10px] text-slate-400 uppercase">
                          {m.valid_until ? new Date(m.valid_until).toLocaleDateString() : 'Belum Aktif'}
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button onClick={() => updateMemberStatus(m.id, m.status === 'active' ? 'inactive' : 'active')} className="px-4 py-2 bg-white text-black rounded-xl text-[9px] font-black uppercase hover:bg-cyan-400 transition-all">
                            {m.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatusCard = ({ title, status, color, icon }: any) => (
  <div className="glass-panel p-8 rounded-[2.5rem] flex items-center justify-between border-white/5">
    <div>
      <p className="text-[9px] font-black uppercase text-slate-500 mb-1">{title}</p>
      <h3 className={`text-xl font-black italic ${color === 'cyan' ? 'text-cyan-400' : 'text-red-500'}`}>{status}</h3>
    </div>
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-${color}-500/10 border border-${color}-500/20`}><i className={`fa-solid ${icon} text-2xl text-${color}-400`}></i></div>
  </div>
);
