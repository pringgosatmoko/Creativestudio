
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';

interface Message {
  id: string | number;
  sender_email: string;
  receiver_email: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

interface Member {
  email: string;
  full_name?: string;
  status: string;
}

interface DirectChatProps {
  userEmail: string;
  isAdmin: boolean;
  adminEmail: string;
  initialTarget?: string | null;
  onBack: () => void;
}

export const DirectChat: React.FC<DirectChatProps> = ({ userEmail, isAdmin, adminEmail, initialTarget, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [contacts, setContacts] = useState<(Member & { lastMsg?: string, time?: string, unread?: number, isOfficial?: boolean })[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(initialTarget || null);
  const [isLoading, setIsLoading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const msgSound = useMemo(() => new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3'), []);

  const supabase = useMemo(() => {
    const vEnv = (import.meta as any).env || {};
    const pEnv = (typeof process !== 'undefined' ? process.env : {}) || {};
    const url = vEnv.VITE_DATABASE_URL || pEnv.VITE_DATABASE_URL || 'https://urokqoorxuiokizesiwa.supabase.co';
    const key = vEnv.VITE_SUPABASE_ANON_KEY || pEnv.VITE_SUPABASE_ANON_KEY || 'sb_publishable_G1udRukMNJjDM6wlVD3xtw_IF8Yrbd8';
    return createClient(url, key);
  }, []);

  useEffect(() => {
    fetchContactsAndHistory();
    if (selectedUser) {
      fetchMessages(selectedUser);
      markAsRead(selectedUser);
    }
  }, [selectedUser]);

  useEffect(() => {
    const channel = supabase
      .channel('realtime-chat-direct')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'direct_messages' }, payload => {
        const newMessage = payload.new as Message;
        const isToMe = newMessage.receiver_email.toLowerCase() === userEmail.toLowerCase();
        const isFromSelected = newMessage.sender_email.toLowerCase() === selectedUser?.toLowerCase();
        const isMeSending = newMessage.sender_email.toLowerCase() === userEmail.toLowerCase() && newMessage.receiver_email.toLowerCase() === selectedUser?.toLowerCase();

        if (isFromSelected && isToMe) {
          setMessages(prev => [...prev, newMessage]);
          markAsRead(selectedUser!);
          msgSound.play().catch(() => {});
        } else if (isMeSending) {
          setMessages(prev => [...prev, newMessage]);
        } else if (isToMe) {
          msgSound.play().catch(() => {});
          fetchContactsAndHistory();
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedUser, userEmail]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const markAsRead = async (target: string) => {
    if (!target) return;
    await supabase
      .from('direct_messages')
      .update({ is_read: true })
      .eq('receiver_email', userEmail.toLowerCase())
      .eq('sender_email', target.toLowerCase())
      .eq('is_read', false);
  };

  const fetchContactsAndHistory = async () => {
    try {
      const { data: membersRaw } = await supabase.from('members').select('email, full_name, status');
      const { data: lastMessages } = await supabase
        .from('direct_messages')
        .select('*')
        .or(`sender_email.eq.${userEmail.toLowerCase()},receiver_email.eq.${userEmail.toLowerCase()}`)
        .order('created_at', { ascending: false });

      let membersList = membersRaw || [];
      const adminInList = membersList.some(m => m.email.toLowerCase() === adminEmail.toLowerCase());
      if (!adminInList) {
        membersList.push({ email: adminEmail, full_name: 'Admin Satmoko', status: 'active' });
      }

      const processedContacts = membersList
        .filter(m => m.email.toLowerCase() !== userEmail.toLowerCase())
        .map(member => {
          const history = lastMessages?.filter(m => 
            m.sender_email.toLowerCase() === member.email.toLowerCase() || 
            m.receiver_email.toLowerCase() === member.email.toLowerCase()
          );
          const lastMsg = history?.[0];
          const unreadCount = history?.filter(m => m.receiver_email.toLowerCase() === userEmail.toLowerCase() && !m.is_read).length || 0;
          return {
            ...member,
            lastMsg: lastMsg?.content || 'Belum ada pesan',
            unread: unreadCount,
            time: lastMsg ? new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
            rawTime: lastMsg ? new Date(lastMsg.created_at).getTime() : 0,
            isOfficial: member.email.toLowerCase() === adminEmail.toLowerCase()
          };
        });
      
      processedContacts.sort((a, b) => b.rawTime - a.rawTime);
      setContacts(processedContacts);
    } catch (e) { console.error(e); }
  };

  const fetchMessages = async (target: string) => {
    setIsLoading(true);
    const { data } = await supabase
      .from('direct_messages')
      .select('*')
      .or(`and(sender_email.eq.${userEmail.toLowerCase()},receiver_email.eq.${target.toLowerCase()}),and(sender_email.eq.${target.toLowerCase()},receiver_email.eq.${userEmail.toLowerCase()})`)
      .order('created_at', { ascending: true });
    
    if (data) setMessages(data);
    setIsLoading(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedUser) return;
    const msgContent = input;
    setInput('');
    
    try {
      const { error } = await supabase.from('direct_messages').insert([{
        sender_email: userEmail.toLowerCase(),
        receiver_email: selectedUser.toLowerCase(),
        content: msgContent,
        is_read: false
      }]);
      if (error) throw error;
      fetchContactsAndHistory();
    } catch (e) { console.error(e); }
  };

  const clearAllMessages = async () => {
    if (!selectedUser || !confirm("Hapus semua riwayat chat ini?")) return;
    setIsLoading(true);
    try {
      await supabase.from('direct_messages')
        .delete()
        .or(`and(sender_email.eq.${userEmail.toLowerCase()},receiver_email.eq.${selectedUser.toLowerCase()}),and(sender_email.eq.${selectedUser.toLowerCase()},receiver_email.eq.${userEmail.toLowerCase()})`);
      setMessages([]);
      fetchContactsAndHistory();
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-4 max-w-6xl mx-auto overflow-hidden">
      {/* Navigation Header */}
      <div className="flex items-center gap-4 mb-2">
        <button 
          onClick={onBack} 
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all shadow-xl active:scale-95"
          title="Back to Dashboard"
        >
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <button onClick={() => setShowGuide(!showGuide)} className={`w-10 h-10 rounded-xl border transition-all flex items-center justify-center ${showGuide ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_#22d3ee]' : 'bg-white/5 border-white/5 text-cyan-400'}`}>
          <i className="fa-solid fa-circle-question"></i>
        </button>
        <div>
          <h2 className="text-2xl font-black italic uppercase tracking-tighter leading-none">Direct <span className="text-cyan-400">Inbox</span></h2>
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 mt-1">Encrypted Node Communication</p>
        </div>
      </div>

      <AnimatePresence>
        {showGuide && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="glass-panel p-6 rounded-[2rem] border-cyan-500/20 bg-cyan-500/10 mb-2 relative">
              <button onClick={() => setShowGuide(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><i className="fa-solid fa-xmark text-xs"></i></button>
              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 flex items-center justify-center flex-shrink-0"><i className="fa-solid fa-comment-dots text-cyan-400"></i></div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-white mb-1">Panduan Direct Inbox</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-medium">Saluran komunikasi pribadi antar node. Pesan disimpan secara aman di database cloud Supabase. Node Admin ditandai dengan ikon perisai. Gunakan ini untuk koordinasi teknis atau bantuan pendaftaran langsung.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-1 overflow-hidden gap-4">
        {/* Sidebar Contacts */}
        <div className={`${selectedUser && window.innerWidth < 1024 ? 'hidden' : 'flex'} w-full lg:w-80 glass-panel rounded-[2.5rem] bg-[#0e1621] border-white/5 flex flex-col overflow-hidden shadow-2xl`}>
          <div className="p-6 border-b border-white/5">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Active Nodes</h3>
            <div className="relative mt-4">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-[10px]"></i>
              <input 
                type="text" 
                placeholder="Search users..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-black/30 border border-white/5 rounded-xl py-2 pl-9 pr-4 text-[10px] text-white focus:outline-none focus:border-cyan-500/30 transition-all"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            {contacts.filter(c => c.email.toLowerCase().includes(searchTerm.toLowerCase())).map(c => (
              <button 
                key={c.email} 
                onClick={() => setSelectedUser(c.email)}
                className={`w-full p-4 rounded-2xl text-left transition-all flex items-center gap-4 mb-1 group ${selectedUser === c.email ? 'bg-cyan-500/10 border border-cyan-500/20 shadow-[inset_0_0_15px_rgba(34,211,238,0.05)]' : 'hover:bg-white/5 border border-transparent'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-black border transition-colors ${selectedUser === c.email ? 'bg-cyan-500 text-black border-cyan-400' : 'bg-slate-800 text-slate-400 border-white/5 group-hover:border-cyan-500/30'}`}>
                  {c.isOfficial ? <i className="fa-solid fa-shield-halved"></i> : c.email.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className={`text-[10px] font-black truncate uppercase tracking-tighter ${c.isOfficial ? 'text-cyan-400' : 'text-white'}`}>{c.full_name || c.email.split('@')[0]}</p>
                    {c.unread > 0 && <span className="w-4 h-4 bg-cyan-500 text-black text-[8px] font-black rounded-full flex items-center justify-center shadow-lg animate-pulse">{c.unread}</span>}
                  </div>
                  <p className="text-[9px] truncate text-slate-500 italic mt-0.5">{c.lastMsg}</p>
                </div>
              </button>
            ))}
            {contacts.length === 0 && (
              <div className="p-8 text-center opacity-20">
                <i className="fa-solid fa-users-slash text-2xl mb-2"></i>
                <p className="text-[8px] font-black uppercase tracking-widest">No nodes found</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className={`${!selectedUser && window.innerWidth < 1024 ? 'hidden' : 'flex'} flex-1 glass-panel rounded-[2.5rem] bg-[#17212b] border-white/5 flex flex-col overflow-hidden shadow-2xl relative`}>
          {/* Terminal Background Decoration */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.01)_1px,transparent_1px)] bg-[length:40px_40px] pointer-events-none"></div>

          <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between bg-black/20 backdrop-blur-md relative z-10">
            <div className="flex items-center gap-4">
              <button onClick={() => setSelectedUser(null)} className="lg:hidden text-slate-400 hover:text-white"><i className="fa-solid fa-chevron-left"></i></button>
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${selectedUser ? 'bg-cyan-500 animate-pulse' : 'bg-slate-700'}`}></div>
                <h4 className="text-[12px] font-black text-white uppercase italic tracking-widest">{selectedUser ? selectedUser.split('@')[0] : 'Private Terminal'}</h4>
              </div>
            </div>
            {selectedUser && (
              <button 
                onClick={clearAllMessages} 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                title="Clear History"
              >
                <i className="fa-solid fa-trash-can text-xs"></i>
              </button>
            )}
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4 relative z-10">
            {selectedUser ? (
              messages.length > 0 ? (
                messages.map((m, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    key={i} 
                    className={`flex ${m.sender_email.toLowerCase() === userEmail.toLowerCase() ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`p-4 rounded-2xl max-w-[80%] shadow-lg ${m.sender_email.toLowerCase() === userEmail.toLowerCase() ? 'bg-cyan-600/90 text-white rounded-tr-none border border-cyan-500/30' : 'bg-slate-800/90 text-slate-100 rounded-tl-none border border-white/5'}`}>
                      <p className="text-sm leading-relaxed">{m.content}</p>
                      <p className="text-[7px] opacity-40 mt-2 text-right uppercase font-black tracking-widest">{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-20">
                  <i className="fa-solid fa-comment-slash text-5xl mb-4"></i>
                  <p className="text-[10px] font-black uppercase tracking-[0.5em]">No conversation history</p>
                </div>
              )
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-10">
                <i className="fa-solid fa-satellite-dish text-8xl mb-6"></i>
                <p className="font-black uppercase tracking-[0.8em] text-xl">Select Node Interface</p>
              </div>
            )}
          </div>

          {selectedUser && (
            <div className="p-6 bg-black/30 backdrop-blur-xl border-t border-white/5 relative z-10">
              <div className="flex gap-4 p-2 bg-slate-900/80 rounded-[2rem] border border-white/5 focus-within:border-cyan-500/50 transition-all shadow-inner">
                <input 
                  type="text" 
                  value={input} 
                  onChange={e => setInput(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && sendMessage()} 
                  placeholder="Transmit message..." 
                  className="flex-1 bg-transparent px-6 py-4 outline-none text-sm text-white placeholder:text-slate-700" 
                />
                <button 
                  onClick={sendMessage} 
                  disabled={!input.trim()}
                  className="w-12 h-12 rounded-full bg-cyan-600 text-white hover:bg-cyan-500 hover:shadow-[0_0_20px_#0891b2] transition-all flex items-center justify-center disabled:opacity-20 disabled:hover:shadow-none active:scale-90"
                >
                  <i className="fa-solid fa-paper-plane text-xs"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
