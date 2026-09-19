import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { useRealtime } from '../context/RealtimeContext'
import Avatar from '../components/Avatar'
import Icon from '../components/Icon'
import ChatBox from '../components/ChatBox'
import { parseImages, relativeTime, orderStatus } from '../utils/format'

const seenKey = (orderId) => `chat-seen-${orderId}`
const getSeen = (orderId) => Number(localStorage.getItem(seenKey(orderId)) || 0)
const setSeen = (orderId) => localStorage.setItem(seenKey(orderId), String(Date.now()))

export default function Messages() {
  const { user, loading: authLoading } = useAuth()
  const { onChat, isOnline, checkPresence } = useRealtime()
  const [convos, setConvos] = useState([])
  const [loading, setLoading] = useState(true)
  const [params] = useSearchParams()
  const [activeId, setActiveId] = useState(() => {
    const c = Number(params.get('c'))
    return c || null
  })
  const [tick, setTick] = useState(0)

  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('all') // all | unread | order | tanya
  const refresh = () => {
    api.get('/conversations').then(r => {
      setConvos(r.data.data || [])
      setTick(t => t + 1)
    }).catch(() => {}).finally(() => setLoading(false))
  }
  useEffect(() => { refresh() }, [])

  useEffect(() => {
    return onChat(() => { refresh() })
  }, [onChat])

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

  useEffect(() => {
    if (activeId) setSeen(activeId)
  }, [activeId, tick])

  useEffect(() => {
    if (!user || convos.length === 0) return
    const ids = [...new Set(convos.map(c => (user.id === c.client_id ? c.freelancer_id : c.client_id)).filter(Boolean))]
    if (ids.length) checkPresence(ids)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, user])

  const active = useMemo(() => convos.find(c => c.id === activeId), [convos, activeId])
  const partnerOf = (c) => (user?.id === c.client_id ? c.freelancer : c.client)
  const isUnread = (c) => !!user && c.last_message && c.last_message.sender_id !== user.id && new Date(c.last_message.created_at).getTime() > getSeen(c.id)

  const filtered = useMemo(() => {
    if (!user) return []
    return convos.filter(c => {
      if (filter === 'unread' && !isUnread(c)) return false
      if (filter === 'order' && !c.order_id) return false
      if (filter === 'tanya' && c.order_id) return false
      if (q) {
        const p = partnerOf(c)
        const hay = `${p?.full_name || ''} ${p?.username || ''} ${c.gig?.title || ''} ${c.last_message?.body || ''}`.toLowerCase()
        if (!hay.includes(q.toLowerCase())) return false
      }
      return true
    })
  }, [convos, filter, q, tick, user])

  if (authLoading) {
    return <div className="max-w-[1100px] mx-auto px-4 py-6"><div className="skeleton h-24 rounded-2xl" /></div>
  }
  if (!user) {
    return (
      <div className="max-w-[1240px] mx-auto px-4 py-16 text-center">
        <h1 className="font-extrabold text-ink text-lg dark:text-gray-100">Login untuk membuka pesan</h1>
        <Link to="/login" className="btn-primary mt-5">Masuk</Link>
      </div>
    )
  }

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-6">
      <h1 className="text-xl font-extrabold text-ink dark:text-gray-100">Pesan</h1>
      <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">Semua percakapan order-mu dalam satu tempat</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Cari pesan / orang / jasa..." className="w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 py-2.5 text-sm outline-none focus:border-[#0e76f1] focus:ring-2 focus:ring-blue-100 dark:bg-slate-900 dark:border-white/10" />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            ['all','Semua'],
            ['unread','Belum dibaca'],
            ['order','Order'],
            ['tanya','Tanya'],
          ].map(([v,l]) => (
            <button key={v} onClick={()=>setFilter(v)} className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-bold border transition ${filter===v ? 'bg-[#0e76f1] text-white border-[#0e76f1]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#0e76f1] hover:text-[#0e76f1]'}`}>
              {l} {v==='unread' && convos.filter(isUnread).length>0 && <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] ${filter===v ? 'bg-white/20' : 'bg-blue-50 text-[#0e76f1]'}`}>{convos.filter(isUnread).length}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid md:grid-cols-[320px_1fr] gap-4 items-start">
        {/* daftar percakapan */}
        <div className={`rounded-2xl border border-gray-200/70 bg-white shadow-sm overflow-hidden ${activeId ? 'hidden md:block' : ''}`}>
          {loading ? (
            <div className="p-4 space-y-3">{[0, 1, 2].map(i => <div key={i} className="skeleton h-14" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mb-3"><Icon name="chat" size={24} /></div>
              <div className="font-bold text-ink text-sm dark:text-gray-100">{convos.length===0 ? 'Belum ada percakapan' : 'Tidak ada hasil'}</div>
              <div className="text-xs text-gray-500 mt-1 dark:text-gray-400">{convos.length===0 ? 'Buat order untuk mulai chat.' : 'Coba ubah filter atau kata kunci.'}</div>
            </div>
          ) : (
            <div className="divide-y max-h-[70vh] overflow-y-auto">
              {filtered.map(c => {
                const p = partnerOf(c)
                const unread = isUnread(c)
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveId(c.id)}
                    className={`w-full flex gap-3 px-4 py-3.5 text-left transition-colors hover:bg-blue-50/50 ${activeId === c.id ? 'bg-blue-50/70' : unread ? 'bg-blue-50/30' : ''}`}
                  >
                    <Avatar src={p?.avatar} username={p?.username} size={44} status={isOnline(p?.id) ? 'online' : 'offline'} />
                      <span className="flex-1 min-w-0">
                        <span className="flex items-center gap-2">
                          <span className={`flex-1 truncate text-sm ${unread ? 'font-extrabold text-ink' : 'font-bold text-gray-700'}`}>{p?.full_name || p?.username}</span>
                          {c.last_message && <span className="text-[10px] text-gray-400 shrink-0">{relativeTime(c.last_message.created_at)}</span>}
                        </span>
                        <span className="flex items-center gap-1.5 mt-1">
                          {c.order_id ? (
                            <span className="text-[10px] font-extrabold bg-blue-50 text-[#0e76f1] rounded-full px-2 py-0.5">Order #{c.order_id}{c.order?.status ? ` • ${orderStatus[c.order.status]?.label || c.order.status}` : ''}</span>
                          ) : (
                            <span className="text-[10px] font-extrabold bg-amber-50 text-amber-600 rounded-full px-2 py-0.5">Tanya jasa</span>
                          )}
                        </span>
                      <span className={`block truncate text-xs mt-0.5 ${unread ? 'font-bold text-ink' : 'text-gray-500'}`}>
                        {c.last_message ? `${c.last_message.sender_id === user.id ? 'Kamu: ' : ''}${c.last_message.body}` : (c.gig?.title || `Order #${c.id}`)}
                      </span>
                      <span className="block truncate text-[11px] text-gray-400 mt-0.5">{c.gig?.title}</span>
                    </span>
                    {unread && <span className="w-2.5 h-2.5 rounded-full bg-[#0e76f1] shrink-0 mt-1.5"></span>}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* thread aktif */}
        <div className={`rounded-2xl border border-gray-200/70 bg-white shadow-sm p-4 sm:p-5 ${activeId ? '' : 'hidden md:block'}`}>
          {!active ? (
            <div className="py-16 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mb-3"><Icon name="chat" size={24} /></div>
              <div className="font-bold text-ink text-sm dark:text-gray-100">Pilih percakapan</div>
              <div className="text-xs text-gray-500 mt-1 dark:text-gray-400">Klik salah satu untuk membaca dan membalas.</div>
            </div>
          ) : (
            <>
              <button onClick={() => setActiveId(null)} className="md:hidden flex items-center gap-1 text-xs font-bold text-[#0e76f1] mb-3">
                <Icon name="arrowRight" size={14} className="rotate-180" /> Semua pesan
              </button>
              <div className="flex items-center gap-3 pb-3 border-b">
                <span className="relative shrink-0">
                  <Avatar src={partnerOf(active)?.avatar} username={partnerOf(active)?.username} size={40} />
                  <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-white ${isOnline(partnerOf(active)?.id) ? 'bg-emerald-400' : 'bg-gray-300'}`} title={isOnline(partnerOf(active)?.id) ? 'Online' : 'Offline'}></span>
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-extrabold text-ink truncate dark:text-gray-100">{partnerOf(active)?.full_name || partnerOf(active)?.username}</div>
                  <div className={`text-[11px] font-semibold ${isOnline(partnerOf(active)?.id) ? 'text-emerald-600' : 'text-gray-400'}`}>{isOnline(partnerOf(active)?.id) ? 'Online' : 'Offline'} • <Link to={`/gig/${active.gig?.slug}`} className="text-[#0e76f1] hover:underline font-medium">{active.gig?.title || `Order #${active.id}`}</Link></div>
                </div>
                <span className="ml-auto w-16 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0 border">
                  {active.gig?.images && <img src={parseImages(active.gig.images)[0]} alt="" className="w-full h-full object-cover" loading="lazy" onError={e => e.target.style.display = 'none'} />}
                </span>
              </div>
              <ChatBox conversationId={active.id} partner={partnerOf(active)} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
