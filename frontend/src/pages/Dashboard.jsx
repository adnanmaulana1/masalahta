import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { showToast } from '../components/Toast'
import Icon from '../components/Icon'
import Avatar from '../components/Avatar'
import Stars from '../components/Stars'
import { formatIDR, orderStatus, parseImages } from '../utils/format'

const ACTIVE = ['pending', 'progress', 'review']
const ROLE_META = {
  freelancer: { label: 'Freelancer', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  client: { label: 'Client', cls: 'bg-blue-50 text-blue-700 ring-blue-200' },
  admin: { label: 'Admin', cls: 'bg-amber-50 text-amber-700 ring-amber-200' },
}

function compactRp(n) {
  if (!n) return 'Rp 0'
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1).replace('.', ',').replace(/,0$/, '')} jt`
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)} rb`
  return formatIDR(n)
}

export default function Dashboard() {
  const { user, updateUser } = useAuth()
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') || 'dashboard'
  const [gigs, setGigs] = useState([])
  const [orders, setOrders] = useState([])
  const [trend, setTrend] = useState([])
  const [fIn, setFIn] = useState('all')
  const [fMy, setFMy] = useState('all')
  const [avatar, setAvatar] = useState('')
  const [saving, setSaving] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editForm, setEditForm] = useState({ username: '', email: '', full_name: '', location: '', bio: '' })
  const [editSaving, setEditSaving] = useState(false)
  const fileRef = useRef(null)

  useEffect(() => {
    if (!user) return
    api.get('/my/gigs').then(r => setGigs(r.data.data || [])).catch(() => {})
    api.get('/orders').then(r => setOrders(r.data.data || [])).catch(() => {})
    api.get('/gigs?limit=6').then(r => setTrend(r.data.data || [])).catch(() => {})
  }, [user])

  if (!user) {
    return (
      <div className="max-w-[1240px] mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center mb-4 text-gray-400"><Icon name="user" size={28} /></div>
        <h1 className="font-extrabold text-ink text-lg">Silakan masuk untuk melihat dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Akses jasa, pesanan, dan profilmu</p>
        <div className="mt-5 flex justify-center gap-3">
          <Link to="/login" className="btn-primary">Masuk</Link>
          <Link to="/register" className="btn-outline">Daftar</Link>
        </div>
      </div>
    )
  }

  const role = user.role
  const rm = ROLE_META[role] || ROLE_META.client
  const isFL = role === 'freelancer'

  const myOrders = orders.filter(o => o.client_id === user.id)
  const incomingOrders = orders.filter(o => isFL && o.freelancer_id === user.id)
  const inActive = incomingOrders.filter(o => ACTIVE.includes(o.status))
  const inCompleted = incomingOrders.filter(o => o.status === 'completed')
  const myActive = myOrders.filter(o => ACTIVE.includes(o.status))
  const myCompleted = myOrders.filter(o => o.status === 'completed')
  const income = inCompleted.reduce((s, o) => s + (Number(o.price) || 0), 0)
  const spent = myCompleted.reduce((s, o) => s + (Number(o.price) || 0), 0)

  const greeting = (() => {
    if (role === 'admin') return 'Kontrol Platform'
    if (isFL) return 'Tingkatkan Cuanmu'
    return 'Kelola Pesananmu'
  })()

  const stats = isFL ? [
    { label: 'Pendapatan', value: compactRp(income), sub: 'dari order selesai', icon: 'wallet', c: 'from-emerald-500 to-green-600' },
    { label: 'Pesanan Masuk', value: inActive.length, sub: 'menunggu diproses', icon: 'box', c: 'from-blue-500 to-indigo-600' },
    { label: 'Jasa Aktif', value: gigs.length, sub: 'di marketplace', icon: 'briefcase', c: 'from-violet-500 to-purple-600' },
    { label: 'Rating', value: Number(user.rating || 0).toFixed(1), sub: 'dari client', icon: 'starFill', c: 'from-amber-500 to-orange-500' },
  ] : [
    { label: 'Pesanan Aktif', value: myActive.length, sub: 'sedang diproses', icon: 'box', c: 'from-blue-500 to-indigo-600' },
    { label: 'Project Selesai', value: myCompleted.length, sub: 'berhasil 100%', icon: 'verified', c: 'from-emerald-500 to-green-600' },
    { label: 'Total Belanja', value: compactRp(spent), sub: 'seluruh transaksi', icon: 'wallet', c: 'from-violet-500 to-purple-600' },
    { label: 'Rating', value: Number(user.rating || 0).toFixed(1), sub: 'kepuasan belanja', icon: 'starFill', c: 'from-amber-500 to-orange-500' },
  ]

  const tabs = [
    { v: 'dashboard', l: 'Ringkasan', icon: 'grid' },
    ...(isFL ? [{ v: 'gigs', l: 'Jasa Saya', icon: 'briefcase' }] : []),
    { v: 'orders', l: 'Pesanan', icon: 'box' },
    { v: 'profile', l: 'Profil', icon: 'user' },
  ]

  const updateStatus = async (id, status) => {
    await api.put(`/orders/${id}/status`, { status })
    api.get('/orders').then(r => setOrders(r.data.data || [])).catch(() => {})
  }

  const openEdit = () => {
    setEditForm({ username: user.username || '', email: user.email || '', full_name: user.full_name || '', location: user.location || '', bio: user.bio || '' })
    setEditOpen(true)
  }

  const saveEdit = async (e) => {
    e.preventDefault()
    setEditSaving(true)
    try {
      const res = await api.put('/auth/me', editForm)
      updateUser(res.data)
      showToast('Profil diperbarui')
      setEditOpen(false)
    } catch {
      showToast('Gagal memperbarui profil', 'error')
    } finally {
      setEditSaving(false)
    }
  }

  const onAvatarFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const S = 256
        const scale = Math.min(1, S / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d')
        if (!ctx) return showToast('Browser tidak mendukung', 'error')
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        saveAvatar(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.onerror = () => showToast('File gambar tidak valid', 'error')
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  }

  const saveAvatar = async (url) => {
    setAvatar(url)
    setSaving(true)
    try {
      const res = await api.put('/auth/me', { avatar: url })
      updateUser(res.data)
      showToast('Foto profil diperbarui')
    } catch {
      setAvatar('')
      showToast('Gagal memperbarui foto profil', 'error')
    } finally {
      setSaving(false)
    }
  }

  const renderSummaryList = (list) => (
    list.length === 0 ? <EmptyState icon="box" txt={isFL ? 'Belum ada pesanan masuk' : 'Belum ada pesanan'} />
      : (
        <div className="space-y-2.5">
          {list.slice(0, 5).map(o => {
            const st = orderStatus[o.status] || { label: o.status, cls: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' }
            return (
              <div key={o.id} className="flex items-center gap-3 p-3 rounded-xl border hover:border-blue-200 hover:bg-blue-50/40 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                  {o.gig ? <img src={parseImages(o.gig.images)[0]} alt="" className="w-full h-full object-cover" loading="lazy" onError={e => e.target.style.display = 'none'} /> : <Icon name="box" size={16} className="text-gray-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-ink truncate">{o.gig?.title || `Order #${o.id}`}</div>
                  <div className="text-[11px] text-gray-400">{formatIDR(o.price)} • {new Date(o.created_at).toLocaleDateString('id-ID')}</div>
                </div>
                <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ring-1 shrink-0 ${st.cls}`}><span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}></span>{st.label}</span>
              </div>
            )
          })}
        </div>
      )
  )

  const statusCount = {}
  orders.forEach(o => { statusCount[o.status] = (statusCount[o.status] || 0) + 1 })
  const statusMax = Math.max(1, ...Object.values(statusCount))

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-6">
      {/* profile banner */}
      <div className="relative rounded-3xl bg-white border border-gray-200/70 shadow-sm p-5 md:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <Avatar src={user.avatar} username={user.username} size={52} className="ring-2 ring-[#0487d9]/20 shrink-0" />
            <div className="min-w-0">
              <div className="text-[12px] font-semibold text-gray-400">Halo, 👋</div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold text-ink truncate">{user.full_name}</h1>
                <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ring-1 ${rm.cls}`}>{rm.label}</span>
              </div>
              <div className="text-[12px] text-gray-500">@{user.username}</div>
            </div>
          </div>
          <Link to="/explore" className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-[#0487d9] hover:bg-[#0370b8] text-white rounded-full px-5 py-2.5 text-sm font-bold shadow-md shadow-blue-500/25 transition-colors">
            {isFL ? 'Jelajahi Order' : 'Cari Jasa'} <Icon name="arrowRight" size={15} />
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-4 pt-3.5 border-t border-gray-100 text-[12px] text-gray-500">
          <span>{isFL ? 'Tingkatkan cuanmu' : `${myActive.length} pesanan sedang diproses`}</span>
          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
          <span className="flex items-center gap-1">Bergabung {user.created_at ? new Date(user.created_at).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) : '—'}</span>
          {isFL && user.completed_jobs > 0 && (
            <>
              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
              <span className="flex items-center gap-1 text-emerald-600 font-semibold"><Icon name="verified" size={13} /> {user.completed_jobs} project selesai</span>
            </>
          )}
        </div>
      </div>

      {/* stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mt-5">
        {stats.map((s, i) => (
          <div key={s.label} className="card p-3.5 sm:p-4 flex items-center gap-2.5 sm:gap-3 fade-up hover:-translate-y-0.5 hover:shadow-md transition-all min-w-0" style={{ animationDelay: `${i * 60}ms` }}>
            <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br ${s.c} text-white flex items-center justify-center shadow-md shrink-0`}>
              <Icon name={s.icon} size={18} fill={s.icon === 'starFill' ? 'currentColor' : 'none'} strokeWidth={s.icon === 'starFill' ? 0 : 2} />
            </div>
            <div className="min-w-0">
              <div className="font-extrabold text-[15px] sm:text-lg md:text-xl text-ink leading-none truncate">{s.value}</div>
              <div className="text-[11px] text-gray-500 mt-1 font-medium truncate">{s.label}</div>
              {s.sub && <div className="text-[10px] text-gray-400 truncate">{s.sub}</div>}
            </div>
          </div>
        ))}
      </div>

      {/* tabs */}
      <div className="mt-6 -mx-4 px-4 lg:mx-0 lg:px-0 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-1 w-fit bg-white border rounded-xl p-1.5 min-w-full sm:min-w-0">
          {tabs.map(t => (
            <button key={t.v} onClick={() => setParams({ tab: t.v })}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${tab === t.v ? 'bg-[#0e76f1] text-white shadow-md shadow-blue-500/25' : 'text-gray-600 hover:bg-gray-100'}`}>
              <Icon name={t.icon} size={15} /> {t.l}
            </button>
          ))}
        </div>
      </div>

      {/* TAB: dashboard ringkasan */}
      {tab === 'dashboard' && (
        <div className="grid lg:grid-cols-2 gap-4 mt-5">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-ink flex items-center gap-2"><Icon name="box" size={17} className="text-[#0e76f1]" /> Pesanan Terbaru</h3>
              <Link to="/orders" className="text-xs font-bold text-[#0e76f1] hover:underline">Lihat semua</Link>
            </div>
            {renderSummaryList(isFL ? incomingOrders.concat(myOrders) : myOrders)}
          </div>

          {isFL ? (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-ink flex items-center gap-2"><Icon name="briefcase" size={17} className="text-[#6a3cff]" /> Jasa Saya</h3>
                <Link to="/dashboard?tab=gigs" className="text-xs font-bold text-[#0e76f1] hover:underline">Kelola</Link>
              </div>
              {gigs.length === 0 ? <EmptyState icon="briefcase" txt="Kamu belum punya jasa" /> : (
                <div className="space-y-2.5">
                  {gigs.slice(0, 4).map(g => (
                    <div key={g.id} className="flex items-center gap-3 p-3 rounded-xl border hover:border-blue-200 hover:bg-blue-50/40 transition-colors">
                      <div className="w-14 h-10 rounded-lg overflow-hidden shrink-0 bg-gray-100"><img src={parseImages(g.images)[0]} alt="" className="w-full h-full object-cover" loading="lazy" onError={e => e.target.style.display = 'none'} /></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-ink truncate">{g.title}</div>
                        <div className="text-[11px] text-gray-400 flex items-center gap-2">⭐ {Number(g.rating).toFixed(1)} <span className="flex items-center gap-0.5"><Icon name="eye" size={11} /> {g.view_count}</span> <span className="font-bold text-[#0e76f1]">{formatIDR(g.packages?.[0]?.price)}</span></div>
                      </div>
                      <Link to={`/gig/${g.slug}`} className="text-xs font-bold text-[#0e76f1] shrink-0">Lihat</Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : role === 'admin' ? (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-ink flex items-center gap-2"><Icon name="trend" size={17} className="text-emerald-500" /> Status Pesanan</h3>
                <span className="text-xs font-bold text-gray-400">{orders.length} total</span>
              </div>
              <div className="space-y-3">
                {Object.keys(orderStatus).map(k => (statusCount[k] || 0) > 0 && (
                  <div key={k}>
                    <div className="flex items-center justify-between text-[12px] mb-1">
                      <span className="font-semibold text-gray-600">{orderStatus[k].label}</span>
                      <span className="font-bold text-ink">{statusCount[k]}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div className={`h-full rounded-full ${orderStatus[k].bar || 'bg-gray-300'}`} style={{ width: `${(statusCount[k] / statusMax) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && <EmptyState icon="box" txt="Belum ada data pesanan" />}
              </div>
            </div>
          ) : (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-ink flex items-center gap-2"><Icon name="sparkles" size={17} className="text-[#6a3cff]" /> Jasa Rekomendasi</h3>
                <Link to="/explore" className="text-xs font-bold text-[#0e76f1] hover:underline">Lihat semua</Link>
              </div>
              {trend.length === 0 ? <EmptyState icon="sparkles" txt="Belum ada jasa tersedia" /> : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {trend.slice(0, 6).map(g => (
                    <Link key={g.id} to={`/gig/${g.slug}`} className="flex items-center gap-3 p-3 rounded-xl border hover:border-blue-200 hover:bg-blue-50/40 transition-colors">
                      <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-100"><img src={parseImages(g.images)[0]} alt="" className="w-full h-full object-cover" loading="lazy" onError={e => e.target.style.display = 'none'} /></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-ink line-clamp-1">{g.title}</div>
                        <div className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                          <span className="text-amber-500 flex items-center gap-0.5"><Icon name="starFill" size={11} /></span>
                          <b className="text-gray-500">{Number(g.rating || 0).toFixed(1)}</b>
                          <span>•</span>
                          <span className="truncate">{g.category?.name || 'Jasa'}</span>
                        </div>
                      </div>
                      <span className="text-sm font-extrabold text-[#0e76f1] shrink-0">{formatIDR(g.packages?.[0]?.price)}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB: gigs */}
      {tab === 'gigs' && isFL && (
        <div className="card mt-5 overflow-hidden">
          <div className="p-5 border-b flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-ink">Jasa Saya ({gigs.length})</h3>
              <p className="text-xs text-gray-400 mt-0.5">Kelola jasa yang kamu pasang di marketplace</p>
            </div>
            <Link to="/create-gig" className="btn-primary !py-2.5 !px-4 !text-sm"><Icon name="plus" size={15} strokeWidth={3} /> Jasa Baru</Link>
          </div>
          {gigs.length === 0 ? (
            <div className="p-10 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center mb-4 text-gray-400"><Icon name="briefcase" size={28} /></div>
              <h4 className="font-bold text-ink">Belum ada jasa</h4>
              <p className="text-sm text-gray-500 mt-1">Mulai jual skillmu dan dapatkan order pertama</p>
              <Link to="/create-gig" className="btn-primary mt-5">Buat Jasa Pertama</Link>
            </div>
          ) : (
            <div className="divide-y">
              {gigs.map(g => (
                <div key={g.id} className="flex flex-wrap items-center gap-4 p-4 hover:bg-gray-50/60 transition-colors">
                  <img src={parseImages(g.images)[0]} alt="" className="w-20 h-14 rounded-lg object-cover border" loading="lazy" onError={e => e.target.style.display = 'none'} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-ink line-clamp-1">{g.title}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-2"><span className="tag !py-0.5 !px-2 !text-[10px]">{g.category?.icon} {g.category?.name}</span></div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Icon name="eye" size={13} /> {g.view_count}</span>
                    <span className="flex items-center gap-1">⭐ <b className="text-ink">{Number(g.rating).toFixed(1)}</b></span>
                    <span className="flex items-center gap-1"><Icon name="box" size={13} /> {g.review_count}</span>
                    <span className="font-bold text-[#0e76f1]">{formatIDR(g.packages?.[0]?.price)}</span>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/gig/${g.slug}`} className="text-xs font-bold text-[#0e76f1] border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50">Lihat</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Aktivitas terbaru */}
      {tab === 'dashboard' && orders.length > 0 && (
        <div className="card p-5 mt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-ink flex items-center gap-2"><Icon name="clock" size={17} className="text-[#0e76f1]" /> Aktivitas Terbaru</h3>
            <Link to="/dashboard?tab=orders" className="text-xs font-bold text-[#0e76f1] hover:underline">Semua pesanan</Link>
          </div>
          <div className="space-y-0">
            {[...orders]
              .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
              .slice(0, 6)
              .map((o, i) => {
                const st = orderStatus[o.status] || { label: o.status, cls: 'text-gray-500', dot: 'bg-gray-400' }
                return (
                  <div key={o.id} className="relative flex gap-3 pb-4 last:pb-0">
                    {i !== Math.min(5, orders.length - 1) && <span className="absolute left-[13px] top-7 bottom-0 w-px bg-gray-100"></span>}
                    <span className={`w-[26px] h-[26px] rounded-full mt-0.5 shrink-0 ${st.dot} ring-4 ring-white flex items-center justify-center`}></span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-ink line-clamp-1">
                        <span className={i === 0 ? '' : 'text-gray-500 font-medium'}>{o.gig?.title || `Order #${o.id}`}</span>
                      </div>
                      <div className="text-[11px] text-gray-400 flex items-center gap-1.5 flex-wrap">
                        <span className={`font-bold ${st.cls}`}>{st.label}</span> •
                        <span>{formatIDR(o.price)}</span> •
                        <span>{new Date(o.updated_at || o.created_at).toLocaleDateString('id-ID')}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {/* TAB: orders — outgoing/incoming */}
      {tab === 'orders' && (
        <div className="mt-5 space-y-5">
          {isFL && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-ink flex items-center gap-2"><Icon name="trend" size={18} className="text-emerald-500" /> Pesanan Masuk <span className="text-xs font-bold text-gray-400">({incomingOrders.length})</span></h3>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 rounded-full px-3 py-1">{formatIDR(income)} terkumpul</span>
              </div>
              <StatusFilter list={incomingOrders} value={fIn} onChange={setFIn} />
              <OrderList orders={incomingOrders.filter(o => fIn === 'all' || o.status === fIn)} canAct onStatus={updateStatus} />
            </div>
          )}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-ink flex items-center gap-2"><Icon name="box" size={18} className="text-[#0e76f1]" /> {isFL ? 'Pesanan Saya (dipesan)' : 'Pesanan Saya'} <span className="text-xs font-bold text-gray-400">({myOrders.length})</span></h3>
              <span className="text-[11px] font-bold text-violet-600 bg-violet-50 rounded-full px-3 py-1">{compactRp(spent)} total</span>
            </div>
            <StatusFilter list={myOrders} value={fMy} onChange={setFMy} />
            <OrderList orders={myOrders.filter(o => fMy === 'all' || o.status === fMy)} canAct={false} onStatus={updateStatus} />
          </div>
        </div>
      )}

      {/* TAB: profile */}
      {tab === 'profile' && (
        <div className="mt-5 max-w-3xl space-y-5">
          <div className="card overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-5">
                <div className="relative shrink-0">
                  <Avatar src={avatar || user.avatar} username={user.username} size={88} className="ring-4 ring-blue-100 shadow-md" />
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onAvatarFile} />
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={saving}
                    className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-600 hover:text-[#0e76f1] hover:border-blue-200 transition-colors"
                    title="Ganti foto profil"
                  >
                    <Icon name={saving ? 'clock' : 'edit'} size={15} />
                  </button>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl sm:text-2xl font-extrabold text-ink flex items-center gap-1.5">
                      {user.full_name}
                      <Icon name="verified" size={18} className="text-[#0e76f1]" />
                    </h3>
                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ring-1 ${rm.cls}`}>{rm.label}</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-0.5">@{user.username} • {user.email}</div>
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={saving}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#0e76f1] bg-blue-50 border border-blue-100 hover:bg-blue-100 rounded-full px-3 py-1.5 transition-colors"
                  >
                    <Icon name={saving ? 'clock' : 'edit'} size={13} /> {saving ? 'Menyimpan...' : 'Ganti Foto'}
                  </button>
                  <button
                    onClick={openEdit}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-full px-3 py-1.5 transition-colors"
                  >
                    <Icon name="edit" size={13} /> Edit Profil
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 mt-6 pt-5 border-t border-gray-100">
                <div className="flex items-center gap-3 py-3 sm:py-0 sm:px-4 sm:first:pl-0">
                  <span className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0"><Icon name="starFill" size={18} fill="currentColor" strokeWidth={0} /></span>
                  <div><div className="text-lg font-extrabold text-ink leading-none">{Number(user.rating || 0).toFixed(1)}</div>
                    <div className="text-[11px] text-gray-400 mt-1">Rating</div></div>
                </div>
                <div className="flex items-center gap-3 py-3 sm:py-0 sm:px-4">
                  <span className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0"><Icon name="verified" size={18} /></span>
                  <div><div className="text-lg font-extrabold text-ink leading-none">{user.completed_jobs || 0}</div>
                    <div className="text-[11px] text-gray-400 mt-1">Project Selesai</div></div>
                </div>
                <div className="flex items-center gap-3 py-3 sm:py-0 sm:px-4 sm:pr-0">
                  <span className="w-10 h-10 rounded-xl bg-blue-50 text-[#0e76f1] flex items-center justify-center shrink-0"><Icon name="calendar" size={18} /></span>
                  <div><div className="text-lg font-extrabold text-ink leading-none">{user.created_at ? new Date(user.created_at).getFullYear() : '—'}</div>
                    <div className="text-[11px] text-gray-400 mt-1">Member Sejak</div></div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-5 text-[12.5px] text-gray-500">
                <span className="flex items-center gap-1.5"><Icon name="mapPin" size={14} className="text-[#0e76f1]" /> {user.location || 'Indonesia'}</span>
                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                <span className="flex items-center gap-1.5 text-emerald-600 font-semibold"><Icon name="shield" size={14} /> Akun Terverifikasi</span>
              </div>

              <div className="mt-5 pt-5 border-t border-gray-100">
                <h4 className="font-extrabold text-ink flex items-center gap-2 mb-2">
                  <span className="w-8 h-8 rounded-lg bg-blue-50 text-[#0e76f1] flex items-center justify-center"><Icon name="user" size={15} /></span>
                  Tentang Saya
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">{user.bio || 'Belum ada bio. Klik Edit Profil untuk menambahkan cerita singkat tentangmu.'}</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="card p-6">
              <h4 className="font-extrabold text-ink flex items-center gap-2 mb-4">
                <span className="w-9 h-9 rounded-xl bg-blue-50 text-[#0e76f1] flex items-center justify-center"><Icon name="user" size={17} /></span>
                Informasi Lain
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoTile label="Nama Lengkap" value={user.full_name} icon="user" />
                <InfoTile label="Username" value={`@${user.username}`} icon="at-sign" />
                <InfoTile label="Email" value={user.email} icon="mail" />
                <InfoTile label="Lokasi" value={user.location || 'Indonesia'} icon="mapPin" />
                <InfoTile label="Role" value={user.role} icon="shield" chip />
                <InfoTile label="Member Sejak" value={user.created_at ? new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'} icon="calendar" />
              </div>
            </div>
            <div className="card p-6 h-fit">
              <h4 className="font-extrabold text-ink flex items-center gap-2 mb-4">
                <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><Icon name="trend" size={17} /></span>
                Ringkasan Aktivitas
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <MiniStat icon="box" label="Total Pesanan" value={orders.length} c="bg-blue-50 text-blue-600" />
                {isFL ? (
                  <>
                    <MiniStat icon="wallet" label="Pendapatan" value={compactRp(income)} c="bg-emerald-50 text-emerald-600" />
                    <MiniStat icon="starFill" label="Rating" value={Number(user.rating || 0).toFixed(1)} c="bg-amber-50 text-amber-500" fill />
                  </>
                ) : (
                  <>
                    <MiniStat icon="wallet" label="Total Belanja" value={compactRp(spent)} c="bg-violet-50 text-violet-600" />
                    <MiniStat icon="verified" label="Project Selesai" value={myCompleted.length} c="bg-emerald-50 text-emerald-600" />
                  </>
                )}
                <MiniStat icon="briefcase" label="Jasa Aktif" value={gigs.length} c="bg-sky-50 text-sky-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* edit profile modal */}
      {editOpen && (
        <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40 slide-in-left-face" onClick={() => setEditOpen(false)}></div>
          <form onSubmit={saveEdit} className="relative w-full sm:max-w-md bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl slide-down p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-extrabold text-ink flex items-center gap-2"><Icon name="edit" size={18} className="text-[#0e76f1]" /> Edit Profil</h3>
              <button type="button" onClick={() => setEditOpen(false)} className="p-2 rounded-full hover:bg-gray-100 text-gray-500"><Icon name="x" size={18} /></button>
            </div>
            <div className="flex items-center gap-3 mb-5">
              <Avatar src={avatar || user.avatar} username={user.username} size={48} className="ring-2 ring-blue-100" />
              <div>
                <div className="font-bold text-ink">{user.full_name}</div>
                <div className="text-xs text-gray-400">@{user.username}</div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 block">Username</label>
                  <input value={editForm.username} onChange={e => setEditForm({ ...editForm, username: e.target.value.trim() })} className="input-field" required />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 block">Email</label>
                  <input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value.trim() })} className="input-field" required />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 block">Nama Lengkap</label>
                <input value={editForm.full_name} onChange={e => setEditForm({ ...editForm, full_name: e.target.value })} className="input-field" required />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 block">Lokasi</label>
                <input value={editForm.location} onChange={e => setEditForm({ ...editForm, location: e.target.value })} placeholder="Contoh: Jakarta, Surabaya" className="input-field" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 block">Bio</label>
                <textarea value={editForm.bio} onChange={e => setEditForm({ ...editForm, bio: e.target.value })} placeholder="Ceritakan singkat tentang kamu / keahlianmu" className="input-field h-24 resize-none" maxLength={300} />
                <p className="text-[11px] text-gray-400 mt-1 text-right">{editForm.bio.length}/300</p>
              </div>
            </div>
            <button className="mt-5 w-full btn-primary !py-3" disabled={editSaving}>
              {editSaving ? <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span> : 'Simpan Perubahan'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

function InfoTile({ label, value, icon, chip, c = 'bg-blue-50 text-[#0e76f1]' }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all">
      <div className={`w-9 h-9 rounded-lg ${c} shrink-0 flex items-center justify-center`}><Icon name={icon} size={16} /></div>
      <div className="min-w-0">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{label}</div>
        {chip
          ? <span className="text-sm font-bold text-gray-700 bg-gray-100 rounded-md px-2 py-0.5 uppercase inline-block">{value}</span>
          : <div className="text-sm font-semibold text-ink truncate">{value}</div>}
      </div>
    </div>
  )
}

function MiniStat({ icon, label, value, fill, c = 'bg-blue-50 text-blue-600' }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100">
      <div className={`w-10 h-10 rounded-xl ${c} flex items-center justify-center shrink-0`}>
        <Icon name={icon} size={18} fill={fill ? '#0e76f1' : 'none'} strokeWidth={fill ? 0 : 2} />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{label}</div>
        <div className="text-base font-extrabold text-ink leading-tight">{value}</div>
      </div>
    </div>
  )
}

function EmptyState({ icon, txt }) {
  return (
    <div className="text-center py-8">
      <div className="w-12 h-12 mx-auto rounded-xl bg-gray-100 flex items-center justify-center mb-3 text-gray-400"><Icon name={icon} size={22} /></div>
      <p className="text-sm text-gray-400">{txt}</p>
    </div>
  )
}

function StatusFilter({ list, value, onChange }) {
  const counts = { all: list.length }
  list.forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1 })
  const opts = [['all', 'Semua'], ...Object.keys(orderStatus).map(k => [k, orderStatus[k].label])]
  return (
    <div className="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-5 px-5 mb-4 pb-0.5">
      {opts.map(([k, l]) => counts[k] > 0 && (
        <button key={k} onClick={() => onChange(k)}
                className={`tag shrink-0 !text-[11px] !py-1 transition-colors ${value === k ? '!bg-[#0e76f1] !text-white !border-[#0e76f1]' : 'hover:!bg-gray-50'}`}>
          {l} <span className="opacity-70">{counts[k]}</span>
        </button>
      ))}
    </div>
  )
}

function OrderList({ orders, canAct, onStatus }) {
  if (orders.length === 0) return <EmptyState icon="box" txt="Belum ada pesanan" />
  return (
    <div className="space-y-3">
      {orders.map(o => {
        const st = orderStatus[o.status] || { label: o.status, cls: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' }
        return (
          <div key={o.id} className="border rounded-xl p-4 hover:shadow-sm transition-shadow">
            <div className="flex flex-wrap items-center gap-3">
              <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0 bg-gray-100 flex items-center justify-center">
                {o.gig ? <img src={parseImages(o.gig.images)[0]} alt="" className="w-full h-full object-cover" loading="lazy" onError={e => e.target.style.display = 'none'} /> : <Icon name="box" size={18} className="text-gray-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-ink line-clamp-1">{o.gig?.title || `Order #${o.id}`}</div>
                <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-gray-400 mt-1">
                  <span>Paket {o.package?.name}</span>•
                  <span>{formatIDR(o.price)}</span>•
                  <span>{new Date(o.created_at).toLocaleDateString('id-ID')}</span>
                </div>
              </div>
              <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ring-1 shrink-0 ${st.cls}`}><span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}></span>{st.label}</span>
            </div>
            {o.note && <div className="mt-2.5 text-[12px] text-gray-500 bg-gray-50 rounded-lg px-3 py-2 line-clamp-2">📝 {o.note}</div>}
            {canAct && (
              <div className="flex flex-wrap gap-2 mt-3">
                {o.status === 'pending' && <button onClick={() => onStatus(o.id, 'progress')} className="btn-primary !py-2 !px-4 !text-xs">Terima Order</button>}
                {o.status === 'progress' && <button onClick={() => onStatus(o.id, 'review')} className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl px-4 py-2 text-xs font-bold transition-colors">Kirim ke Review</button>}
                {o.status === 'review' && <button onClick={() => onStatus(o.id, 'completed')} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-2 text-xs font-bold transition-colors">Setujui & Selesai</button>}
                {ACTIVE.includes(o.status) && <button onClick={() => onStatus(o.id, 'cancelled')} className="border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200 rounded-xl px-4 py-2 text-xs font-bold transition-colors">Batal</button>}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}