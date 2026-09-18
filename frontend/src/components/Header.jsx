import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import Icon from './Icon'
import Avatar from './Avatar'

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 shrink-0 group">
      <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-[#0e76f1] to-[#6a3cff] flex items-center justify-center text-white font-extrabold text-[18px] shadow-lg shadow-blue-500/25 ring-1 ring-inset ring-white/25 group-hover:scale-105 group-hover:shadow-blue-500/40 transition-all">m</div>
      <span className="text-[19px] sm:text-[21px] font-extrabold tracking-tight text-ink">masalahta<span className="text-[#0e76f1]">.id</span></span>
    </Link>
  )
}

function SearchBar({ q, setQ, autoFocus = false }) {
  const navigate = useNavigate()
  const [suggest, setSuggest] = useState([])
  const [open, setOpen] = useState(false)
  const [debounced, setDebounced] = useState('')
  const boxRef = useRef(null)

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q), 250)
    return () => clearTimeout(t)
  }, [q])

  useEffect(() => {
    if (debounced.length < 2) { setSuggest([]); return }
    api.get(`/search/suggest?q=${encodeURIComponent(debounced)}`).then(r => {
      setSuggest(r.data.data || []); setOpen(true)
    }).catch(() => {})
  }, [debounced])

  useEffect(() => {
    const onClick = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const submit = (e) => {
    e.preventDefault()
    if (q.trim()) { setOpen(false); navigate(`/explore?q=${encodeURIComponent(q)}`) }
  }

  return (
    <form ref={boxRef} onSubmit={submit} className="relative flex-1 max-w-[520px]">
      <div className="group flex items-center bg-gray-50 border border-transparent rounded-full px-3 py-2 transition-all focus-within:bg-white focus-within:border-blue-100 focus-within:ring-4 focus-within:ring-blue-500/10 hover:bg-white hover:border-gray-200">
        <Icon name="search" size={18} className="text-gray-400 mx-1.5 shrink-0 transition-colors group-focus-within:text-[#0e76f1]" />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          onFocus={() => suggest.length && setOpen(true)}
          placeholder="Cari jasa: desain logo, website, video..."
          autoFocus={autoFocus}
          className="flex-1 bg-transparent outline-none text-sm text-ink placeholder:text-gray-400 min-w-0"
        />
        {q && (
          <button type="button" onClick={() => { setQ(''); setSuggest([]) }} className="p-1 mr-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
            <Icon name="x" size={14} strokeWidth={2.5} />
          </button>
        )}
        <button type="submit" className="bg-[#0e76f1] hover:bg-[#0b5fd0] text-white rounded-full px-4 py-1.5 text-[13px] font-bold transition-colors shrink-0 ml-1">Cari</button>
      </div>

      {open && suggest.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-2xl border shadow-lift overflow-hidden fade-up z-50">
          <div className="px-4 pt-3 pb-1 text-[11px] font-bold uppercase tracking-wide text-gray-400">Saran pencarian</div>
          {suggest.map((s, i) => (
            <button
              key={i} type="button"
              onClick={() => { setQ(s); setOpen(false); navigate(`/explore?q=${encodeURIComponent(s)}`) }}
              className="w-full text-left px-4 py-2.5 flex items-center gap-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#0e76f1]"
            >
              <Icon name="search" size={16} className="text-gray-400" />
              <span className="truncate">{s}</span>
            </button>
          ))}
        </div>
      )}
    </form>
  )
}

function AccountMenu({ user, logout, navigate }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])
  const menu = [
    { label: 'Ringkasan', icon: 'grid', to: '/dashboard' },
    { label: 'Pesanan', icon: 'box', to: '/orders' },
    { label: 'Jasa Saya', icon: 'briefcase', to: '/dashboard?tab=gigs' },
  ]
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1.5 rounded-full p-1 hover:bg-gray-100 transition-colors" title="Akun">
        <Avatar src={user.avatar} username={user.username} size={34} className="ring-2 ring-white shadow-sm" />
        <Icon name="chevDown" size={14} className={`text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2.5 w-60 bg-white rounded-2xl border shadow-lift p-1.5 fade-up z-50">
          <div className="px-3 py-2.5 border-b mb-1">
            <div className="text-sm font-bold text-ink truncate">{user.full_name}</div>
            <div className="text-xs text-gray-500 truncate">@{user.username}</div>
          </div>
          {menu.map(m => (
            <Link key={m.label} to={m.to} onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-[#0e76f1]">
              <Icon name={m.icon} size={17} className="text-gray-400" /> {m.label}
            </Link>
          ))}
          <div className="border-t my-1"></div>
          <button onClick={() => { setOpen(false); logout(); navigate('/') }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50">
            <Icon name="logout" size={17} /> Keluar
          </button>
        </div>
      )}
    </div>
  )
}

function MobileBottomNav({ user }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const tab = (() => {
    if (pathname === '/') return 'home'
    if (pathname.startsWith('/explore')) return 'explore'
    if (pathname.startsWith('/create-gig')) return 'sell'
    if (pathname.startsWith('/orders')) return 'orders'
    if (pathname.startsWith('/dashboard')) return 'account'
    return ''
  })()
  const go = (to) => { if (pathname !== to) navigate(to) }
  const itemCls = (active) => `relative flex flex-col items-center justify-center px-2.5 pt-1.5 pb-1 rounded-2xl transition-all ${active ? 'text-[#0e76f1] bg-blue-50/80' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`
  const renderItem = (active, to, title, label, icon, avatar) => (
    <button key={label} onClick={() => go(to)} className={`flex-1 ${itemCls(active)}`} title={title}>
      <span className="h-5 flex items-center justify-center">
        {avatar && user ? <Avatar src={user.avatar} username={user.username} size={18} className="ring-1 ring-blue-100" /> : (
          <Icon name={icon} size={18} strokeWidth={active ? 2.5 : 2} />
        )}
      </span>
      <span className="h-3.5 mt-0.5 flex items-center justify-center text-[10px] leading-none font-bold">{label}</span>
      <span className={`h-[3px] w-5 mt-0.5 rounded-full bg-gradient-to-r from-[#0e76f1] to-[#6a3cff] transition-all duration-300 ${active ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}></span>
    </button>
  )
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-[80] bg-white/95 backdrop-blur-md border-t border-gray-200/80">
      <div className="max-w-md mx-auto h-[64px] px-1.5 pb-[env(safe-area-inset-bottom)] flex items-center justify-center">
        <div className="flex items-center gap-0.5 w-full">
          {renderItem(tab === 'home', '/', 'Beranda', 'Beranda', 'home')}
          {renderItem(tab === 'explore', '/explore', 'Jelajahi', 'Jelajahi', 'search')}

          {/* center + button */}
          <div className="relative flex justify-center w-[72px] shrink-0">
            <button
              onClick={() => go('/create-gig')}
              className="absolute -top-7 left-1/2 -translate-x-1/2 flex flex-col items-center"
              title="Jual Jasa"
            >
              <span className="w-[52px] h-[52px] rounded-2xl bg-gradient-to-br from-[#0e76f1] to-[#6a3cff] flex items-center justify-center text-white shadow-lg shadow-blue-500/30 ring-[5px] ring-white transition-transform active:scale-95">
                <Icon name="plus" size={24} strokeWidth={3} />
              </span>
              <span className={`mt-0.5 text-[10px] font-bold ${tab === 'sell' ? 'text-[#0e76f1]' : 'text-gray-400'}`}>Jual</span>
            </button>
          </div>

          {renderItem(tab === 'orders', user ? '/orders' : '/login', 'Pesanan', 'Pesanan', 'box')}
          {renderItem(tab === 'account', user ? '/dashboard' : '/login', 'Akun', 'Akun', 'user', true)}
        </div>
      </div>
    </nav>
  )
}

export default function Header() {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const [q, setQ] = useState('')
  const [cats, setCats] = useState([])
  const [mobileSearch, setMobileSearch] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/categories').then(r => setCats((r.data.data || []).slice(0, 8))).catch(() => {})
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const isExplore = pathname.startsWith('/explore')
  const isCreate = pathname.startsWith('/create-gig')

  const navCls = (active) => `relative text-sm font-semibold px-3.5 py-2 rounded-full transition-colors ${
    active ? 'text-[#0e76f1] bg-blue-50/80' : 'text-gray-700 hover:text-[#0e76f1] hover:bg-gray-50'
  }`

  return (
    <header className="sticky top-0 z-50">
      {/* top bar */}
      <div className={`relative z-10 bg-white/90 backdrop-blur-md border-b transition-[box-shadow,border-color] duration-300 ${scrolled ? 'border-transparent shadow-[0_8px_30px_rgba(16,24,40,.07)]' : 'border-gray-200/70'}`}>
        <div className="max-w-[1240px] mx-auto px-3 sm:px-4 h-14 md:h-16 flex items-center gap-3 md:gap-5">
          <Logo />
          <div className="hidden md:block flex-1"><SearchBar q={q} setQ={setQ} /></div>
          <nav className="hidden lg:flex items-center gap-1.5 ml-2">
            {!user ? (
              <>
                <Link to="/explore" className={navCls(isExplore)}>Jelajahi</Link>
                <button onClick={() => scrollTo('gigs')} className="relative text-sm font-semibold px-3.5 py-2 rounded-full text-gray-700 hover:text-[#0e76f1] hover:bg-gray-50 transition-colors">Kategori</button>
                <Link to="/login" className="text-sm font-semibold text-gray-700 hover:text-[#0e76f1] px-3.5 py-2 rounded-full hover:bg-blue-50 transition-colors">Masuk</Link>
                <Link to="/register" className="bg-gradient-to-r from-[#0e76f1] to-[#0b5fd0] text-white rounded-full px-5 py-2.5 text-sm font-bold shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30 hover:-translate-y-px hover:brightness-110 transition-all">Daftar Gratis</Link>
              </>
            ) : (
              <>
                <Link to="/explore" className={navCls(isExplore)}>Jelajahi</Link>
                <Link to="/create-gig" className={navCls(isCreate)}>Jual Jasa</Link>
                <button title="Pesan" className="relative p-2.5 rounded-full hover:bg-gray-100 transition-colors text-gray-600">
                  <Icon name="bell" size={20} />
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#ff4d4f] ring-2 ring-white"></span>
                </button>
                <AccountMenu user={user} logout={logout} navigate={navigate} />
              </>
            )}
          </nav>

          {/* mobile controls */}
          <div className="lg:hidden flex items-center gap-1.5 ml-auto">
            <button onClick={() => setMobileSearch(!mobileSearch)} className="p-2.5 rounded-full hover:bg-gray-100 text-gray-600" title="Cari">
              <Icon name="search" size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* mobile search */}
      {mobileSearch && (
        <div className="relative z-10 lg:hidden bg-white border-b px-4 py-3 slide-down">
          <SearchBar q={q} setQ={setQ} autoFocus />
        </div>
      )}

      {/* mobile category strip */}
      <div className="relative z-10 lg:hidden bg-white/95 backdrop-blur border-b border-gray-200/70">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide px-3 py-2">
          <button onClick={() => navigate('/explore')} className="flex items-center gap-1 shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold text-[#0e76f1] bg-blue-50/80">
            <Icon name="grid" size={13} /> Semua
          </button>
          {cats.map(c => (
            <button
              key={c.id}
              onClick={() => navigate(`/explore?category=${c.slug}`)}
              className="shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-[#0e76f1] hover:bg-blue-50 transition-colors"
            >
              <span className="text-[13px]">{c.icon}</span> {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* category bar (desktop) */}
      <div className="hidden lg:block relative z-10 bg-white/95 backdrop-blur border-b border-gray-200/70">
        <div className="max-w-[1240px] mx-auto px-4">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-2">
            <button onClick={() => scrollTo('gigs') || navigate('/explore')} className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-semibold text-[#0e76f1] bg-blue-50/70 hover:bg-blue-100/70 transition-colors">
              <Icon name="grid" size={14} /> Semua
            </button>
            {cats.map(c => (
              <button
                key={c.id}
                onClick={() => navigate(`/explore?category=${c.slug}`)}
                className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-medium text-gray-600 hover:text-[#0e76f1] hover:bg-blue-50 transition-colors"
              >
                <span className="text-[15px]">{c.icon}</span> {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <MobileBottomNav user={user} />
    </header>
  )
}