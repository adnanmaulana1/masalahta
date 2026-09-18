import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Icon from '../components/Icon'
import { showToast } from '../components/Toast'

function AuthLayout({ children }) {
  return (
    <div className="min-h-[calc(100vh-5rem)] overflow-hidden">
      <div className="grid lg:grid-cols-2 h-full">
        {/* left branding */}
        <div className="hidden lg:flex relative overflow-hidden bg-[#0e76f1] text-white flex-col justify-center p-12">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0e76f1] via-[#0b62d6] to-[#4a2fd8]"></div>
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute bottom-0 right-1/3 w-72 h-72 rounded-full bg-[#ff9f2e]/20 blur-3xl"></div>
          <div className="relative max-w-md">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur border border-white/20 flex items-center justify-center font-extrabold text-xl">m</div>
              <span className="text-xl font-extrabold">masalahta<span className="text-blue-300">.id</span></span>
            </div>
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
        <div className="flex items-center justify-center px-4 py-10 bg-gradient-to-b from-gray-50 to-gray-100">
          <div className="w-full max-w-md fade-up">{children}</div>
        </div>
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

  const fillDemo = (email) => setForm({ email, password: 'password123' })

  return (
    <AuthLayout>
      <div className="bg-white rounded-2xl border shadow-card p-7">
        <h1 className="text-xl font-extrabold text-ink">Masuk</h1>
        <p className="text-sm text-gray-500 mt-1">Lanjutkan petualanganmu bersama freelancer terbaik</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 block">Email</label>
            <div className="relative">
              <Icon name="mail" size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="nama@email.com" className="input-field !pl-10" />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Password</label>
              <button type="button" className="text-xs font-semibold text-[#0e76f1] hover:underline">Lupa password?</button>
            </div>
            <div className="relative">
              <Icon name="lock" size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" className="input-field !pl-10" />
            </div>
          </div>

          {err && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-center gap-2"><Icon name="info" size={16} /> {err}</div>}

          <button className="btn-primary w-full !py-3.5" disabled={loading}>
            {loading ? <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span> : 'Masuk Sekarang'}
          </button>
        </form>

        <div className="flex items-center gap-3 mt-6 mb-4">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Coba akun demo</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[{ l: 'Client', e: 'andi@example.com' }, { l: 'Designer', e: 'dian@example.com' }, { l: 'Dev', e: 'budi@example.com' }].map(d => (
            <button key={d.l} onClick={() => fillDemo(d.e)} className="text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl py-2.5 hover:border-[#0e76f1] hover:text-[#0e76f1] transition-colors">
              {d.l}
            </button>
          ))}
        </div>

        <p className="text-sm text-center mt-6 text-gray-500">Belum punya akun? <Link to="/register" className="font-bold text-[#0e76f1] hover:underline">Daftar gratis</Link></p>
      </div>
    </AuthLayout>
  )
}