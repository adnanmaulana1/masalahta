import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Header from './components/Header'
import Footer from './components/Footer'
import Toast from './components/Toast'
import Home from './pages/Home'
import Explore from './pages/Explore'
import GigDetail from './pages/GigDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import CreateGig from './pages/CreateGig'
import Orders from './pages/Orders'
import Messages from './pages/Messages'
import Notifications from './pages/Notifications'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import Security from './pages/Security'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'
import Forbidden from './pages/Forbidden'
import ServerError from './pages/ServerError'
import Maintenance from './pages/Maintenance'
import ErrorBoundary from './components/ErrorBoundary'
import OfflineBanner from './components/OfflineBanner'
import FloatingChat from './components/FloatingChat'
import { WishlistProvider } from './context/WishlistContext'
import { NotificationProvider } from './context/NotificationContext'
import { RealtimeProvider } from './context/RealtimeContext'
import ScrollToTop from './components/ScrollToTop'

const titles = {
  '/': 'masalahta.id — Marketplace Jasa Freelancer Terbaik di Indonesia',
  '/explore': 'Jelajahi Jasa · masalahta.id',
  '/login': 'Masuk · masalahta.id',
  '/register': 'Daftar Akun · masalahta.id',
  '/forgot-password': 'Lupa Password · masalahta.id',
  '/reset-password': 'Reset Password · masalahta.id',  '/dashboard': 'Dashboard · masalahta.id',
  '/create-gig': 'Jual Jasa · masalahta.id',
  '/orders': 'Pesanan Saya · masalahta.id',
  '/messages': 'Pesan · masalahta.id',    '/notifications': 'Notifikasi · masalahta.id',
  '/terms': 'Syarat & Ketentuan · masalahta.id',
    '/privacy': 'Kebijakan Privasi · masalahta.id',
    '/security': 'Keamanan & Escrow · masalahta.id',
  '/contact': 'Hubungi Kami · masalahta.id',  '/403': 'Akses Ditolak · masalahta.id',
  '/500': 'Server Error · masalahta.id',
}

function AnimatedRoutes() {
  const location = useLocation()

  useEffect(() => {
    document.title = titles[location.pathname] || 'masalahta.id — Marketplace Jasa Freelancer'
  }, [location.pathname])

  return (
    <div key={location.pathname} className="page-enter">
      <Routes location={location}>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/gig/:slug" element={<GigDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-gig" element={<CreateGig />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/security" element={<Security />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/403" element={<Forbidden />} />
        <Route path="/500" element={<ServerError />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

function Layout() {
  const location = useLocation()
  const isFullPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/forgot-password' || location.pathname === '/reset-password'

  if (import.meta.env.VITE_MAINTENANCE === 'true') return <Maintenance />

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f7fb] text-ink dark:bg-[#101725] dark:text-slate-300 transition-colors">
      <OfflineBanner />
      {!isFullPage && <Header />}
      <main className="flex-1">
        <ErrorBoundary>
          <AnimatedRoutes />
        </ErrorBoundary>
      </main>
      {!isFullPage && <Footer />}
      <FloatingChat />
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <WishlistProvider>
      <NotificationProvider>
      <RealtimeProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Toast />
        <Layout />
      </BrowserRouter>
      </RealtimeProvider>
      </NotificationProvider>
      </WishlistProvider>
    </AuthProvider>
    </ThemeProvider>
  )
}
