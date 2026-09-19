import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Icon from '../components/Icon'
import { showToast } from '../components/Toast'

function AuthLayout({ children }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 overflow-hidden relative">
        {/* left branding */}
        <div className="hidden lg:flex relative overflow-hidden bg-[#0e76f1] text-white flex-col justify-center p-12">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0e76f1] via-[#0b62d6] to-[#4a2fd8]"></div>
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute bottom-0 right-1/3 w-72 h-72 rounded-full bg-[#ff9f2e]/20 blur-3xl"></div>
          <div className="relative z-20 max-w-md">
            <Link to="/" className="flex items-center gap-2 mb-8 w-fit hover:opacity-90 transition-opacity">
              <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur border border-white/20 flex items-center justify-center font-extrabold text-xl">m</div>
              <span className="text-xl font-extrabold">masalahta<span className="text-blue-300">.id</span></span>
            </Link>
            <h2 className="text-3xl font-extrabold leading-tight">Bangun Bisnismu Lewat Jasa Freelancer Terbaik</h2>
            <p className="mt-4 text-white/80 text-sm leading-relaxed">Percaya diri dengan 100.000+ freelancer terverifikasi. Aman dengan sistem escrow dan garansi hasil.</p>
            <div className="mt-8 space-y-3">
              {['Dana dijamin aman sampai project selesai', 'Freelancer lolos verifikasi identitas & skill', 'Bebas chat dan revisi sebelum approve'].map((t, i) => (
                <div key={i} className="flex items-center gap-3 text-sm bg-white/10 backdrop-blur rounded-xl px-4 py-3 border border-white/15">
                  <span className="w-6 h-6 rounded-full bg-emerald-400/90 text-white flex items-center justify-center"><Icon name="check" size={13} strokeWidth={3} /></span>
                  {t}
                </div>
              ))}
            </div>
            <blockquote className="mt-8 text-sm text-white/70 italic">“Berawal dari jasa desain logo, sekarang aku punya bisnis agency sendiri. Semua berawal dari masalahta.id.”</blockquote>
          </div>
        </div>

        {/* right form */}
        <div className="flex items-center justify-center px-4 py-10 lg:pl-28 bg-gradient-to-b from-gray-50 to-gray-100">
          <div className="w-full max-w-md fade-up">{children}</div>
        </div>

        {/* foto model besar di tengah batas biru-putih (desktop saja) */}
        {/* ganti file frontend/public/banner-login.png dengan fotomu */}
        <div className="hidden lg:flex absolute inset-y-0 left-1/2 -translate-x-[55%] -ml-[88px] z-30 items-end justify-center pointer-events-none">
          <div className="absolute bottom-6 h-10 w-3/4 rounded-full bg-black/40 blur-2xl"></div>
          <img
            src="/banner-login.png"
            alt="Model masalahta.id"
            onError={(e) => { e.currentTarget.parentElement.style.display = 'none' }}
            className="h-[85vh] max-h-[900px] w-auto object-cover object-top drop-shadow-[0_30px_40px_rgba(0,0,0,0.45)]"
          />
        </div>
        {/* ikon melayang di kiri foto model (desktop saja) */}
        <div className="hidden lg:flex absolute z-20 blur-[0.5px] left-[24%] top-[18%] ml-[45px] mt-[100px] items-center gap-2 rounded-2xl bg-white/90 backdrop-blur px-3 py-2 shadow-xl pointer-events-none animate-float" style={{ animationDelay: '0s' }}>
          <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center"><Icon name="shield" size={17} /></span>
          <span className="text-xs font-bold text-gray-800 dark:text-gray-100">Escrow<br /><span className="font-medium text-gray-500 dark:text-gray-400">100% Aman</span></span>
        </div>
        <div className="hidden lg:flex absolute z-40 left-[54%] top-[26%] -ml-[80px] mt-[120px] items-center gap-2 rounded-2xl bg-white/90 backdrop-blur px-3 py-2 shadow-[0_20px_45px_rgba(0,0,0,0.35)] ring-1 ring-black/5 pointer-events-none animate-float" style={{ animationDelay: '0.9s' }}>
          <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-500 flex items-center justify-center"><Icon name="star" size={17} /></span>
          <span className="text-xs font-bold text-gray-800 dark:text-gray-100">4,9/5<br /><span className="font-medium text-gray-500 dark:text-gray-400">Rating</span></span>
        </div>
        <div className="hidden lg:flex absolute z-40 left-[34%] top-[64%] -ml-[24px] mt-[24px] items-center gap-2 rounded-2xl bg-white/90 backdrop-blur px-3 py-2 shadow-xl pointer-events-none animate-float" style={{ animationDelay: '1.8s' }}>
          <span className="w-8 h-8 rounded-xl bg-blue-100 text-[#0e76f1] flex items-center justify-center"><Icon name="verified" size={17} /></span>
          <span className="text-xs font-bold text-gray-800 dark:text-gray-100">100rb+<br /><span className="font-medium text-gray-500 dark:text-gray-400">Freelancer</span></span>
        </div>
    </div>
  )
}

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      showToast('Selamat datang kembali!')
      nav('/')
    } catch (e2) {
      setErr(e2.response?.data?.error || 'Email atau password salah')
    }
    setLoading(false)
  }

  return (
    <AuthLayout>
      <div className="bg-white rounded-2xl border shadow-card p-7 dark:bg-slate-900">
        <h1 className="text-xl font-extrabold text-ink dark:text-gray-100">Masuk</h1>
        <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">Lanjutkan petualanganmu bersama freelancer terbaik</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 block dark:text-gray-100">Email</label>
            <div className="relative">
              <Icon name="mail" size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="nama@email.com" className="input-field !pl-10" />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wide dark:text-gray-100">Password</label>
              <Link to="/forgot-password" className="text-xs font-semibold text-[#0e76f1] hover:underline">Lupa password?</Link>
            </div>
            <div className="relative">
              <Icon name="lock" size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input type={showPw ? 'text' : 'password'} required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" className="input-field !pl-10 !pr-11" />
              <button type="button" onClick={() => setShowPw(v => !v)} aria-label={showPw ? 'Sembunyikan password' : 'Lihat password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0e76f1] transition-colors"><Icon name={showPw ? 'eye' : 'eyeOff'} size={18} className={showPw ? 'text-[#0e76f1]' : ''} /></button>
            </div>
          </div>

          {err && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-center gap-2"><Icon name="info" size={16} /> {err}</div>}

          <button className="btn-primary w-full !py-3.5" disabled={loading}>
            {loading ? <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span> : 'Masuk Sekarang'}
          </button>
        </form>

        {/* demo accounts disabled */}

        <p className="text-sm text-center mt-6 text-gray-500 dark:text-gray-400">Belum punya akun? <Link to="/register" className="font-bold text-[#0e76f1] hover:underline">Daftar gratis</Link></p>
      </div>
    </AuthLayout>
  )
}