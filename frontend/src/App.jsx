import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthProvider } from './context/AuthContext'
import Header from './components/Header'
import Footer from './components/Footer'
import Toast from './components/Toast'
import Home from './pages/Home'
import Explore from './pages/Explore'
import GigDetail from './pages/GigDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import CreateGig from './pages/CreateGig'
import Orders from './pages/Orders'
import ScrollToTop from './components/ScrollToTop'

const titles = {
  '/': 'masalahta.id — Marketplace Jasa Freelancer Terbaik di Indonesia',
  '/explore': 'Jelajahi Jasa · masalahta.id',
  '/login': 'Masuk · masalahta.id',
  '/register': 'Daftar Akun · masalahta.id',
  '/dashboard': 'Dashboard · masalahta.id',
  '/create-gig': 'Jual Jasa · masalahta.id',
  '/orders': 'Pesanan Saya · masalahta.id',
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
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-gig" element={<CreateGig />} />
        <Route path="/orders" element={<Orders />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Toast />
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 pb-20 lg:pb-0">
            <AnimatedRoutes />
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}