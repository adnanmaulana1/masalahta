import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import api from '../utils/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [devToken, setDevToken] = useState('')
  const [err, setErr] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    setLoading(true)
    try {
      const res = await api.post('/auth/forgot-password', { email })
      if (res.data?.dev_token) setDevToken(res.data.dev_token)
      setDone(true)
    } catch (e2) {
      setErr(e2.response?.data?.error || 'Gagal mengirim link reset')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="w-full max-w-md fade-up">
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_20px_60px_-20px_rgba(11,95,208,0.25)] p-6 dark:bg-slate-900">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-[#0e76f1] transition-colors dark:text-gray-400">
            <Icon name="arrowRight" size={16} className="rotate-180" /> Kembali masuk
          </Link>
          <h1 className="text-xl font-extrabold text-ink tracking-tight mt-4 dark:text-gray-100">Lupa password?</h1>
          {!done ? (
            <>
              <p className="text-[13px] text-gray-500 mt-1 dark:text-gray-400">Masukkan email akunmu, kami kirimkan link reset password.</p>
              <form onSubmit={submit} className="mt-5 space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wide mb-1.5 block dark:text-gray-400">Email</label>
                  <div className="relative">
                    <Icon name="mail" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="nama@email.com" className="input-field !pl-10" />
                  </div>
                </div>
                {err && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-center gap-2"><Icon name="info" size={16} /> {err}</div>}
                <button className="btn-primary w-full !py-3" disabled={loading}>
                  {loading ? <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span> : 'Kirim link reset'}
                </button>
              </form>
            </>
          ) : (
            <div className="mt-5 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto"><Icon name="check" size={22} strokeWidth={3} /></div>
              <p className="text-sm font-bold text-gray-800 mt-3 dark:text-gray-100">Link reset terkirim</p>
              <p className="text-[13px] text-gray-500 mt-1 dark:text-gray-400">Jika <span className="font-semibold text-gray-700 dark:text-gray-100">{email}</span> terdaftar, cek inbox / spam untuk lanjut reset password.</p>
              {devToken && (
                <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-3 text-left">
                  <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wide">Mode dev — email belum dikirim</p>
                  <Link to={`/reset-password?token=${devToken}`} className="text-sm font-bold text-[#0e76f1] hover:underline">Buka link reset sekarang →</Link>
                </div>
              )}
              <Link to="/login" className="btn-outline w-full mt-5">Kembali masuk</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
