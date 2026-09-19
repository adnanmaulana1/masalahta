import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { showToast } from '../components/Toast'
import Icon from '../components/Icon'
import Avatar from '../components/Avatar'
import AvatarCropper from '../components/AvatarCropper'
import GigCard from '../components/GigCard'
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
  const { user, updateUser, loading } = useAuth()
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') || 'dashboard'
  const [gigs, setGigs] = useState([])
  const [orders, setOrders] = useState([])
  const [trend, setTrend] = useState([])
  const [favs, setFavs] = useState([])
  const [fIn, setFIn] = useState('all')
  const [fMy, setFMy] = useState('all')
  const [avatar, setAvatar] = useState('')
  const [cropSrc, setCropSrc] = useState('')
  const [saving, setSaving] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editForm, setEditForm] = useState({ username: '', email: '', full_name: '', location: '', bio: '', phone: '', skills: '', website: '' })
  const [editSaving, setEditSaving] = useState(false)
  const fileRef = useRef(null)

  useEffect(() => {
    if (!user) return
    api.get('/my/gigs').then(r => setGigs(r.data.data || [])).catch(() => {})
    api.get('/orders').then(r => setOrders(r.data.data || [])).catch(() => {})
    api.get('/gigs?limit=6').then(r => setTrend(r.data.data || [])).catch(() => {})
  }, [user])

  useEffect(() => {
    if (!user || tab !== 'favorit') return
    api.get('/wishlist').then(r => setFavs(r.data.data || [])).catch(() => {})
  }, [user, tab])

  useEffect(() => {
    if (!editOpen) return
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => { if (e.key === 'Escape') setEditOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', onKey) }
  }, [editOpen])

  if (loading) {
    return <div className="max-w-[1180px] mx-auto px-4 py-6 space-y-4"><div className="skeleton h-32 rounded-3xl" /><div className="grid grid-cols-2 md:grid-cols-4 gap-3">{[0,1,2,3].map(i=><div key={i} className="skeleton h-24 rounded-2xl" />)}</div></div>
  }
  if (!user) {
    return (
      <div className="max-w-[1240px] mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center mb-4 text-gray-400"><Icon name="user" size={28} /></div>
        <h1 className="font-extrabold text-ink text-lg dark:text-gray-100">Silakan masuk untuk melihat dashboard</h1>
        <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">Akses jasa, pesanan, dan profilmu</p>
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
    ...(!isFL && role !== 'admin' ? [{ v: 'rekomendasi', l: 'Rekomendasi', icon: 'sparkles' }] : []),
    ...(!isFL && role !== 'admin' ? [{ v: 'favorit', l: 'Favorit', icon: 'heart' }] : []),
  ]

  const updateStatus = async (id, status) => {
    await api.put(`/orders/${id}/status`, { status })
    api.get('/orders').then(r => setOrders(r.data.data || [])).catch(() => {})
  }

  const openEdit = () => {
    setEditForm({ username: user.username || '', email: user.email || '', full_name: user.full_name || '', location: user.location || '', bio: user.bio || '', phone: user.phone || '', skills: user.skills || '', website: user.website || '' })
    setEditOpen(true)
  }

  const saveEdit = async (e) => {
    e.preventDefault()
    const payload = {
      ...editForm,
      username: editForm.username.trim(),
      email: editForm.email.trim(),
      full_name: editForm.full_name.trim(),
      location: editForm.location.trim(),
      bio: editForm.bio.trim(),
      phone: editForm.phone.trim(),
      skills: editForm.skills.trim(),
      website: editForm.website.trim(),
    }
    if (!payload.username || !payload.email || !payload.full_name) {
      showToast('Nama, username, dan email wajib diisi', 'error')
      return
    }
    if (isFL && (!payload.bio || !payload.skills)) {
      showToast('Freelancer wajib mengisi bio dan keahlian', 'error')
      return
    }
    setEditSaving(true)
    try {
      const res = await api.put('/auth/me', payload)
      updateUser(res.data)
      showToast('Profil diperbarui')
      setEditOpen(false)
    } catch (error) {
      showToast(error.response?.data?.error || 'Gagal memperbarui profil', 'error')
    } finally {
      setEditSaving(false)
    }
  }

  const onAvatarFile = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) { showToast('File harus gambar', 'error'); return }
    if (file.size > 5 * 1024 * 1024) { showToast('Ukuran maksimal 5MB', 'error'); return }
    const reader = new FileReader()
    reader.onload = () => setCropSrc(reader.result)
    reader.onerror = () => showToast('Gagal membaca file', 'error')
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
                  <div className="text-sm font-semibold text-ink truncate dark:text-gray-100">{o.gig?.title || `Order #${o.id}`}</div>
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
    <div className="max-w-[1180px] mx-auto px-4 py-5 sm:py-7">
      {/* profile banner */}
      <section className="rounded-[28px] border border-black/[0.06] dark:border-white/[0.06] bg-white p-5 sm:p-6 shadow-sm overflow-hidden dark:bg-slate-900">
        <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-4 sm:gap-5">
          <div className="relative shrink-0">
            <div className="rounded-full p-[3px] bg-gradient-to-br from-[#0e76f1] to-[#6a3cff] shadow-lg shadow-blue-500/15">
              <Avatar src={avatar || user.avatar} username={user.username} size={96} className="ring-[3px] ring-white !w-[88px] !h-[88px] sm:!w-[96px] sm:!h-[96px]" />
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onAvatarFile} />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={saving}
              className="absolute bottom-0.5 -right-0.5 w-8 h-8 rounded-full bg-[#0e76f1] border-[3px] border-white shadow-md flex items-center justify-center text-white hover:bg-[#0b5fd0] active:scale-95 transition-all"
              title="Ganti foto profil"
            >
              <Icon name={saving ? 'clock' : 'edit'} size={14} />
            </button>
          </div>
          <div className="flex-1 min-w-0 w-full">
            <div className="flex flex-col items-center sm:items-start gap-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-[20px] font-extrabold text-ink tracking-tight leading-none sm:text-2xl dark:text-gray-100">{user.full_name}</h1>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ${rm.cls}`}>{rm.label}</span>
              </div>
              <p className="text-[13px] text-gray-400 font-medium">@{user.username}</p>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              {user.location && <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 border border-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 dark:bg-white/5 dark:border-white/10 dark:text-gray-400"><Icon name="mapPin" size={13} className="text-gray-400" /> {user.location}</span>}
              {user.website && <a href={user.website.startsWith('http') ? user.website : `https://${user.website}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-100 px-3 py-1.5 text-xs font-semibold text-[#0e76f1] hover:bg-blue-100 transition-colors"><Icon name="send" size={12} /> {user.website.replace(/^https?:\/\//, '')}</a>}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 border border-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 dark:bg-white/5 dark:border-white/10 dark:text-gray-400"><Icon name="calendar" size={13} className="text-gray-400" /> Sejak {user.created_at ? new Date(user.created_at).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) : '—'}</span>
            </div>
            {user.bio && <p className="mt-3 text-[13px] leading-relaxed text-gray-600 line-clamp-3 max-w-xl mx-auto sm:mx-0 dark:text-gray-400">{user.bio}</p>}
            {user.skills && (
              <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-1.5">
                {user.skills.split(',').map(s => s.trim()).filter(Boolean).slice(0, 6).map(s => (
                  <span key={s} className="text-[11px] font-bold bg-[#f0f6ff] text-[#0e76f1] border border-blue-100 rounded-full px-3 py-1">{s}</span>
                ))}
              </div>
            )}
            <div className="mt-4 flex gap-2 w-full sm:w-auto">
              <button onClick={openEdit} className="btn-outline flex-1 sm:flex-none !rounded-xl !px-5 !py-3 !text-[13px] font-bold">Edit Profil</button>
              <Link to={isFL ? '/create-gig' : '/explore'} className="btn-primary flex-1 sm:flex-none !rounded-xl !px-5 !py-3 !text-[13px] font-bold justify-center">
                <Icon name={isFL ? 'plus' : 'search'} size={14} /> {isFL ? 'Buat Jasa' : 'Cari Jasa'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* stats — selalu tampil */}
      <div className="grid grid-cols-2 gap-3 mt-4 md:grid-cols-4">
        {stats.map((s, i) => (
          <div key={s.label} className="group relative min-w-0 overflow-hidden rounded-2xl border border-black/[0.06] dark:border-white/[0.06] bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg fade-up sm:p-5 dark:bg-slate-900" style={{ animationDelay: `${i * 60}ms` }}>
            <div className={`absolute -right-7 -top-7 h-20 w-20 rounded-full bg-gradient-to-br ${s.c} opacity-[.08] transition-transform group-hover:scale-125`} />
            <div className="flex items-start justify-between gap-2">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.c} text-white flex items-center justify-center shadow-md shrink-0`}>
                <Icon name={s.icon} size={18} fill={s.icon === 'starFill' ? 'currentColor' : 'none'} strokeWidth={s.icon === 'starFill' ? 0 : 2} />
              </div>
              <Icon name="trend" size={15} className="text-gray-300 transition-colors group-hover:text-[#0e76f1]" />
            </div>
            <div className="relative mt-4 min-w-0">
              <div className="truncate text-xl font-extrabold leading-none text-ink sm:text-2xl dark:text-gray-100">{s.value}</div>
              <div className="mt-2 truncate text-xs font-bold text-gray-600 dark:text-gray-400">{s.label}</div>
              {s.sub && <div className="mt-0.5 truncate text-[10px] text-gray-400">{s.sub}</div>}
            </div>
          </div>
        ))}
      </div>

      {/* tabs */}
      <div className="mt-6 -mx-4 px-4 lg:mx-0 lg:px-0 overflow-x-auto no-scrollbar">
        <div className="flex w-fit min-w-full items-center gap-1 rounded-2xl border border-black/[0.06] dark:border-white/[0.06] bg-white p-1.5 shadow-sm sm:min-w-0 dark:bg-slate-900">
          {tabs.map(t => (
            <button key={t.v} onClick={() => setParams({ tab: t.v })}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${tab === t.v ? 'bg-[#101c3a] text-white shadow-md shadow-slate-900/15' : 'text-gray-500 hover:bg-gray-50 hover:text-ink'}`}>
              <Icon name={t.icon} size={15} /> {t.l}
            </button>
          ))}
        </div>
      </div>

      {/* TAB: dashboard ringkasan */}
      {tab === 'dashboard' && (
        <div className={`gap-4 mt-5 ${(isFL || role === 'admin') ? 'grid lg:grid-cols-[1.1fr_.9fr]' : ''}`}>
          <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.06] bg-white p-5 shadow-sm sm:p-6 dark:bg-slate-900">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-ink flex items-center gap-2 dark:text-gray-100"><span className="w-9 h-9 rounded-xl bg-blue-50 text-[#0e76f1] flex items-center justify-center"><Icon name="box" size={17} /></span> Pesanan Terbaru</h3>
              <Link to="/orders" className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1.5 text-[11px] font-bold text-[#0e76f1] hover:bg-blue-100">Lihat semua <Icon name="arrowRight" size={12} /></Link>
            </div>
            {renderSummaryList(isFL ? incomingOrders.concat(myOrders) : myOrders)}
          </div>

          {isFL ? (
            <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.06] bg-white p-5 shadow-sm sm:p-6 dark:bg-slate-900">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-ink flex items-center gap-2 dark:text-gray-100"><Icon name="briefcase" size={17} className="text-[#6a3cff]" /> Jasa Saya</h3>
                <Link to="/dashboard?tab=gigs" className="text-xs font-bold text-[#0e76f1] hover:underline">Kelola</Link>
              </div>
              {gigs.length === 0 ? <EmptyState icon="briefcase" txt="Kamu belum punya jasa" /> : (
                <div className="space-y-2.5">
                  {gigs.slice(0, 4).map(g => (
                    <div key={g.id} className="flex items-center gap-3 p-3 rounded-xl border hover:border-blue-200 hover:bg-blue-50/40 transition-colors">
                      <div className="w-14 h-10 rounded-lg overflow-hidden shrink-0 bg-gray-100"><img src={parseImages(g.images)[0]} alt="" className="w-full h-full object-cover" loading="lazy" onError={e => e.target.style.display = 'none'} /></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-ink truncate dark:text-gray-100">{g.title}</div>
                        <div className="text-[11px] text-gray-400 flex items-center gap-2">⭐ {Number(g.rating).toFixed(1)} <span className="flex items-center gap-0.5"><Icon name="eye" size={11} /> {g.view_count}</span> <span className="font-bold text-[#0e76f1]">{formatIDR(g.packages?.[0]?.price)}</span></div>
                      </div>
                      <Link to={`/gig/${g.slug}`} className="text-xs font-bold text-[#0e76f1] shrink-0">Lihat</Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : role === 'admin' ? (
            <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.06] bg-white p-5 shadow-sm sm:p-6 dark:bg-slate-900">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-ink flex items-center gap-2 dark:text-gray-100"><Icon name="trend" size={17} className="text-emerald-500" /> Status Pesanan</h3>
                <span className="text-xs font-bold text-gray-400">{orders.length} total</span>
              </div>
              <div className="space-y-3">
                {Object.keys(orderStatus).map(k => (statusCount[k] || 0) > 0 && (
                  <div key={k}>
                    <div className="flex items-center justify-between text-[12px] mb-1">
                      <span className="font-semibold text-gray-600 dark:text-gray-400">{orderStatus[k].label}</span>
                      <span className="font-bold text-ink dark:text-gray-100">{statusCount[k]}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div className={`h-full rounded-full ${orderStatus[k].bar || 'bg-gray-300'}`} style={{ width: `${(statusCount[k] / statusMax) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && <EmptyState icon="box" txt="Belum ada data pesanan" />}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* TAB: rekomendasi (khusus client) */}
      {tab === 'rekomendasi' && !isFL && role !== 'admin' && (
        <section className="rounded-2xl border border-black/[0.06] dark:border-white/[0.06] bg-white p-5 shadow-sm sm:p-6 mt-4 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-ink flex items-center gap-2 dark:text-gray-100"><span className="w-9 h-9 rounded-xl bg-violet-50 text-[#6a3cff] flex items-center justify-center"><Icon name="sparkles" size={17} /></span> Jasa Rekomendasi</h3>
            <Link to="/explore" className="text-xs font-bold text-[#0e76f1] hover:underline">Lihat semua</Link>
          </div>
          {trend.length === 0 ? <EmptyState icon="sparkles" txt="Belum ada jasa tersedia" /> : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {trend.slice(0, 6).map((g, i) => (
                <Link key={g.id} to={`/gig/${g.slug}`} className="group relative rounded-2xl border border-black/[0.06] dark:border-white/[0.06] overflow-hidden bg-white hover:border-blue-200 dark:hover:border-blue-500/30 hover:shadow-[0_16px_40px_-16px_rgba(14,118,241,0.35)] hover:-translate-y-1 transition-all duration-300 dark:bg-slate-900">
                  <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
                    <img src={parseImages(g.images)[0]} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" onError={e => e.target.style.display = 'none'} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent"></div>
                    <span className="absolute top-2.5 left-2.5 rounded-full bg-white/95 dark:bg-black/50 dark:backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-gray-700 dark:text-white/90">#{i + 1} {g.category?.name || 'Jasa'}</span>
                    <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 rounded-full bg-black/45 backdrop-blur px-2.5 py-1 text-[11px] font-bold text-white"><Icon name="starFill" size={11} className="text-amber-400" /> {Number(g.rating || 0).toFixed(1)}</span>
                  </div>
                  <div className="p-4">
                    <div className="text-sm font-bold text-ink line-clamp-2 leading-snug min-h-[40px] group-hover:text-[#0e76f1] transition-colors dark:text-gray-100">{g.title}</div>
                    <div className="mt-3 pt-3 border-t flex items-center justify-between">
                      <span className="text-[11px] text-gray-400 font-medium">Mulai dari</span>
                      <span className="text-[15px] font-extrabold text-[#0e76f1]">{formatIDR(g.packages?.[0]?.price)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {/* TAB: favorit (khusus client) */}
      {tab === 'favorit' && !isFL && role !== 'admin' && (
        <section className="rounded-2xl border border-black/[0.06] dark:border-white/[0.06] bg-white p-5 shadow-sm sm:p-6 mt-4 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-ink flex items-center gap-2 dark:text-gray-100"><span className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center"><Icon name="heart" size={17} /></span> Jasa Favorit <span className="text-xs font-bold text-gray-400">({favs.length})</span></h3>
            <Link to="/explore" className="text-xs font-bold text-[#0e76f1] hover:underline">Cari jasa</Link>
          </div>
          {favs.length === 0 ? <EmptyState icon="heart" txt="Belum ada favorit. Ketuk ikon hati di jasa yang kamu suka." /> : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {favs.map((g, i) => <GigCard key={g.id} gig={g} index={i} />)}
            </div>
          )}
        </section>
      )}

      {/* TAB: gigs */}
      {tab === 'gigs' && isFL && (
        <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.06] bg-white shadow-sm mt-5 overflow-hidden dark:bg-slate-900">
          <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between gap-3 dark:border-white/10">
            <h3 className="font-extrabold text-ink flex items-center gap-2 dark:text-gray-100"><span className="w-9 h-9 rounded-xl bg-violet-50 text-[#6a3cff] flex items-center justify-center"><Icon name="briefcase" size={17} /></span> Jasa Saya <span className="text-xs font-bold text-gray-400">({gigs.length})</span></h3>
            <Link to="/create-gig" className="btn-primary !py-2.5 !px-4 !text-sm"><Icon name="plus" size={15} strokeWidth={3} /> Jasa Baru</Link>
          </div>
          {gigs.length === 0 ? (
            <div className="p-10 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center mb-4 text-gray-400"><Icon name="briefcase" size={28} /></div>
              <h4 className="font-bold text-ink dark:text-gray-100">Belum ada jasa</h4>
              <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">Mulai jual skillmu dan dapatkan order pertama</p>
              <Link to="/create-gig" className="btn-primary mt-5">Buat Jasa Pertama</Link>
            </div>
          ) : (
            <div className="divide-y">
              {gigs.map(g => (
                <div key={g.id} className="flex flex-wrap items-center gap-4 p-4 hover:bg-gray-50/60 transition-colors">
                  <img src={parseImages(g.images)[0]} alt="" className="w-20 h-14 rounded-lg object-cover border" loading="lazy" onError={e => e.target.style.display = 'none'} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-ink line-clamp-1 dark:text-gray-100">{g.title}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-2"><span className="tag !py-0.5 !px-2 !text-[10px]">{g.category?.icon} {g.category?.name}</span></div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1"><Icon name="eye" size={13} /> {g.view_count}</span>
                    <span className="flex items-center gap-1">⭐ <b className="text-ink dark:text-gray-100">{Number(g.rating).toFixed(1)}</b></span>
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
        <div className="mt-4 rounded-2xl border border-black/[0.06] dark:border-white/[0.06] bg-white p-5 shadow-sm sm:p-6 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-ink flex items-center gap-2 dark:text-gray-100"><span className="w-9 h-9 rounded-xl bg-blue-50 text-[#0e76f1] flex items-center justify-center"><Icon name="clock" size={17} /></span> Aktivitas Terbaru</h3>
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
                      <div className="text-sm font-semibold text-ink line-clamp-1 dark:text-gray-100">
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
            <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.06] bg-white p-5 shadow-sm sm:p-6 dark:bg-slate-900">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-ink flex items-center gap-2 dark:text-gray-100"><span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center"><Icon name="trend" size={17} /></span> Pesanan Masuk <span className="text-xs font-bold text-gray-400">({incomingOrders.length})</span></h3>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 rounded-full px-3 py-1">{formatIDR(income)} terkumpul</span>
              </div>
              <StatusFilter list={incomingOrders} value={fIn} onChange={setFIn} />
              <OrderList orders={incomingOrders.filter(o => fIn === 'all' || o.status === fIn)} canAct onStatus={updateStatus} />
            </div>
          )}
          <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.06] bg-white p-5 shadow-sm sm:p-6 dark:bg-slate-900">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-ink flex items-center gap-2 dark:text-gray-100"><span className="w-9 h-9 rounded-xl bg-blue-50 text-[#0e76f1] flex items-center justify-center"><Icon name="box" size={17} /></span> {isFL ? 'Pesanan Saya (dipesan)' : 'Pesanan Saya'} <span className="text-xs font-bold text-gray-400">({myOrders.length})</span></h3>
              <span className="text-[11px] font-bold text-violet-600 bg-violet-50 rounded-full px-3 py-1">{compactRp(spent)} total</span>
            </div>
            <StatusFilter list={myOrders} value={fMy} onChange={setFMy} />
            <OrderList orders={myOrders.filter(o => fMy === 'all' || o.status === fMy)} canAct={false} onStatus={updateStatus} />
          </div>
        </div>
      )}

      {/* crop foto profil */}
      {cropSrc && (
        <AvatarCropper
          src={cropSrc}
          onCancel={() => setCropSrc('')}
          onCrop={(url) => { setCropSrc(''); saveAvatar(url) }}
        />
      )}

      {/* edit profile modal — portal ke body agar tidak ketindih header/stacking context */}      {editOpen && createPortal(
        <div className="fixed inset-0 flex items-end justify-center sm:items-center sm:p-4 overflow-y-auto overscroll-contain" style={{ zIndex: 90 }}>
          <div className="fixed inset-0 bg-black/40 slide-in-left-face" onClick={() => setEditOpen(false)}></div>
          <div className="relative flex min-h-full w-full items-end justify-center sm:items-center sm:p-0 pointer-events-none">
          <form onSubmit={saveEdit} onClick={e => e.stopPropagation()} className="pointer-events-auto relative w-full max-h-[92dvh] overflow-y-auto overscroll-contain rounded-t-3xl bg-white p-5 pb-[max(24px,env(safe-area-inset-bottom))] shadow-2xl slide-up sm:max-h-[calc(100dvh-32px)] sm:max-w-[640px] sm:rounded-3xl sm:p-6 dark:bg-slate-900">
            <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-4 sm:hidden" aria-hidden="true"></div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-extrabold text-ink flex items-center gap-2 dark:text-gray-100"><Icon name="edit" size={18} className="text-[#0e76f1]" /> Edit Profil</h3>
              <button type="button" onClick={() => setEditOpen(false)} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 dark:text-gray-400 dark:hover:bg-white/10"><Icon name="x" size={18} /></button>
            </div>
            <div className="flex items-center gap-3 mb-5">
              <Avatar src={avatar || user.avatar} username={user.username} size={48} className="ring-2 ring-blue-100" />
              <div>
                <div className="font-bold text-ink dark:text-gray-100">{user.full_name}</div>
                <div className="text-xs text-gray-400">@{user.username}</div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 block dark:text-gray-100">Username</label>
                  <input value={editForm.username} onChange={e => setEditForm({ ...editForm, username: e.target.value.replace(/\s/g, '') })} className="input-field" autoComplete="username" required />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 block dark:text-gray-100">Email</label>
                  <input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} className="input-field" autoComplete="email" required />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 block dark:text-gray-100">Nama Lengkap</label>
                <input value={editForm.full_name} onChange={e => setEditForm({ ...editForm, full_name: e.target.value })} className="input-field" autoComplete="name" required />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 block dark:text-gray-100">Lokasi</label>
                <input value={editForm.location} onChange={e => setEditForm({ ...editForm, location: e.target.value })} placeholder="Contoh: Jakarta, Surabaya" className="input-field" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 block dark:text-gray-100">Bio {isFL && <span className="text-red-500">*</span>}{!isFL && <span className="text-gray-400 font-medium normal-case"> (opsional)</span>}</label>
                <textarea value={editForm.bio} onChange={e => setEditForm({ ...editForm, bio: e.target.value })} placeholder="Ceritakan singkat tentang kamu / keahlianmu" className="input-field h-24 resize-none" maxLength={300} />
                <p className="text-[11px] text-gray-400 mt-1 text-right">{editForm.bio.length}/300</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 block dark:text-gray-100">No. HP / WhatsApp <span className="text-gray-400 font-medium normal-case">(opsional)</span></label>
                  <input value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} placeholder="Contoh: 0812xxxxxxx" className="input-field" autoComplete="tel" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 block dark:text-gray-100">Website / Portofolio <span className="text-gray-400 font-medium normal-case">(opsional)</span></label>
                  <input value={editForm.website} onChange={e => setEditForm({ ...editForm, website: e.target.value })} placeholder="https://" className="input-field" autoComplete="url" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 block dark:text-gray-100">Keahlian {isFL ? <span className="text-red-500">*</span> : <span className="text-gray-400 font-medium normal-case">(opsional, pisahkan dengan koma)</span>}{isFL && <span className="text-gray-400 font-medium normal-case"> (pisahkan dengan koma)</span>}</label>
                <input value={editForm.skills} onChange={e => setEditForm({ ...editForm, skills: e.target.value })} placeholder="Contoh: Desain Logo, Copywriting, SEO" className="input-field" />
                {editForm.skills.trim() && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {editForm.skills.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                      <span key={s} className="text-[11px] font-bold bg-blue-50 text-[#0e76f1] rounded-full px-2.5 py-1">{s}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <button className="mt-5 w-full btn-primary !py-3" disabled={editSaving}>
              {editSaving ? <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span> : 'Simpan Perubahan'}
            </button>
          </form>
          </div>
        </div>, document.body)}
    </div>
  )
}

function InfoTile({ label, value, icon, chip, c = 'bg-blue-50 text-[#0e76f1]' }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all dark:bg-slate-900 dark:border-white/10">
      <div className={`w-9 h-9 rounded-lg ${c} shrink-0 flex items-center justify-center`}><Icon name={icon} size={16} /></div>
      <div className="min-w-0">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{label}</div>
        {chip
          ? <span className="text-sm font-bold text-gray-700 bg-gray-100 rounded-md px-2 py-0.5 uppercase inline-block dark:text-gray-100">{value}</span>
          : <div className="text-sm font-semibold text-ink truncate dark:text-gray-100">{value}</div>}
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
    <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-5 px-5 mb-4 pb-0.5">
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
                <div className="text-sm font-semibold text-ink line-clamp-1 dark:text-gray-100">{o.gig?.title || `Order #${o.id}`}</div>
                <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-gray-400 mt-1">
                  <span>Paket {o.package?.name}</span>•
                  <span>{formatIDR(o.price)}</span>•
                  <span>{new Date(o.created_at).toLocaleDateString('id-ID')}</span>
                </div>
              </div>
              <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ring-1 shrink-0 ${st.cls}`}><span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}></span>{st.label}</span>
            </div>
            {o.note && <div className="mt-2.5 text-[12px] text-gray-500 bg-gray-50 rounded-lg px-3 py-2 line-clamp-2 dark:bg-white/5 dark:text-gray-400">📝 {o.note}</div>}
            {canAct && (
              <div className="flex flex-wrap gap-2 mt-3">
                {o.status === 'pending' && <button onClick={() => onStatus(o.id, 'progress')} className="btn-primary !py-2 !px-4 !text-xs">Terima Order</button>}
                {o.status === 'progress' && <button onClick={() => onStatus(o.id, 'review')} className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl px-4 py-2 text-xs font-bold transition-colors">Kirim ke Review</button>}
                {o.status === 'review' && <button onClick={() => onStatus(o.id, 'completed')} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-2 text-xs font-bold transition-colors">Setujui & Selesai</button>}
                {ACTIVE.includes(o.status) && <button onClick={() => onStatus(o.id, 'cancelled')} className="border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200 rounded-xl px-4 py-2 text-xs font-bold transition-colors dark:border-white/10 dark:text-gray-400">Batal</button>}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
