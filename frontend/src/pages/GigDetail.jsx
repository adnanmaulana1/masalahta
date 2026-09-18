import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import Stars from '../components/Stars'
import Icon from '../components/Icon'
import Avatar from '../components/Avatar'
import { formatIDR, parseImages, relativeTime } from '../utils/format'
import { showToast } from '../components/Toast'

function PackageFeature({ children }) {
  return (
    <li className="flex items-start gap-2.5"><span className="mt-0.5 w-4.5 h-4.5 min-w-[18px] min-h-[18px] rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"><Icon name="check" size={11} strokeWidth={3} /></span><span className="text-[13px] text-gray-700">{children}</span></li>
  )
}

export default function GigDetail() {
  const { slug } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [gig, setGig] = useState(null)
  const [images, setImages] = useState([])
  const [reviews, setReviews] = useState([])
  const [activeImg, setActiveImg] = useState(0)
  const [activePkg, setActivePkg] = useState(1)
  const [note, setNote] = useState('')
  const [ordering, setOrdering] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setGig(null)
    api.get(`/gigs/${slug}`).then(r => {
      setGig(r.data.gig)
      setImages(parseImages(r.data.gig.images))
      setReviews(r.data.reviews || [])
      const best = r.data.gig.packages?.findIndex(p => p.name === 'Standard')
      setActivePkg(best !== -1 && best !== undefined ? best : 0)
    }).catch(() => { })
  }, [slug])

  if (!gig) {
    return (
      <div className="max-w-[1240px] mx-auto px-4 py-8 grid lg:grid-cols-[1fr_400px] gap-6">
        <div className="space-y-4">
          <div className="skeleton h-8 w-3/4" />
          <div className="flex gap-3"><div className="skeleton w-10 h-10 rounded-full" /><div className="flex-1"><div className="skeleton h-4 w-1/3 mb-2" /></div></div>
          <div className="skeleton h-[380px] rounded-2xl" />
        </div>
        <div className="card p-6"><div className="skeleton h-6 w-1/2 mb-4" /><div className="skeleton h-4 w-full mb-2" /><div className="skeleton h-4 w-full mb-2" /><div className="skeleton h-12 w-full mt-6" /></div>
      </div>
    )
  }

  const pkg = gig.packages?.[activePkg] || gig.packages?.[0]
  const seller = gig.user || {}

  const handleOrder = async () => {
    if (!user) { showToast('Silakan login terlebih dahulu', 'error'); navigate('/login'); return }
    setOrdering(true)
    try {
      await api.post('/orders', { gig_id: gig.id, package_id: pkg.id, note })
      showToast('Pesanan berhasil dibuat! Cek menu Pesanan.')
      navigate('/orders')
    } catch (e) {
      showToast(e.response?.data?.error || 'Gagal membuat pesanan', 'error')
    }
    setOrdering(false)
  }

  return (
    <div className="max-w-[1240px] mx-auto px-4 py-6 fade-up">
      {/* breadcrumb */}
      <nav className="text-xs text-gray-400 mb-4 flex items-center gap-1.5">
        <Link to="/" className="hover:text-[#0e76f1]">Beranda</Link>
        <Icon name="chevRight" size={12} />
        <Link to="/explore" className="hover:text-[#0e76f1]">Jasa</Link>
        <Icon name="chevRight" size={12} />
        <span className="text-gray-600 font-medium">{gig.category?.name}</span>
      </nav>

      <div className="grid lg:grid-cols-[1fr_400px] gap-6 items-start">

        {/* LEFT */}
        <div>
          {/* title + meta */}
          <div className="card p-5 md:p-6">
            <div className="flex flex-wrap items-start gap-2">
              <span className="tag !py-1.5 text-[11px]">{gig.category?.icon} {gig.category?.name}</span>
              <span className="tag !py-1.5 text-[11px]"><Icon name="eye" size={12} /> {gig.view_count?.toLocaleString('id-ID')} dilihat</span>
            </div>
            <h1 className="text-lg md:text-[22px] font-extrabold text-ink leading-snug mt-3">{gig.title}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4">
              <div className="flex items-center gap-2">
                <Avatar src={seller.avatar} username={seller.username} size={38} />
                <div>
                  <div className="flex items-center gap-1 text-sm font-bold text-ink">{seller.full_name || seller.username} <Icon name="verified" size={15} className="text-[#0e76f1]" /></div>
                  <div className="text-[11px] text-gray-400">@{seller.username} • {seller.location}</div>
                </div>
              </div>
              <div className="ml-auto flex items-center gap-1.5 text-sm">
                <Stars rating={gig.rating} size={16} />
                <span className="font-extrabold text-ink">{Number(gig.rating).toFixed(1)}</span>
                <span className="text-gray-400">({gig.review_count} ulasan)</span>
              </div>
            </div>
          </div>

          {/* gallery */}
          <div className="mt-4 card overflow-hidden">
            <div className="relative bg-gray-100">
              <img src={images[activeImg] || images[0] || 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=900'} alt="" className="w-full aspect-[16/9] object-cover" />
              <button
                onClick={e => { e.preventDefault(); setSaved(!saved) }}
                className={`absolute top-3 right-3 w-10 h-10 rounded-full backdrop-blur flex items-center justify-center shadow-md transition-all ${saved ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-600 hover:text-red-500'}`}
              >
                <Icon name="heart" size={18} fill={saved ? 'currentColor' : 'none'} />
              </button>
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto scrollbar-hide bg-white">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)} className={`relative shrink-0 w-24 aspect-[16/9] rounded-lg overflow-hidden transition-all ${activeImg === i ? 'ring-2 ring-[#0e76f1] ring-offset-1' : 'opacity-70 hover:opacity-100'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* about */}
          <div className="mt-4 card p-5 md:p-6">
            <h3 className="font-extrabold text-ink mb-3 flex items-center gap-2"><Icon name="info" size={18} className="text-[#0e76f1]" /> Tentang Jasa Ini</h3>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{gig.description}</p>

            <h3 className="font-extrabold text-ink mt-6 mb-3 flex items-center gap-2"><Icon name="check" size={18} className="text-emerald-500" /> Apa yang kamu dapatkan?</h3>
            {(() => { try { const f = JSON.parse(pkg?.features || '[]'); return <ul className="grid sm:grid-cols-2 gap-2">{f.map((x, i) => <PackageFeature key={i}>{x}</PackageFeature>)}</ul> } catch { return null } })()}
          </div>

          {/* seller card */}
          <div className="mt-4 card overflow-hidden">
            <div className="relative bg-gradient-to-br from-[#0e76f1] via-[#3b5bff] to-[#6a3cff] px-5 md:px-6 pt-5 pb-4 text-white overflow-hidden">
              <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
              <div className="absolute -bottom-16 -left-12 w-48 h-48 rounded-full bg-black/10 blur-2xl pointer-events-none"></div>
              <div className="relative flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-extrabold"><Icon name="verified" size={12} /> Freelancer Terverifikasi</span>
                <span className="inline-flex items-center gap-1.5 text-[11px] text-white/75"><Icon name="calendar" size={12} /> Sejak {seller.created_at ? new Date(seller.created_at).getFullYear() : '—'}</span>
              </div>
              <div className="relative flex items-center gap-3.5 mt-4">
                <div className="relative shrink-0">
                  <Avatar src={seller.avatar} username={seller.username} size={64} className="ring-[3px] ring-white/30" />
                  <span className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full bg-emerald-400 ring-2 ring-white"></span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-extrabold text-[18px] leading-tight truncate">{seller.full_name || seller.username}</div>
                  <div className="text-xs text-white/75 mt-0.5 truncate">@{seller.username}{seller.location ? ` • ${seller.location}` : ''}</div>
                  <div className="mt-1.5 flex items-center gap-1.5 min-w-0">
                    <Stars rating={Number(seller.rating || gig.rating)} size={14} />
                    <span className="text-sm font-extrabold leading-none">{Number(seller.rating || gig.rating).toFixed(1)}</span>
                    <span className="text-[11px] text-white/70 truncate">({seller.review_count || gig.review_count} ulasan)</span>
                  </div>
                </div>
              </div>
              <div className="relative mt-4 grid grid-cols-3 divide-x divide-white/15 rounded-xl bg-white/10">
                {[
                  { n: Number(seller.rating || gig.rating).toFixed(1), l: 'Rating' },
                  { n: seller.review_count || gig.review_count, l: 'Ulasan' },
                  { n: seller.completed_jobs || 0, l: 'Project Selesai' },
                ].map(s => (
                  <div key={s.l} className="px-2 py-2.5 text-center">
                    <div className="font-extrabold text-[16px] leading-none">{s.n}</div>
                    <div className="text-[10.5px] text-white/70 mt-1 leading-tight">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-5 md:p-6">
              <h3 className="font-extrabold text-ink text-[15px] flex items-center gap-2"><Icon name="info" size={16} className="text-[#0e76f1]" /> Tentang Saya</h3>
              <p className="text-sm text-gray-600 leading-relaxed mt-2">{seller.bio || 'Freelancer profesional siap membantu project kamu dengan hasil terbaik dan tepat waktu.'}</p>
              <div className="flex flex-wrap items-center gap-1.5 mt-4">
                <span className="tag !py-1.5 !text-[11px]">{gig.category?.icon} {gig.category?.name}</span>
                <span className="tag !py-1.5 !text-[11px]"><Icon name="briefcase" size={12} /> Freelancer</span>
                <span className="tag !py-1.5 !text-[11px]"><Icon name="verified" size={12} className="text-emerald-500" /> Terverifikasi</span>
              </div>
              <button className="btn-primary w-full mt-5 !py-3 !text-[13px]"><Icon name="chat" size={15} /> Chat Freelancer</button>
            </div>
          </div>

          {/* reviews */}
          <div className="mt-4 card p-5 md:p-6">
            <div className="flex items-center gap-2 mb-5">
              <h3 className="font-extrabold text-ink">Ulasan Pembeli</h3>
              <span className="text-xs text-gray-400">({reviews.length})</span>
            </div>
            {reviews.length === 0 ? (
              <div className="text-center py-6 text-sm text-gray-400">Belum ada ulasan untuk jasa ini.</div>
            ) : (
              <div className="space-y-0">
                {reviews.map(r => (
                  <div key={r.id} className="py-4 border-b last:border-0">
                    <div className="flex items-center gap-2.5">
                      <Avatar src={r.user?.avatar} username={r.user?.username} size={36} />
                      <div>
                        <div className="text-sm font-bold text-ink">{r.user?.full_name || r.user?.username}</div>
                        <div className="text-[11px] text-gray-400">{relativeTime(r.created_at)}</div>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Stars rating={r.rating} size={13} />
                      <span className="text-xs font-semibold text-gray-600">{r.rating}.0</span>
                      <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1"><Icon name="verified" size={12} /> Pembelian terverifikasi</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT - pricing card */}
        <div id="order-section" className="lg:sticky lg:top-28 bg-white rounded-2xl border border-gray-200 shadow-card overflow-hidden">
          <div className="px-5 pt-5 pb-3">
            <h3 className="font-extrabold text-ink text-[15px] leading-none">Pilih Paket</h3>
            <p className="text-xs text-gray-400 mt-1">Bandingkan dan pilih yang paling sesuai</p>
          </div>
          <div className="px-4 pb-4 space-y-3">
            {gig.packages?.map((p, i) => {
              const active = activePkg === i
              const isStandard = p.name === 'Standard'
              let features = []
              try { features = JSON.parse(p.features || '[]') } catch {}
              return (
                <button
                  key={p.id}
                  onClick={() => setActivePkg(i)}
                  className={`relative w-full text-left rounded-2xl border-2 p-4 transition-all ${active ? 'border-[#0e76f1] bg-blue-50/40 shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50/60'}`}
                >
                  {isStandard && <span className="absolute -top-2.5 right-4 text-[9px] font-extrabold bg-gradient-to-r from-[#ff6b00] to-[#ff9f2e] text-white px-2.5 py-0.5 rounded-full shadow-sm">TERLARIS</span>}
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition ${active ? 'border-[#0e76f1] bg-[#0e76f1]' : 'border-gray-300 bg-white'}`}>
                        {active && <span className="w-1.5 h-1.5 rounded-full bg-white block" />}
                      </span>
                      <span className={`text-sm font-extrabold truncate ${active ? 'text-[#0e76f1]' : 'text-ink'}`}>{p.name}</span>
                    </span>
                    <span className="font-extrabold text-[15px] text-ink leading-none shrink-0">{formatIDR(p.price)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed line-clamp-2 pr-1">{p.description}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="inline-flex items-center gap-1.5 bg-white border rounded-full px-2.5 py-1 text-[11px] font-medium text-gray-600"><Icon name="clock" size={12} className="text-amber-500" /> {p.delivery_days} hari</span>
                    <span className="inline-flex items-center gap-1.5 bg-white border rounded-full px-2.5 py-1 text-[11px] font-medium text-gray-600"><Icon name="edit" size={12} className="text-violet-500" /> {p.revisions} revisi</span>
                  </div>
                  {active && features.length > 0 && (
                    <ul className="mt-3 pt-3 border-t border-blue-100 space-y-1.5 text-left">
                      {features.map((x, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-gray-700 leading-relaxed">
                          <span className="mt-0.5 w-4 h-4 rounded-full bg-[#0e76f1]/10 flex items-center justify-center shrink-0"><Icon name="check" size={10} strokeWidth={3} className="text-[#0e76f1]" /></span>
                          <span>{x}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </button>
              )
            })}
          </div>

          <div className="px-5 pb-5">
            <label className="block">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 block">Tulis brief / catatan <span className="font-normal normal-case text-gray-400">(opsional)</span></span>
              <textarea
                value={note} onChange={e => setNote(e.target.value)}
                placeholder="Ceritakan kebutuhan project kamu di sini..."
                className="input-field !py-2.5 h-24 resize-none"
              />
            </label>

            <button onClick={handleOrder} disabled={ordering} className="btn-primary w-full mt-4 !rounded-xl !py-3.5">
              {ordering ? <><span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span> Memproses...</> : <>Pesan Sekarang — {formatIDR(pkg?.price)} <Icon name="arrowRight" size={17} /></>}
            </button>

            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px] font-semibold text-gray-500">
              <span className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-gray-50 border"><Icon name="shield" size={16} className="text-[#0e76f1]" /> Dana Aman</span>
              <span className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-gray-50 border"><Icon name="chat" size={16} className="text-[#6a3cff]" /> Bebas Chat</span>
              <span className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-gray-50 border"><Icon name="sparkles" size={16} className="text-amber-500" /> Garansi</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
