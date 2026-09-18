import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import GigCard from '../components/GigCard'
import Stars from '../components/Stars'
import Icon from '../components/Icon'
import ParticleBg from '../components/ParticleBg'

function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-[4/3] skeleton m-0 rounded-none" />
      <div className="p-4 space-y-2.5">
        <div className="flex gap-2"><div className="w-6 h-6 skeleton rounded-full" /><div className="flex-1 h-3 skeleton" /></div>
        <div className="h-3.5 skeleton w-4/5" />
        <div className="h-3.5 skeleton w-3/5" />
        <div className="pt-2"><div className="h-5 skeleton w-1/3" /></div>
      </div>
    </div>
  )
}

const ROTATE_WORDS = ['desain logo', 'website', 'video animasi', 'feed instagram', 'copywriting', 'aplikasi mobile']

function SearchSuggest() {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [suggest, setSuggest] = useState([])
  const [open, setOpen] = useState(false)
  const [debounced, setDebounced] = useState('')
  const [phIdx, setPhIdx] = useState(0)
  const [phText, setPhText] = useState('')
  const [phDeleting, setPhDeleting] = useState(false)

  useEffect(() => {
    const word = ROTATE_WORDS[phIdx % ROTATE_WORDS.length]
    let delay = phDeleting ? 40 : 95
    if (!phDeleting && phText === word) delay = 1400
    if (phDeleting && phText === '') delay = 300
    const t = setTimeout(() => {
      if (!phDeleting) {
        if (phText === word) setPhDeleting(true)
        else setPhText(word.slice(0, phText.length + 1))
      } else if (phText === '') {
        setPhDeleting(false)
        setPhIdx(i => i + 1)
      } else {
        setPhText(word.slice(0, phText.length - 1))
      }
    }, delay)
    return () => clearTimeout(t)
  }, [phText, phDeleting, phIdx])

  useEffect(() => { const t = setTimeout(() => setDebounced(q), 250); return () => clearTimeout(t) }, [q])
  useEffect(() => {
    if (debounced.length < 2) { setSuggest([]); return }
    api.get(`/search/suggest?q=${encodeURIComponent(debounced)}`).then(r => { setSuggest(r.data.data || []); setOpen(true) }).catch(() => {})
  }, [debounced])

  const submit = (e) => {
    e.preventDefault()
    if (q.trim()) navigate(`/explore?q=${encodeURIComponent(q)}`)
  }

  return (
    <div className="relative max-w-[560px] mx-auto">
      <form onSubmit={submit} className="relative flex items-center bg-white rounded-2xl p-2 shadow-2xl shadow-blue-950/30 ring-1 ring-white/30">
        <Icon name="search" size={20} className="text-[#0e76f1] mx-3 shrink-0" />
        <div className="relative flex-1 min-w-0">
          <input
            value={q} onChange={e => setQ(e.target.value)} onFocus={() => suggest.length && setOpen(true)}
            placeholder="Cari jasa"
            className="relative w-full bg-transparent outline-none text-[15px] text-ink placeholder:text-gray-400 py-1"
          />
          {!q && (
            <span className="pointer-events-none absolute inset-0 flex items-center overflow-hidden text-[15px] text-gray-400 whitespace-nowrap">
              Cari jasa&nbsp;
              <span className="font-semibold text-[#0e76f1]/75">{phText}</span>
              <span className="inline-block ml-px w-[2px] h-4 bg-[#0e76f1]/60 animate-pulse"></span>
            </span>
          )}
        </div>
        {q && <button type="button" onClick={() => { setQ(''); setSuggest([]) }} className="p-1 mr-1 text-gray-400 hover:text-gray-600"><Icon name="x" size={16} /></button>}
        <button type="submit" className="bg-gradient-to-r from-[#0e76f1] to-[#0b5fd0] hover:from-[#0b5fd0] hover:to-[#0a52b8] text-white rounded-xl px-6 py-2.5 text-sm font-bold transition-all shrink-0">
          Cari
        </button>
      </form>
      {open && suggest.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-2xl border shadow-lift overflow-hidden fade-up text-left z-50">
          <div className="px-4 pt-3 pb-1 text-[11px] font-bold uppercase tracking-wide text-gray-400">Saran pencarian</div>
          {suggest.map((s, i) => (
            <button key={i} type="button" onClick={() => { setQ(s); setOpen(false); navigate(`/explore?q=${encodeURIComponent(s)}`) }}
                    className="w-full text-left px-4 py-2.5 flex items-center gap-3 text-sm text-gray-700 hover:bg-blue-50">
              <Icon name="search" size={16} className="text-gray-400" /> <span className="truncate">{s}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function useCountUp(target, duration = 1500) {
  const [val, setVal] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    if (!ref.current) return
    const el = ref.current
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true
        const start = performance.now()
        const tick = (now) => {
          const p = Math.min(1, (now - start) / duration)
          const eased = 1 - Math.pow(1 - p, 3)
          setVal(target * eased)
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
        io.disconnect()
      }
    }, { threshold: 0.4 })
    io.observe(el)
    return () => io.disconnect()
  }, [target, duration])

  return [ref, val]
}

function compactID(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace('.', ',').replace(/,0$/, '')}jt`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}rb`
  return Math.round(n).toString()
}

function Stat({ target, l, format = compactID, prefix = '', suffix = '' }) {
  const isRating = l === 'Rating Kepuasan'
  const [ref, val] = useCountUp(isRating ? 4.9 : target)
  const display = isRating ? val.toFixed(1).replace('.', ',') : format(val)
  return (
    <div ref={ref} className="md:px-2">
      <div className="text-[22px] sm:text-2xl md:text-[28px] font-extrabold tracking-tight tabular-nums text-white leading-none">{prefix}{display}{suffix}</div>
      <div className="text-[11px] sm:text-xs font-semibold text-blue-100/90 mt-2">{l}</div>
    </div>
  )
}

export default function Home() {
  const [gigs, setGigs] = useState([])
  const [cats, setCats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/gigs?limit=8').then(r => setGigs(r.data.data)).catch(() => {}).finally(() => setLoading(false))
    api.get('/categories').then(r => setCats(r.data.data || [])).catch(() => {})
  }, [])

  const catPalette = [
    'from-sky-100 to-blue-50 text-[#0e76f1]', 'from-violet-100 to-purple-50 text-[#6a3cff]', 'from-amber-100 to-orange-50 text-[#c2410c]',
    'from-emerald-100 to-green-50 text-emerald-600', 'from-rose-100 to-pink-50 text-rose-600', 'from-cyan-100 to-teal-50 text-cyan-700',
    'from-indigo-100 to-blue-50 text-indigo-600', 'from-lime-100 to-green-50 text-green-700',
  ]

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-[#0e76f1]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0e76f1] via-[#0b62d6] to-[#4a2fd8]"></div>
        <div className="absolute inset-0 hero-dots opacity-60"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-[#6a3cff]/50 blur-3xl"></div>
        <div className="absolute top-24 right-[12%] w-40 h-40 rounded-full bg-white/5 blur-xl"></div>
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/25 to-transparent"></div>

        <div className="relative max-w-[1240px] mx-auto px-4 py-14 sm:py-16 md:py-24 text-white text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur border border-white/20 px-3.5 sm:px-4 py-1.5 text-[11px] sm:text-xs font-semibold mb-5 sm:mb-6 fade-up">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            100.000+ Project Selesai Setiap Bulan
          </span>
          <h1 className="text-[27px] leading-[1.2] sm:text-3xl md:text-5xl font-extrabold md:leading-[1.15] tracking-tight max-w-2xl mx-auto fade-up">
            Selesaikan Masalahmu dengan <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">Freelancer Terbaik</span> di masalahta
          </h1>
          <p className="mt-3.5 sm:mt-4 text-white/85 text-[15px] sm:text-base md:text-lg max-w-xl mx-auto fade-up">
            Ribuan jasa profesional murah — desain, website, marketing, dan lainnya. Aman, cepat, dengan garansi hasil.
          </p>
          <div className="mt-7 sm:mt-8 px-1 fade-up"><SearchSuggest /></div>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12px] sm:text-[13px] text-white/80">
            <span className="flex items-center gap-1.5"><Stars rating={5} size={14} /> 4.9 rata-rata rating</span>
            <span className="flex items-center gap-1.5"><Icon name="shield" size={15} /> Garansi 100%</span>
            <span className="hidden sm:flex items-center gap-1.5"><Icon name="verified" size={15} /> Freelancer terverifikasi</span>
          </div>
        </div>

        {/* stat strip */}
        <div className="relative px-4 -mt-4 md:mt-0 pb-16 md:pb-20">
          <div className="max-w-[1240px] mx-auto bg-white/10 backdrop-blur-md ring-1 ring-white/20 rounded-2xl md:rounded-3xl px-6 py-6 md:px-10 md:py-7 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-7 md:gap-y-0 text-center md:divide-x md:divide-white/15">
            {[
              { target: 50000, l: 'Freelancer Aktif', suffix: '+' },
              { target: 1200000, l: 'Project Terselesaikan', suffix: '+' },
              { target: 4.9, l: 'Rating Kepuasan', suffix: '/5' },
              { target: 50000, l: 'Mulai dari', prefix: 'Rp ' },
            ].map((s) => (
              <Stat key={s.l} {...s} />
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="max-w-[1240px] mx-auto px-4 -mt-10 mb-4 relative z-10">
        <div className="bg-white rounded-2xl md:rounded-3xl ring-1 ring-black/5 shadow-[0_24px_60px_-20px_rgba(2,32,71,0.3)] p-2 sm:p-3 fade-up">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5">
            {cats.map((c, i) => (
              <Link key={c.id} to={`/explore?category=${c.slug}`} className="group flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-blue-50/70 transition-colors sm:flex-col sm:gap-2 sm:py-4 sm:px-2 sm:text-center" style={{ animationDelay: `${i * 40}ms` }}>
                <span className={`w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-xl bg-gradient-to-br ${catPalette[i % 8]} flex items-center justify-center text-[20px] shadow-sm group-hover:scale-110 transition-transform`}>{c.icon}</span>
                <span className="text-[12px] sm:text-[12.5px] font-bold text-gray-800 group-hover:text-[#0e76f1] transition-colors line-clamp-1">{c.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED GIGS */}
      <section id="gigs" className="max-w-[1240px] mx-auto px-4 mt-12">
        <div className="flex items-end justify-between mb-6">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-500/25">
              <Icon name="sparkles" size={22} />
            </div>
            <div>
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-orange-500">Paling Laris</div>
              <h2 className="text-xl md:text-2xl font-extrabold text-ink mt-0.5">Jasa Terlaris Hari Ini</h2>
              <p className="text-sm text-gray-500 mt-1">Paling banyak dipesan dan mendapatkan rating terbaik</p>
            </div>
          </div>
          <Link to="/explore" className="group hidden sm:flex items-center gap-1.5 text-sm font-bold text-[#0e76f1] hover:gap-2.5 transition-all">
            Lihat Semua <Icon name="arrowRight" size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {loading ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : gigs.map((g, i) => <GigCard key={g.id} gig={g} index={i} />)}
        </div>
        {!loading && gigs.length === 0 && (
          <div className="card p-10 text-center text-gray-400">Belum ada jasa tersedia.</div>
        )}
        <Link to="/explore" className="sm:hidden flex items-center justify-center gap-1.5 mt-6 text-sm font-bold text-[#0e76f1]">
          Lihat Semua <Icon name="arrowRight" size={16} />
        </Link>
      </section>

      {/* HOW IT WORKS */}
      <section className="mt-14 bg-white border-y border-gray-200 py-14">
        <div className="max-w-[1240px] mx-auto px-4">
          <div className="text-center mb-10">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#0e76f1]">Proses Mudah</div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-ink mt-1.5">Cara Kerja <span className="bg-gradient-to-r from-[#0e76f1] to-[#6a3cff] bg-clip-text text-transparent">masalahta.id</span></h2>
            <p className="text-sm text-gray-500 mt-2">Tiga langkah mudah untuk mulai project kamu</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: 'search', step: '01', t: 'Cari Jasa', d: 'Temukan freelancer & paket yang sesuai kebutuhan dan budget kamu', c: 'bg-blue-50 text-[#0e76f1]' },
              { icon: 'chat', step: '02', t: 'Pesan & Bayar', d: 'Chat freelancer, kirim brief. Dana aman di escrow hingga project selesai', c: 'bg-amber-50 text-amber-600' },
              { icon: 'verified', step: '03', t: 'Terima Hasil', d: 'Revisi sampai puas, dana dicairkan ke freelancer setelah approve', c: 'bg-emerald-50 text-emerald-600' },
            ].map((s, i) => (
              <div key={s.step} className="relative card p-6 pt-8 text-center hover:-translate-y-1 hover:shadow-lift transition-all fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-[#0e76f1] to-[#6a3cff] text-white text-[11px] font-extrabold px-3 py-1 rounded-full shadow-md">{s.step}</span>
                <div className={`w-14 h-14 rounded-2xl ${s.c} flex items-center justify-center mx-auto mb-4`}>
                  <Icon name={s.icon} size={26} />
                </div>
                <h3 className="font-extrabold text-ink mb-1.5">{s.t}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="max-w-[1240px] mx-auto px-4 mt-14">
        <div className="text-center mb-8">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-amber-500">Testimoni</div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-ink mt-1.5">Kata Mereka yang Sudah <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">Berhasil</span></h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { name: 'Rina Wulandari', role: 'Owner Kopi Mambruk', av: 'https://i.pravatar.cc/100?img=47', txt: 'Bikin website & logo UMKM jadi gampang. Desainernya sabar, revisi dikerjakan cepat. Bisnis aku langsung terlihat profesional.' },
            { name: 'Dimas Prakoso', role: 'Founder Startup Tech', av: 'https://i.pravatar.cc/100?img=32', txt: 'Aplikasi Flutter selesai 2 minggu lebih cepat dari target. Komunikasi freelancer sangat lancar, hasil di luar ekspektasi.' },
            { name: 'Sari Nugroho', role: 'Influencer & Konten Kreator', av: 'https://i.pravatar.cc/100?img=20', txt: 'Feed IG-ku sekarang estetik banget. Paket 30 post + template canva bikin konten konsisten tanpa pusing.' },
          ].map((t, i) => (
            <div key={t.name} className="card p-6 flex flex-col fade-up hover:-translate-y-1 hover:shadow-lift transition-all" style={{ animationDelay: `${i * 80}ms` }}>
              <Stars rating={5} size={16} />
              <p className="text-sm text-gray-600 leading-relaxed mt-3 flex-1">“{t.txt}”</p>
              <div className="flex items-center gap-3 mt-4 pt-4 border-t">
                <div className="rounded-full p-0.5 bg-gradient-to-br from-[#0e76f1] to-[#6a3cff]">
                  <img src={t.av} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-white" loading="lazy" />
                </div>
                <div>
                  <div className="text-sm font-bold text-ink">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.role}</div>
                </div>
                <Icon name="verified" size={16} className="ml-auto text-[#0e76f1]" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[1240px] mx-auto px-4 mt-14">
        <div className="relative overflow-hidden rounded-3xl border border-gray-200/80 bg-gradient-to-b from-[#edf4ff] via-white to-[#f5f0ff] px-6 py-10 sm:px-10 sm:py-12 md:px-14 md:py-16 text-center shadow-sm">
          <ParticleBg />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full bg-white text-[#0e76f1] ring-1 ring-blue-200/70 shadow-sm px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-wider">
              <Icon name="briefcase" size={13} /> Untuk Freelancer
            </span>
            <h2 className="mt-4 text-[24px] sm:text-[30px] md:text-[36px] font-extrabold text-ink leading-[1.15] tracking-tight max-w-2xl mx-auto">
              Punya Skill? Jadi Freelancer & <span className="text-[#0e76f1]">Mulai Cuan</span>
            </h2>
            <p className="mt-3 text-gray-500 text-[14px] sm:text-[15px] leading-relaxed max-w-md mx-auto">
              Buat jasa kamu sekarang, terima order, dan wujudkan penghasilan impianmu.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-2.5 sm:gap-3 max-w-md mx-auto">
              <Link to="/register" className="btn-primary flex-1 !py-3.5">
                Daftar Jadi Freelancer <Icon name="arrowRight" size={16} />
              </Link>
              <Link to="/explore" className="btn-outline flex-1 !py-3.5">Jelajahi Jasa</Link>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-200/70 flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 text-[12.5px] font-semibold text-gray-500">
              <span className="flex items-center gap-1.5"><Icon name="check" size={14} className="text-emerald-500" /> Gratis daftar</span>
              <span className="flex items-center gap-1.5"><Icon name="check" size={14} className="text-emerald-500" /> Pembayaran aman</span>
              <span className="flex items-center gap-1.5"><Icon name="check" size={14} className="text-emerald-500" /> Pencairan cepat</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}