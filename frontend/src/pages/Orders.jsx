import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import Icon from '../components/Icon'
import Avatar from '../components/Avatar'
import { formatIDR, orderStatus, parseImages } from '../utils/format'
import { showToast } from '../components/Toast'
import ChatBox from '../components/ChatBox'
import Stars from '../components/Stars'

function ReviewForm({ order, onDone }) {
  const [rating, setRating] = useState(5)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/reviews', { gig_id: order.gig_id, order_id: order.id, rating, comment })
      showToast('Terima kasih atas ulasanmu!')
      onDone(order.id)
    } catch (e2) {
      showToast(e2.response?.data?.error || 'Gagal mengirim ulasan', 'error')
    }
    setSaving(false)
  }

  return (
    <form onSubmit={submit} className="mt-3 rounded-xl bg-amber-50/60 border border-amber-100 p-4">
      <p className="text-xs font-extrabold text-ink dark:text-gray-100">Beri ulasan untuk freelancer ini</p>
      <div className="flex items-center gap-1 mt-2">
        {[1, 2, 3, 4, 5].map(v => (
          <button key={v} type="button" onClick={() => setRating(v)} onMouseEnter={() => setHover(v)} onMouseLeave={() => setHover(0)} aria-label={`${v} bintang`} className="p-0.5 hover:scale-125 active:scale-95 transition-transform">
            <Icon name="starFill" size={26} className={(hover || rating) >= v ? 'text-amber-400' : 'text-gray-300'} fill="currentColor" strokeWidth={0} />
          </button>
        ))}
        <span className="text-xs font-bold text-gray-500 ml-1.5 dark:text-gray-400">{['', 'Buruk', 'Kurang', 'Cukup', 'Bagus', 'Luar biasa'][hover || rating]}</span>
      </div>
      <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Ceritakan pengalamanmu..." rows={2} className="input-field mt-3 !py-2.5" />
      <button disabled={saving} className="btn-primary !py-2 !px-4 !text-xs mt-2.5">
        {saving ? <span className="inline-block w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span> : 'Kirim Ulasan'}
      </button>
    </form>
  )
}

const FLOW = ['pending', 'progress', 'review', 'completed']

function StatusFlow({ current, cancelled }) {
  if (cancelled) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-[11px] font-bold text-red-600 bg-red-50 border border-red-100 rounded-full px-3 py-1">Dibatalkan</span>
      </div>
    )
  }
  const idx = FLOW.indexOf(current)
  return (
    <div className="flex items-center gap-1">
      {FLOW.map((s, i) => {
        const st = orderStatus[s]
        const done = i <= idx
        return (
          <div key={s} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${done ? 'bg-[#0e76f1] text-white shadow-md shadow-blue-500/30' : 'bg-gray-100 text-gray-400'}`}>
                {done ? <Icon name="check" size={13} strokeWidth={3} /> : <span className="text-[10px] font-bold">{i + 1}</span>}
              </span>
              <span className={`text-[9px] font-bold whitespace-nowrap ${done ? 'text-[#0e76f1]' : 'text-gray-400'}`}>{st.label}</span>
            </div>
            {i < FLOW.length - 1 && <span className={`w-8 h-0.5 mb-4 rounded ${i < idx ? 'bg-[#0e76f1]' : 'bg-gray-200'}`}></span>}
          </div>
        )
      })}
    </div>
  )
}

export default function Orders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [type, setType] = useState('mine')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [chatOpen, setChatOpen] = useState({})
  const [reviewed, setReviewed] = useState([])
  const [reviewOpen, setReviewOpen] = useState({})

  const fetchOrders = () => {
    setLoading(true)
    api.get('/orders').then(r => setOrders(r.data.data || [])).catch(() => {}).finally(() => setLoading(false))
    api.get('/reviews/mine').then(r => setReviewed(r.data.data || [])).catch(() => {})
  }
  useEffect(() => { fetchOrders() }, [])

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/orders/${id}/status`, { status })
      showToast('Status pesanan diperbarui')
      fetchOrders()
    } catch { showToast('Gagal memperbarui status', 'error') }
  }

  let list = orders
  if (user?.role === 'freelancer') {
    list = type === 'mine' ? orders.filter(o => o.client_id === user.id) : orders.filter(o => o.freelancer_id === user.id)
  }
  if (filter !== 'all') list = list.filter(o => o.status === filter)

  const mineCount = orders.filter(o => o.client_id === user?.id).length
  const incomingCount = orders.filter(o => user?.role === 'freelancer' && o.freelancer_id === user.id).length

  return (
    <div className="max-w-[900px] mx-auto px-4 py-6">
      <h1 className="text-xl font-extrabold text-ink dark:text-gray-100">Pesanan Saya</h1>
      <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">Pantau dan kelola semua transaksimu</p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {user?.role === 'freelancer' && (
          <>
            <button onClick={() => setType('mine')} className={`tag ${type === 'mine' ? '!border-[#0e76f1] !text-[#0e76f1] !bg-blue-50 font-bold' : ''}`}>Beli ({mineCount})</button>
            <button onClick={() => setType('incoming')} className={`tag ${type === 'incoming' ? '!border-[#0e76f1] !text-[#0e76f1] !bg-blue-50 font-bold' : ''}`}>Jual ({incomingCount})</button>
            <div className="w-px h-6 bg-gray-200 mx-1"></div>
          </>
        )}
        {['all', 'pending', 'progress', 'review', 'completed', 'cancelled'].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`tag capitalize ${filter === s ? '!border-[#0e76f1] !text-[#0e76f1] !bg-blue-50 font-bold' : ''}`}>
            {s === 'all' ? 'Semua' : (orderStatus[s]?.label || s)}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card p-4 space-y-3"><div className="skeleton h-5 w-2/3" /><div className="skeleton h-4 w-1/3" /><div className="flex gap-2"><div className="skeleton h-8 w-24" /><div className="skeleton h-8 w-24" /></div></div>
          ))
        ) : list.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center mb-4 text-gray-400"><Icon name="box" size={28} /></div>
            <h3 className="font-bold text-ink dark:text-gray-100">Belum ada pesanan</h3>
            <p className="text-sm text-gray-500 mt-1 mb-5 dark:text-gray-400">Temukan jasa yang kamu butuhkan sekarang</p>
            <Link to="/explore" className="btn-primary">Jelajahi Jasa</Link>
          </div>
        ) : list.map(o => {
          const isFreelancerView = user?.role === 'freelancer' && o.freelancer_id === user.id
          const partner = isFreelancerView ? o.client : o.freelancer
          return (
            <div key={o.id} className="card p-5 fade-up">
              <div className="flex flex-wrap items-center gap-3">
                <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0 border">
                  {o.gig?.images ? <img src={parseImages(o.gig.images)[0]} alt="" className="w-full h-full object-cover" loading="lazy" onError={e => e.target.style.display = 'none'} /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><Icon name="image" size={18} /></div>}
                </div>
                <div className="flex-1 min-w-0 sm:min-w-[180px]">
                  <Link to={`/gig/${o.gig?.slug}`} className="text-sm font-bold text-ink hover:text-[#0e76f1] line-clamp-1 dark:text-gray-100">{o.gig?.title || `Order #${o.id}`}</Link>
                  <div className="text-[12px] text-gray-500 mt-0.5 flex items-center gap-1.5 flex-wrap dark:text-gray-400">
                    <span className="font-semibold">{formatIDR(o.price)}</span> •
                    <span>Paket {o.package?.name}</span> •
                    <span className="flex items-center gap-1"><Avatar src={partner?.avatar} username={partner?.username} size={16} /> {partner?.username || '—'}</span>
                  </div>
                </div>
                <div className="w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:gap-1.5 -mt-1">
                  <StatusFlow current={o.status} cancelled={o.status === 'cancelled'} />
                  <span className="sm:hidden text-[10px] text-gray-400 shrink-0">{new Date(o.created_at).toLocaleDateString('id-ID')}</span>
                  <span className="hidden sm:block text-[10px] text-gray-400">{new Date(o.created_at).toLocaleString('id-ID')}</span>
                </div>
              </div>

              {o.note && (
                <div className="mt-3 text-[12px] text-gray-500 bg-gray-50 rounded-xl px-4 py-2.5 flex items-start gap-2 dark:bg-white/5 dark:text-gray-400">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mt-0.5 shrink-0">Brief:</span>
                  <span className="line-clamp-2">{o.note}</span>
                </div>
              )}

              {o.status !== 'cancelled' && (
                <div className="flex flex-wrap gap-2 mt-4 border-t pt-4">
                  <button onClick={() => setChatOpen(p => ({ ...p, [o.id]: !p[o.id] }))} className={`rounded-xl px-4 py-2 text-xs font-bold transition-colors flex items-center gap-1.5 ${chatOpen[o.id] ? 'bg-blue-50 text-[#0e76f1]' : 'border border-gray-200 text-gray-600 hover:border-[#0e76f1] hover:text-[#0e76f1]'}`}>
                    <Icon name="chat" size={14} /> {chatOpen[o.id] ? 'Tutup Chat' : 'Chat'}
                  </button>
                  {o.status === 'pending' && !isFreelancerView && <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 rounded-lg px-3 py-2">Menunggu freelancer menerima pesanan</span>}
                  {o.status === 'pending' && isFreelancerView && <button onClick={() => updateStatus(o.id, 'progress')} className="btn-primary !py-2 !px-4 !text-xs"><Icon name="check" size={14} strokeWidth={3} /> Terima & Kerjakan</button>}
                  {o.status === 'progress' && isFreelancerView && <button onClick={() => updateStatus(o.id, 'review')} className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl px-4 py-2 text-xs font-bold transition-colors"><Icon name="send" size={13} /> Kirim untuk Review</button>}
                  {o.status === 'review' && !isFreelancerView && <button onClick={() => updateStatus(o.id, 'completed')} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-2 text-xs font-bold transition-colors"><Icon name="verified" size={13} /> Setujui & Selesai</button>}
                  {o.status === 'progress' && !isFreelancerView && <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 rounded-lg px-3 py-2">Freelancer sedang mengerjakan ({o.package?.delivery_days} hari)</span>}
                  {['pending', 'progress', 'review'].includes(o.status) && <button onClick={() => updateStatus(o.id, 'cancelled')} className="border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200 rounded-xl px-4 py-2 text-xs font-bold transition-colors dark:border-white/10 dark:text-gray-400">Batalkan</button>}
                </div>
              )}

              {o.status === 'completed' && (
                <div className="mt-4 border-t pt-4">
                  {!isFreelancerView && !reviewed.includes(o.id) && (
                    reviewOpen[o.id] ? (
                      <ReviewForm order={o} onDone={(id) => { setReviewed(prev => [...prev, id]); setReviewOpen(p => ({ ...p, [id]: false })) }} />
                    ) : (
                      <button onClick={() => setReviewOpen(p => ({ ...p, [o.id]: true }))} className="flex items-center gap-2 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5 hover:bg-amber-100 transition-colors">
                        <Stars rating={0} size={14} /> Beri rating untuk freelancer ini
                      </button>
                    )
                  )}
                  {!isFreelancerView && reviewed.includes(o.id) && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
                      <Icon name="verified" size={15} /> Pesanan selesai. Terima kasih atas ulasanmu!
                    </div>
                  )}
                  {isFreelancerView && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
                      <Icon name="verified" size={15} /> Pesanan selesai dengan baik.
                    </div>
                  )}
                  <button onClick={() => setChatOpen(p => ({ ...p, [o.id]: !p[o.id] }))} className="mt-2 text-xs font-bold text-gray-500 hover:text-[#0e76f1] flex items-center gap-1.5 dark:text-gray-400">
                    <Icon name="chat" size={14} /> {chatOpen[o.id] ? 'Tutup Chat' : 'Lihat Chat'}
                  </button>
                </div>
              )}

              {o.status === 'cancelled' && (
                <div className="mt-4 border-t pt-4">
                  <button onClick={() => setChatOpen(p => ({ ...p, [o.id]: !p[o.id] }))} className="text-xs font-bold text-gray-500 hover:text-[#0e76f1] flex items-center gap-1.5 dark:text-gray-400">
                    <Icon name="chat" size={14} /> {chatOpen[o.id] ? 'Tutup Chat' : 'Lihat Chat'}
                  </button>
                </div>
              )}

              {chatOpen[o.id] && <ChatBox orderId={o.id} partner={partner} />}
            </div>
          )
        })}
      </div>
    </div>
  )
}