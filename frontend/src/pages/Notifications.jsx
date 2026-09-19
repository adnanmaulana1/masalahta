import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useNotifications, notifStyle } from '../context/NotificationContext'
import { useAuth } from '../context/AuthContext'
import Icon from '../components/Icon'
import { relativeTime } from '../utils/format'

export default function Notifications() {
  const { user } = useAuth()
  const { items, markOne, markAll } = useNotifications()
  const [filter, setFilter] = useState('all')
  const navigate = useNavigate()

  if (!user) {
    return (
      <div className="max-w-[1240px] mx-auto px-4 py-16 text-center">
        <h1 className="font-extrabold text-ink text-lg dark:text-gray-100">Login untuk melihat notifikasi</h1>
        <Link to="/login" className="btn-primary mt-5">Masuk</Link>
      </div>
    )
  }

  const shown = filter === 'unread' ? items.filter(n => !n.read) : items
  const openNotif = (n) => {
    markOne(n.id)
    if (n.link) navigate(n.link)
  }

  return (
    <div className="max-w-[720px] mx-auto px-4 py-6 sm:py-8">
      <div className="flex items-center gap-3 mb-5">
        <span className="w-11 h-11 rounded-xl bg-blue-50 text-[#0e76f1] flex items-center justify-center"><Icon name="bell" size={22} /></span>
        <div>
          <h1 className="text-xl font-extrabold text-ink dark:text-gray-100">Notifikasi</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{items.filter(n => !n.read).length} belum dibaca</p>
        </div>
        <button onClick={markAll} disabled={items.filter(n => !n.read).length === 0} className="ml-auto text-sm font-bold text-[#0e76f1] hover:underline disabled:text-gray-300 disabled:no-underline">Tandai semua dibaca</button>
      </div>

      <div className="flex gap-1.5 mb-4">
        {[['all', 'Semua'], ['unread', 'Belum dibaca']].map(([v, l]) => (
          <button
            key={v}
            onClick={() => setFilter(v)}
            className={`text-xs font-bold rounded-full px-4 py-2 transition-colors ${filter === v ? 'bg-[#101c3a] text-white' : 'bg-white border text-gray-500 hover:bg-gray-50'}`}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-200/70 bg-white shadow-sm overflow-hidden divide-y dark:bg-slate-900">
        {shown.length === 0 ? (
          <div className="px-4 py-14 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mb-3"><Icon name="bell" size={24} /></div>
            <div className="font-bold text-ink text-sm dark:text-gray-100">Tidak ada notifikasi</div>
            <div className="text-xs text-gray-500 mt-1 dark:text-gray-400">Notifikasi order, ulasan, dan info akun muncul di sini.</div>
          </div>
        ) : shown.map(n => {
          const st = notifStyle[n.type] || notifStyle.system
          return (
            <button
              key={n.id}
              onClick={() => openNotif(n)}
              className={`w-full flex gap-3 px-4 sm:px-5 py-4 text-left transition-colors hover:bg-blue-50/60 ${!n.read ? 'bg-blue-50/40' : ''}`}
            >
              <span className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${st.chip}`}><Icon name={st.icon} size={19} /></span>
              <span className="flex-1 min-w-0">
                <span className="flex items-start gap-2">
                  <span className="flex-1 text-sm font-bold text-ink leading-snug dark:text-gray-100">{n.title}</span>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-[#0e76f1] shrink-0 mt-1.5"></span>}
                </span>
                <span className="block text-[13px] text-gray-500 leading-relaxed mt-0.5 dark:text-gray-400">{n.desc}</span>
                <span className="block text-[11px] text-gray-400 mt-1">{relativeTime(n.created_at)}</span>
              </span>
              <Icon name="chevRight" size={16} className="text-gray-300 shrink-0 mt-1" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
