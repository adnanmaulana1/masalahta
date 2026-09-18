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
    <div className="grid lg:grid-cols-2 min-h-[calc(100vh-5rem)]">
      {/* left: formatted steps */}
      <div className="hidden lg:flex relative overflow-hidden bg-[#0f172a] text-white flex-col justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-[#111e36] via-[#0f172a] to-[#1a1440]"></div>
        <div className="absolute -bottom-24 -left-16 w-80 h-80 rounded-full bg-[#0e76f1]/30 blur-3xl"></div>
        <div className="relative max-w-md">
          <div className="flex items-center gap-2 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0e76f1] to-[#6a3cff] flex items-center justify-center font-extrabold text-xl">m</div>
            <span className="text-xl font-extrabold">masalahta<span className="text-blue-300">.id</span></span>
          </div>
          <h2 className="text-3xl font-extrabold leading-tight">Mulai Order Pertamamu dalam 3 Langkah</h2>
          <div className="mt-8 space-y-6">
            {[
              { n: '1', t: 'Daftar Akun', d: 'Cukup email & password, tanpa ribet' },
              { n: '2', t: 'Pilih Jasa Tepat', d: 'Ribuan jasa dengan harga jelas & sistem escrow' },
              { n: '3', t: 'Kerja Sama & Sukses', d: 'Chat, revisi, hingga selesai — semua dalam satu platform' },
            ].map((s, i) => (
              <div key={s.n} className="flex gap-4">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-sm shrink-0 ${i === 2 ? 'bg-gradient-to-r from-[#ff6b00] to-[#ff9f2e] text-white' : 'bg-white/10 border border-white/20'}`}>{s.n}</div>
                <div>
                  <div className="font-bold">{s.t}</div>
                  <div className="text-sm text-white/60 mt-0.5">{s.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* right: form */}
      <div className="flex items-center justify-center px-4 py-10 bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="w-full max-w-md fade-up">
          <div className="bg-white rounded-2xl border shadow-card p-7">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0e76f1] to-[#6a3cff] flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/25"><Icon name="sparkles" size={28} className="text-white" /></div>
              <h1 className="text-xl font-extrabold text-ink">Daftar Akun Baru</h1>
              <p className="text-sm text-gray-500 mt-1">Gratis, tanpa kartu kredit</p>
            </div>

            {/* role selector */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {roles.map(r => (
                <button
                  key={r.v}
                  type="button"
                  onClick={() => setForm({ ...form, role: r.v })}
                  className={`rounded-xl border-2 p-3.5 text-left transition-all ${form.role === r.v ? 'border-[#0e76f1] bg-blue-50/70 shadow-glow' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <Icon name={r.icon} size={20} className={form.role === r.v ? 'text-[#0e76f1]' : 'text-gray-400'} />
                  <div className={`text-[13px] font-bold mt-2 ${form.role === r.v ? 'text-[#0e76f1]' : 'text-gray-700'}`}>{r.t}</div>
                  <div className="text-[11px] text-gray-400 leading-tight mt-0.5">{r.d}</div>
                </button>
              ))}
            </div>

            <form onSubmit={submit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Username" required value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} className="input-field" />
                <input placeholder="Nama Lengkap" required value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} className="input-field" />
              </div>
              <input type="email" placeholder="Email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-field" />
              <input type="password" required minLength={6} placeholder="Password (min. 6 karakter)" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="input-field" />

              {err && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-center gap-2"><Icon name="info" size={16} /> {err}</div>}

              <button className="btn-primary w-full !py-3.5" disabled={loading}>
                {loading ? <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span> : 'Daftar Sekarang'}
              </button>
              <p className="text-[11px] text-gray-400 text-center leading-relaxed">Dengan mendaftar, kamu menyetujui <span className="underline cursor-pointer">Syarat & Ketentuan</span> dan <span className="underline cursor-pointer">Kebijakan Privasi</span>.</p>
            </form>

            <p className="text-sm text-center mt-5 text-gray-500">Sudah punya akun? <Link to="/login" className="font-bold text-[#0e76f1] hover:underline">Masuk</Link></p>
          </div>
        </div>
      </div>
    </div>
  )
}