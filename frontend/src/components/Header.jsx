import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import Icon from './Icon'
import Avatar from './Avatar'
import NotificationMenu from './NotificationMenu'
import WishlistMenu from './WishlistMenu'
import { useWishlist } from '../context/WishlistContext'

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 shrink-0 group">
      <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-[#0e76f1] to-[#6a3cff] flex items-center justify-center text-white font-extrabold text-[18px] shadow-lg shadow-blue-500/25 ring-1 ring-inset ring-white/25 group-hover:scale-105 group-hover:shadow-blue-500/40 transition-all">m</div>
      <span className="text-[19px] sm:text-[21px] font-extrabold tracking-tight text-ink">masalahta<span className="text-[#0e76f1]">.id</span></span>
    </Link>
  )
}

function SearchBar({ q, setQ, inputRef }) {
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
    <form ref={boxRef} onSubmit={submit} className="relative flex-1 w-full">
      <div className="group flex items-center bg-gray-50 border border-transparent rounded-full px-3 py-2 transition-all focus-within:bg-white focus-within:border-blue-100 focus-within:ring-4 focus-within:ring-blue-500/10 hover:bg-white hover:border-gray-200">
        <Icon name="search" size={18} className="text-gray-400 mx-1.5 shrink-0 transition-colors group-focus-within:text-[#0e76f1]" />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          onFocus={() => suggest.length && setOpen(true)}
          placeholder="Cari jasa: desain logo, website, video..."
          ref={inputRef}
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
    { label: 'Pesan', icon: 'chat', to: '/messages' },
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
    if (pathname.startsWith('/messages')) return 'chat'
    if (pathname.startsWith('/orders')) return 'orders'
    if (pathname.startsWith('/dashboard')) return 'account'
    return ''
  })()
  const isFL = user?.role === 'freelancer'
  const go = (to) => { if (pathname !== to) navigate(to) }
  const renderItem = (active, to, title, label, icon, avatar) => (
    <button
      key={label}
      onClick={() => go(to)}
      title={title}
      aria-current={active ? 'page' : undefined}
      className={`relative flex-1 min-w-0 h-[54px] flex flex-col items-center justify-center gap-1 rounded-2xl transition-all duration-200 active:scale-95 ${active ? 'text-[#0e76f1] bg-blue-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
    >
      <span className="h-5 flex items-center justify-center">
        {avatar && user ? <Avatar src={user.avatar} username={user.username} size={20} className="ring-1 ring-blue-100" /> : (
          <Icon name={icon} size={20} strokeWidth={active ? 2.5 : 2} />
        )}
      </span>
      <span className="text-[10px] leading-none font-bold truncate max-w-full px-1">{label}</span>
      <span className={`absolute bottom-1 h-[3px] w-5 rounded-full bg-gradient-to-r from-[#0e76f1] to-[#6a3cff] transition-all duration-300 ${active ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} />
    </button>
  )
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-[80] px-3 pb-[max(10px,env(safe-area-inset-bottom))] pointer-events-none" aria-label="Navigasi bawah">
      <div
        className="pointer-events-auto max-w-md mx-auto rounded-[24px] border border-gray-200/70 bg-white/95 backdrop-blur-xl shadow-[0_12px_40px_rgba(16,24,40,.16)] px-2 py-2"
      >
        <div className="grid grid-cols-5 items-center gap-0.5">
          {renderItem(tab === 'home', '/', 'Beranda', 'Beranda', 'home')}
          {renderItem(tab === 'explore', '/explore', 'Jelajahi', 'Jelajahi', 'search')}

          <div className="h-[54px] flex justify-center">
            {isFL ? (
              <button
                onClick={() => go('/create-gig')}
                title="Buat Jasa"
                aria-current={tab === 'sell' ? 'page' : undefined}
                className={`w-full h-[54px] flex flex-col items-center justify-center gap-1 rounded-2xl transition-all duration-200 active:scale-95 ${tab === 'sell' ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
              >
                <span className={`w-7 h-7 rounded-xl bg-gradient-to-br from-[#0e76f1] to-[#6a3cff] flex items-center justify-center text-white shadow-sm transition-transform ${tab === 'sell' ? 'scale-105 shadow-blue-500/25' : ''}`}>
                  <Icon name="plus" size={17} strokeWidth={3} />
                </span>
                <span className={`text-[10px] leading-none font-bold whitespace-nowrap ${tab === 'sell' ? 'text-[#0e76f1]' : 'text-gray-500'}`}>Jual Jasa</span>
              </button>
            ) : (
              <button
                onClick={() => go(user ? '/messages' : '/login')}
                title="Pesan"
                aria-current={tab === 'chat' ? 'page' : undefined}
                className={`w-full h-[54px] flex flex-col items-center justify-center gap-1 rounded-2xl transition-all duration-200 active:scale-95 ${tab === 'chat' ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
              >
                <span className={`w-7 h-7 rounded-xl bg-gradient-to-br from-[#0e76f1] to-[#6a3cff] flex items-center justify-center text-white shadow-sm transition-transform ${tab === 'chat' ? 'scale-105 shadow-blue-500/25' : ''}`}>
                  <Icon name="chat" size={16} />
                </span>
                <span className={`text-[10px] leading-none font-bold whitespace-nowrap ${tab === 'chat' ? 'text-[#0e76f1]' : 'text-gray-500'}`}>Pesan</span>
              </button>
            )}
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
  const { pathname, search } = useLocation()
  const [q, setQ] = useState('')
  const [cats, setCats] = useState([])
  const [mobileSearch, setMobileSearch] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const mobileInputRef = useRef(null)
  const navigate = useNavigate()
  const { ids: wishlistIds } = useWishlist()

  const toggleMobileSearch = () => {
    setMobileSearch((v) => {
      if (!v) {
        requestAnimationFrame(() => {
          mobileInputRef.current?.focus({ preventScroll: true })
        })
      }
      return !v
    })
  }

  useEffect(() => {
    api.get('/categories').then(r => setCats((r.data.data || []).slice(0, 8))).catch(() => {})
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const goToGigs = () => {
    if (pathname === '/') {
      const el = document.getElementById('gigs')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
        return
      }
    }
    navigate('/explore')
  }

  const isExplore = pathname.startsWith('/explore')
  const isCreate = pathname.startsWith('/create-gig')
  const activeCat = new URLSearchParams(search).get('category')
  const catCls = (slug) => `flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] transition-colors ${
    activeCat === slug ? 'font-semibold text-[#0e76f1] bg-blue-100/80' : 'font-medium text-gray-600 hover:text-[#0e76f1] hover:bg-blue-50'
  }`
  const catClsMobile = (slug) => `shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-xs transition-colors ${
    activeCat === slug ? 'font-bold text-[#0e76f1] bg-blue-100/80' : 'font-medium text-gray-600 hover:text-[#0e76f1] hover:bg-blue-50'
  }`

  const navCls = (active) => `relative text-sm font-semibold px-3.5 py-2 rounded-full transition-colors ${
    active ? 'text-[#0e76f1] bg-blue-50/80' : 'text-gray-700 hover:text-[#0e76f1] hover:bg-gray-50'
  }`

  return (
    <header className="sticky top-0 z-50">
      {/* top bar */}
      <div className={`relative z-20 bg-white/90 backdrop-blur-md border-b transition-[box-shadow,border-color] duration-300 ${scrolled ? 'border-transparent shadow-[0_8px_30px_rgba(16,24,40,.07)]' : 'border-gray-200/70'}`}>
        <div className="max-w-[1240px] mx-auto px-3 sm:px-4 h-14 md:h-16 flex items-center gap-3 md:gap-5">
          <Logo />
          <div className="hidden md:block flex-1"><SearchBar q={q} setQ={setQ} /></div>
          <nav className="hidden lg:flex items-center gap-1.5 ml-2">
            {!user ? (
              <>
                <Link to="/explore" className={navCls(isExplore)}>Jelajahi</Link>
                <Link to="/login" className="text-sm font-semibold text-gray-700 hover:text-[#0e76f1] px-3.5 py-2 rounded-full hover:bg-blue-50 transition-colors">Masuk</Link>
                <Link to="/register" className="bg-gradient-to-r from-[#0e76f1] to-[#0b5fd0] text-white rounded-full px-5 py-2.5 text-sm font-bold shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30 hover:-translate-y-px hover:brightness-110 transition-all">Daftar Gratis</Link>
              </>
            ) : (
              <>
                <Link to="/explore" className={navCls(isExplore)}>Jelajahi</Link>
                {user.role === 'freelancer' && <Link to="/create-gig" className={navCls(isCreate)}>Jual Jasa</Link>}
                <WishlistMenu />
                <NotificationMenu />
                <AccountMenu user={user} logout={logout} navigate={navigate} />
              </>
            )}
          </nav>

          {/* mobile controls */}
          <div className="lg:hidden flex items-center gap-1.5 ml-auto">
            {user && (
              <button onClick={() => navigate('/dashboard?tab=favorit')} className="relative p-2.5 rounded-full hover:bg-gray-100 text-gray-600" title="Favorit">
                <Icon name="heart" size={20} fill={wishlistIds.size > 0 ? 'currentColor' : 'none'} className={wishlistIds.size > 0 ? 'text-red-500' : ''} />
                {wishlistIds.size > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
                    {wishlistIds.size > 9 ? '9+' : wishlistIds.size}
                  </span>
                )}
              </button>
            )}
            <button onClick={toggleMobileSearch} className="p-2.5 rounded-full hover:bg-gray-100 text-gray-600" title="Cari">
              <Icon name="search" size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* mobile search */}
      {mobileSearch && (
        <div className="relative z-20 lg:hidden bg-white border-b px-4 py-3 slide-down scroll-mt-32">
          <SearchBar q={q} setQ={setQ} inputRef={mobileInputRef} />
        </div>
      )}

      {/* mobile category strip */}
      <div className="relative z-10 lg:hidden bg-white/95 backdrop-blur border-b border-gray-200/70">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar px-3 py-2">
          <button onClick={() => navigate('/explore')} className="flex items-center gap-1 shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold text-[#0e76f1] bg-blue-50/80">
            <Icon name="grid" size={13} /> Semua
          </button>
          {cats.map(c => (
            <button
              key={c.id}
              onClick={() => navigate(`/explore?category=${c.slug}`)}
              aria-current={activeCat === c.slug ? 'page' : undefined}
              className={catClsMobile(c.slug)}
            >
              <span className="text-[13px]">{c.icon}</span> {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* category bar (desktop) */}
      <div className="hidden lg:block relative z-10 bg-white/95 backdrop-blur border-b border-gray-200/70">
        <div className="max-w-[1240px] mx-auto px-4">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2">
            <button onClick={goToGigs} className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-semibold text-[#0e76f1] bg-blue-50/70 hover:bg-blue-100/70 transition-colors">
              <Icon name="grid" size={14} /> Semua
            </button>
            {cats.map(c => (
              <button
                key={c.id}
                onClick={() => navigate(`/explore?category=${c.slug}`)}
                aria-current={activeCat === c.slug ? 'page' : undefined}
                className={catCls(c.slug)}
              >
                <span className="text-[15px]">{c.icon}</span> {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {pathname !== '/' && <MobileBottomNav user={user} />}
    </header>
  )
}
