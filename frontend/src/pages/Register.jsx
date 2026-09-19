import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Icon from '../components/Icon'
import { showToast } from '../components/Toast'

export default function Register() {
  const { register } = useAuth()
  const nav = useNavigate()
  const [form, setForm] = useState({ username: '', full_name: '', email: '', password: '', role: 'client' })
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    setLoading(true)
    try {
      await register(form)
      showToast(form.role === 'freelancer' ? 'Akun freelancer berhasil dibuat!' : 'Akun berhasil dibuat, selamat datang!')
      nav('/')
    } catch (e2) {
      setErr(e2.response?.data?.error || 'Gagal mendaftar, coba lagi')
    }
    setLoading(false)
  }

  const roles = [
    { v: 'client', icon: 'search', t: 'Saya Mencari Jasa', d: 'Beli jasa untuk keperluan bisnis' },
    { v: 'freelancer', icon: 'briefcase', t: 'Saya Menjual Jasa', d: 'Jual skill & dapatkan order' },
  ]

  return (
    <div className="grid lg:grid-cols-2 lg:h-screen lg:overflow-hidden relative">
      {/* left: branding + steps */}
      <div className="hidden lg:flex relative overflow-hidden bg-[#0a1633] text-white flex-col justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-[#10255c] via-[#0a1633] to-[#1b1440]"></div>
        <div className="absolute -top-32 -left-24 w-96 h-96 rounded-full bg-[#1f6feb]/25 blur-3xl"></div>
        <div className="absolute -bottom-24 -left-16 w-80 h-80 rounded-full bg-[#6a3cff]/20 blur-3xl"></div>
        <div className="relative z-20 max-w-md">
          <Link to="/" className="flex items-center gap-2.5 mb-8 w-fit hover:opacity-90 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0e76f1] to-[#6a3cff] flex items-center justify-center font-extrabold text-xl">m</div>
            <span>
              <span className="block text-xl font-extrabold leading-none">masalahta<span className="text-blue-300">.id</span></span>
              <span className="block text-[11px] text-white/60 mt-1">Semua Jasa, Satu Tempat</span>
            </span>
          </Link>
          <h2 className="text-3xl font-extrabold leading-tight">Mulai Order Pertamamu dalam <span className="text-[#4da3ff]">3 Langkah</span></h2>
          <p className="mt-3 text-sm text-white/70 leading-relaxed">Ribuan penyedia jasa siap membantumu. Mudah, aman, dan terpercaya.</p>
          <div className="mt-8 space-y-6 relative">
            <span className="absolute left-[17px] top-4 bottom-4 w-px bg-white/15"></span>
            {[
              { n: '1', t: 'Daftar Akun', d: 'Cukup email & password, tanpa ribet' },
              { n: '2', t: 'Pilih Jasa Tepat', d: 'Ribuan jasa dengan harga jelas & sistem escrow' },
              { n: '3', t: 'Kerja Sama & Sukses', d: 'Chat, revisi, hingga selesai — semua dalam satu platform' },
            ].map((s, i) => (
              <div key={s.n} className="relative flex gap-4">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-sm shrink-0 ring-4 ring-[#0a1633] ${i === 2 ? 'bg-gradient-to-r from-[#ff6b00] to-[#ff9f2e] text-white' : 'bg-[#1f6feb] text-white'}`}>{s.n}</div>
                <div>
                  <div className="font-bold">{s.t}</div>
                  <div className="text-sm text-white/60 mt-0.5">{s.d}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-5 border-t border-white/10 flex items-center gap-6">
            {[
              { icon: 'shield', l1: 'Aman', l2: '& Terpercaya' },
              { icon: 'zap', l1: 'Proses', l2: 'Mudah' },
              { icon: 'users', l1: 'Ribuan', l2: 'Freelancer' },
            ].map((t) => (
              <div key={t.l1} className="flex items-center gap-2">
                <Icon name={t.icon} size={22} className="text-[#4da3ff] shrink-0" />
                <div className="text-[11px] leading-tight text-white/80 font-semibold">{t.l1}<br />{t.l2}</div>
              </div>
            ))}
          </div>
          <blockquote className="mt-6 text-sm text-white/70 italic">“Dari kebutuhan kecil sampai project besar, semuanya bisa di <span className="text-blue-300 not-italic font-semibold">masalahta.id</span>.”</blockquote>
        </div>
      </div>

      {/* right: form */}
      <div className="flex items-center justify-center px-4 py-6 min-h-svh lg:min-h-0 lg:py-0 lg:pl-20 lg:h-screen lg:overflow-hidden bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="w-full max-w-md fade-up">
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_20px_60px_-20px_rgba(11,95,208,0.25)] p-5 lg:p-6 dark:bg-slate-900">
            <h1 className="text-xl font-extrabold text-ink tracking-tight dark:text-gray-100">Buat akun baru</h1>
            <p className="text-[13px] text-gray-500 mt-0.5 dark:text-gray-400">Isi data di bawah untuk mulai order atau jual jasa.</p>

            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mt-4 mb-1.5 dark:text-gray-400">Saya bergabung sebagai</p>
            {/* role selector */}
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              {roles.map(r => {
                const active = form.role === r.v
                return (
                  <button
                    key={r.v}
                    type="button"
                    onClick={() => setForm({ ...form, role: r.v })}
                    aria-pressed={active}
                    className={`relative rounded-xl border p-3 text-left transition-all duration-200 ${active ? 'border-[#0e76f1] bg-blue-50/70 ring-4 ring-blue-500/10 shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                  >
                    {active && <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#0e76f1] text-white flex items-center justify-center"><Icon name="check" size={12} strokeWidth={3} /></span>}
                    <Icon name={r.icon} size={18} className={active ? 'text-[#0e76f1]' : 'text-gray-400'} />
                    <div className={`text-[13px] font-bold mt-1.5 ${active ? 'text-[#0e76f1]' : 'text-gray-800'}`}>{r.t}</div>
                    <div className="text-[11px] text-gray-400 leading-tight mt-0.5">{r.d}</div>
                  </button>
                )
              })}
            </div>

            <form onSubmit={submit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wide mb-1.5 block dark:text-gray-400">Username</label>
                  <div className="relative">
                    <Icon name="users" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input placeholder="cth. budi_pratama" required value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} className="input-field !pl-10" />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wide mb-1.5 block dark:text-gray-400">Nama lengkap</label>
                  <input placeholder="Nama kamu" required value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} className="input-field" />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wide mb-1.5 block dark:text-gray-400">Email</label>
                <div className="relative">
                  <Icon name="mail" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input type="email" placeholder="nama@email.com" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-field !pl-10" />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wide mb-1.5 block dark:text-gray-400">Password</label>
                <div className="relative">
                  <Icon name="lock" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input type={showPw ? 'text' : 'password'} required minLength={6} placeholder="Min. 6 karakter" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="input-field !pl-10 !pr-11" />
                  <button type="button" onClick={() => setShowPw(v => !v)} aria-label={showPw ? 'Sembunyikan password' : 'Lihat password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0e76f1] transition-colors"><Icon name={showPw ? 'eye' : 'eyeOff'} size={18} className={showPw ? 'text-[#0e76f1]' : ''} /></button>
                </div>
              </div>

              {err && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-center gap-2"><Icon name="info" size={16} /> {err}</div>}

              <button className="btn-primary w-full !py-3 !text-[15px]" disabled={loading}>
                {loading ? <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span> : <>Daftar Sekarang <Icon name="arrowRight" size={16} /></>}
              </button>
              <p className="text-[11px] text-gray-400 text-center leading-relaxed">Dengan mendaftar, kamu menyetujui <Link to="/terms" className="underline hover:text-gray-600">Syarat & Ketentuan</Link> dan <Link to="/privacy" className="underline hover:text-gray-600">Kebijakan Privasi</Link>.</p>
            </form>

            <p className="text-sm text-center mt-4 text-gray-500 dark:text-gray-400">Sudah terdaftar? <Link to="/login" className="font-bold text-[#0e76f1] hover:underline">Masuk</Link></p>
          </div>
        </div>
      </div>

      {/* foto model besar di tengah batas panel (desktop saja) */}
      <div className="hidden lg:flex absolute inset-y-0 left-1/2 -translate-x-[52%] -ml-[40px] z-30 items-end justify-center pointer-events-none">
        <div className="absolute bottom-6 h-10 w-3/4 rounded-full bg-black/40 blur-2xl"></div>
        <img
          src="/banner-register.png"
          alt="Model masalahta.id"
          onError={(e) => { e.currentTarget.parentElement.style.display = 'none' }}
          className="h-[85vh] max-h-[900px] w-auto object-cover object-top drop-shadow-[0_30px_40px_rgba(0,0,0,0.45)]"
        />
      </div>

      {/* badge chat melayang (desktop saja) */}
      {[
        { icon: 'image', t: 'Desain?', cls: 'left-[37%] top-[9%] -ml-[40px] mt-[130px] blur-[0.5px]', delay: '0s', z: 'z-10' },
        { icon: 'home', t: 'Perbaikan Rumah?', cls: 'left-[27%] top-[37%] ml-[80px] mt-[200px]', delay: '0.9s', z: 'z-40' },
        { icon: 'edit', t: 'Penulisan?', cls: 'left-[46%] top-[30%] ml-[100px] mt-[100px]', delay: '1.8s', z: 'z-40' },
      ].map((b) => (
        <div key={b.t} className={`hidden lg:flex absolute ${b.z} ${b.cls} items-center gap-2.5 rounded-2xl bg-white pl-2 pr-4 py-2 shadow-[0_20px_45px_rgba(0,0,0,0.35)] pointer-events-none animate-float`} style={{ animationDelay: b.delay }}>
          <span className="w-9 h-9 rounded-xl bg-[#0e76f1]/10 text-[#0e76f1] flex items-center justify-center shrink-0"><Icon name={b.icon} size={17} /></span>
          <span className="text-xs font-bold text-gray-800 leading-tight dark:text-gray-100">{b.t}<br /><span className="font-medium text-gray-400">Ada.</span></span>
        </div>
      ))}
    </div>
  )
}