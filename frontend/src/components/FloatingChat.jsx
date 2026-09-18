import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { useRealtime } from '../context/RealtimeContext'
import Avatar from './Avatar'
import Icon from './Icon'
import ChatBox from './ChatBox'
import { relativeTime } from '../utils/format'

const seenKey = (id) => `chat-seen-${id}`
const getSeen = (id) => Number(localStorage.getItem(seenKey(id)) || 0)

export default function FloatingChat() {
  const { user } = useAuth()
  const { onChat, isOnline, checkPresence } = useRealtime()
  const navigate = useNavigate()
  const [convos, setConvos] = useState([])
  const [listOpen, setListOpen] = useState(false)
  const [openIds, setOpenIds] = useState([])
  const [minIds, setMinIds] = useState([])
  const [tick, setTick] = useState(0)

  const refresh = useCallback(() => {
    if (!user) return
    api.get('/conversations').then(r => {
      setConvos(r.data.data || [])
      setTick(t => t + 1)
    }).catch(() => {})
  }, [user])

  useEffect(() => { refresh() }, [refresh])
  useEffect(() => onChat(() => refresh()), [onChat, refresh])

  useEffect(() => {
    const onOpen = (e) => {
      const id = e.detail
      if (!id) return
      api.get('/conversations').then(r => {
        setConvos(r.data.data || [])
        setTick(t => t + 1)
        localStorage.setItem(seenKey(id), String(Date.now()))
        setOpenIds(prev => (prev.includes(id) ? prev : [...prev.slice(-1), id]))
        setMinIds(prev => prev.filter(x => x !== id))
        setListOpen(false)
      }).catch(() => {})
    }
    window.addEventListener('open-chat', onOpen)
    return () => window.removeEventListener('open-chat', onOpen)
  }, [])

  const partnerIds = convos.map(c => (user?.id === c.client_id ? c.freelancer_id : c.client_id)).filter(Boolean)
  useEffect(() => {
    if (partnerIds.length) checkPresence([...new Set(partnerIds)])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick])

  useEffect(() => {
    const onSent = (e) => {
      const m = e.detail
      if (!m) return
      setConvos(prev => {
        const next = prev.map(c => c.id === m.conversation_id ? { ...c, last_message: m } : c)
        next.sort((a, b) => {
          const ta = a.last_message ? new Date(a.last_message.created_at).getTime() : 0
          const tb = b.last_message ? new Date(b.last_message.created_at).getTime() : 0
          return tb - ta
        })
        return next
      })
      setTick(t => t + 1)
    }
    window.addEventListener('chat-sent', onSent)
    return () => window.removeEventListener('chat-sent', onSent)
  }, [])

  if (!user) return null

  const partnerOf = (c) => (user.id === c.client_id ? c.freelancer : c.client)
  const isUnread = (c) => c.last_message && c.last_message.sender_id !== user.id && new Date(c.last_message.created_at).getTime() > getSeen(c.id)
  const unreadCount = convos.filter(isUnread).length

  const openChat = (id) => {
    localStorage.setItem(seenKey(id), String(Date.now()))
    setOpenIds(prev => (prev.includes(id) ? prev : [...prev.slice(-1), id]))
    setMinIds(prev => prev.filter(x => x !== id))
    setListOpen(false)
    setTick(t => t + 1)
  }
  const closeChat = (id) => {
    setOpenIds(prev => prev.filter(x => x !== id))
    setMinIds(prev => prev.filter(x => x !== id))
  }
  const toggleMin = (id) => {
    localStorage.setItem(seenKey(id), String(Date.now()))
    setMinIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))
    setTick(t => t + 1)
  }

  const openConvos = openIds.map(id => convos.find(c => c.id === id)).filter(Boolean)

  return (
    <div className="hidden lg:block fixed bottom-4 right-6 z-[70] pointer-events-none">
      <div className="flex items-end gap-4 pointer-events-auto">
        {/* popup windows */}
        {openConvos.map(c => {
          const p = partnerOf(c)
          const min = minIds.includes(c.id)
          return (
            <div key={c.id} className="w-[340px] bg-white rounded-2xl border border-gray-200 shadow-[0_16px_50px_rgba(16,24,40,0.25)] overflow-hidden slide-up">
              <button
                onClick={() => toggleMin(c.id)}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 bg-gradient-to-r from-[#0e76f1] to-[#4a2fd8] text-white text-left"
              >
                <span className="relative shrink-0">
                  <Avatar src={p?.avatar} username={p?.username} size={32} className="ring-2 ring-white/40" />
                  <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-[#2b7de9] ${isOnline(p?.id) ? 'bg-emerald-400' : 'bg-gray-300'}`} title={isOnline(p?.id) ? 'Online' : 'Offline'}></span>
                </span>
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-1.5">
                    <span className="text-[13px] font-extrabold truncate">{p?.full_name || p?.username}</span>
                    {c.order_id ? (
                      <span className="text-[9px] font-extrabold bg-white/20 rounded-full px-1.5 py-0.5 shrink-0">#{c.order_id}</span>
                    ) : (
                      <span className="text-[9px] font-extrabold bg-amber-400/90 text-[#5b3a00] rounded-full px-1.5 py-0.5 shrink-0">Tanya</span>
                    )}
                  </span>
                  <span className="block text-[10px] text-white/70 truncate">{c.gig?.title || `Order #${c.order_id || c.id}`}</span>
                </span>
                <span onClick={(e) => { e.stopPropagation(); toggleMin(c.id) }} className="p-1.5 rounded-full hover:bg-white/20 transition-colors" title={min ? 'Buka' : 'Minimize'}>
                  <Icon name="chevDown" size={15} className={`transition-transform ${min ? 'rotate-180' : ''}`} />
                </span>
                <span onClick={(e) => { e.stopPropagation(); closeChat(c.id) }} className="p-1.5 rounded-full hover:bg-white/20 transition-colors" title="Tutup">
                  <Icon name="x" size={15} />
                </span>
              </button>
              {!min && (
                <div className="px-4 pb-4 max-h-[440px] overflow-y-auto">
                  <ChatBox conversationId={c.id} partner={p} />
                </div>
              )}
            </div>
          )
        })}

        {/* launcher */}
        <div className="relative">
          {listOpen && (
            <div className="absolute bottom-16 right-0 w-[320px] bg-white rounded-2xl border shadow-[0_16px_50px_rgba(16,24,40,0.25)] overflow-hidden fade-up">
              <div className="flex items-center gap-2 px-4 py-3 border-b">
                <h3 className="font-extrabold text-ink text-sm">Pesan</h3>
                <button onClick={() => { setListOpen(false); navigate('/messages') }} className="ml-auto text-xs font-bold text-[#0e76f1] hover:underline">Buka inbox</button>
              </div>
              <div className="max-h-[380px] overflow-y-auto divide-y">
                {convos.length === 0 && <p className="text-xs text-gray-400 text-center py-8">Belum ada percakapan.</p>}
                {convos.slice(0, 10).map(c => {
                  const p = partnerOf(c)
                  return (
                    <button key={c.id} onClick={() => openChat(c.id)} className="w-full flex gap-2.5 px-4 py-3 text-left hover:bg-blue-50/50 transition-colors">
                      <Avatar src={p?.avatar} username={p?.username} size={40} className="shrink-0" />
                      <span className="flex-1 min-w-0">
                        <span className="flex items-center gap-2">
                          <span className="flex-1 truncate text-[13px] font-bold text-ink">{p?.full_name || p?.username}</span>
                          {c.last_message && <span className="text-[10px] text-gray-400 shrink-0">{relativeTime(c.last_message.created_at)}</span>}
                        </span>
                        <span className="inline-block mt-1">
                          {c.order_id ? (
                            <span className="text-[10px] font-extrabold bg-blue-50 text-[#0e76f1] rounded-full px-2 py-0.5">Order #{c.order_id}</span>
                          ) : (
                            <span className="text-[10px] font-extrabold bg-amber-50 text-amber-600 rounded-full px-2 py-0.5">Tanya jasa</span>
                          )}
                        </span>
                        <span className="block truncate text-xs text-gray-500 mt-0.5">{c.last_message ? `${c.last_message.sender_id === user.id ? 'Kamu: ' : ''}${c.last_message.body}` : (c.gig?.title || '')}</span>
                      </span>
                      {isUnread(c) && <span className="w-2.5 h-2.5 rounded-full bg-[#0e76f1] shrink-0 mt-1.5"></span>}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
          <button
            onClick={() => setListOpen(v => !v)}
            title="Chat"
            className="relative w-14 h-14 rounded-full bg-gradient-to-br from-[#0e76f1] to-[#6a3cff] text-white flex items-center justify-center shadow-xl shadow-blue-600/30 hover:scale-105 active:scale-95 transition-transform"
          >
            <Icon name="chat" size={24} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
