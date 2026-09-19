import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from './Icon'
import { relativeTime } from '../utils/format'
import { useNotifications, notifStyle } from '../context/NotificationContext'

export default function NotificationMenu() {
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState('all')
  const { items, unread, markAll, markOne } = useNotifications()
  const ref = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const shown = (filter === 'unread' ? items.filter((n) => !n.read) : items).slice(0, 8)

  const openNotif = (n) => {
    markOne(n.id)
    setOpen(false)
    if (n.link) navigate(n.link)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        title="Notifikasi"
        aria-expanded={open}
        className={`relative p-2.5 rounded-full transition-colors ${open ? 'bg-blue-50 dark:bg-blue-500/10 text-[#0e76f1]' : 'hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400'}`}
      >
        <Icon name="bell" size={20} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#ff4d4f] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2.5 w-[380px] max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-white/10 shadow-lift overflow-hidden fade-up z-50">
          <div className="flex items-center gap-2 px-4 pt-4 pb-3">
            <h3 className="font-extrabold text-ink dark:text-gray-100">Notifikasi</h3>
            {unread > 0 && (
              <span className="text-[11px] font-bold bg-blue-50 dark:bg-blue-500/10 text-[#0e76f1] rounded-full px-2 py-0.5">{unread} baru</span>
            )}
            <button onClick={markAll} disabled={unread === 0} className="ml-auto text-xs font-bold text-[#0e76f1] hover:underline disabled:text-gray-300 disabled:no-underline">
              Tandai dibaca
            </button>
          </div>

          <div className="flex gap-1.5 px-4 pb-3">
            {[['all', 'Semua'], ['unread', 'Belum dibaca']].map(([v, l]) => (
              <button
                key={v}
                onClick={() => setFilter(v)}
                className={`text-xs font-bold rounded-full px-3 py-1.5 transition-colors ${filter === v ? 'bg-[#101c3a] text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'}`}
              >
                {l}
              </button>
            ))}
          </div>

          <div className="max-h-[380px] overflow-auto">
            {shown.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 dark:text-gray-400 mb-3">
                  <Icon name="bell" size={24} />
                </div>
                <div className="font-bold text-ink dark:text-gray-100 text-sm">Sudah dibaca semua</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Notifikasi baru akan muncul di sini.</div>
              </div>
            ) : shown.map((n) => {
              const st = notifStyle[n.type] || notifStyle.system
              return (
                <button
                  key={n.id}
                  onClick={() => openNotif(n)}
                  className={`w-full flex gap-3 px-4 py-3 text-left transition-colors hover:bg-blue-50/60 dark:hover:bg-blue-500/10 ${!n.read ? 'bg-blue-50/40 dark:bg-blue-500/10' : ''}`}
                >
                  <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${st.chip}`}>
                    <Icon name={st.icon} size={18} />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="flex items-start gap-2">
                      <span className="flex-1 text-[13px] font-bold text-ink dark:text-gray-100 leading-snug">{n.title}</span>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-[#0e76f1] shrink-0 mt-1.5"></span>}
                    </span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-0.5 line-clamp-2">{n.desc}</span>
                    <span className="block text-[11px] text-gray-400 dark:text-gray-400 mt-1">{relativeTime(n.created_at)}</span>
                  </span>
                </button>
              )
            })}
          </div>

          <button
            onClick={() => { setOpen(false); navigate('/notifications') }}
            className="w-full flex items-center justify-center gap-1.5 px-4 py-3 text-sm font-bold text-[#0e76f1] hover:bg-blue-50 dark:hover:bg-blue-500/10 border-t border-gray-200 dark:border-white/10 transition-colors"
          >
            Lihat semua notifikasi <Icon name="arrowRight" size={15} />
          </button>
        </div>
      )}
    </div>
  )
}
