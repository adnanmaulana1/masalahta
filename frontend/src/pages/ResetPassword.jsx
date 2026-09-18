import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import api from '../utils/api'

export default function ResetPassword() {
  const [params] = useSearchParams()
  const nav = useNavigate()
  const [token] = useState(params.get('token') || '')
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [done, setDone] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    if (pw !== pw2) { setErr('Konfirmasi password tidak sama'); return }
    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, password: pw })
      setDone(true)
      setTimeout(() => nav('/login'), 2500)
    } catch (e2) {
      setErr(e2.response?.data?.error || 'Gagal mereset password')
    }
    setLoading(false)
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="w-full max-w-md bg-white rounded-2xl border shadow-card p-6 text-center fade-up">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto"><Icon name="x" size={22} /></div>
          <h1 className="text-lg font-extrabold text-ink mt-3">Link tidak valid</h1>
          <p className="text-sm text-gray-500 mt-1">Link reset harus dibuka dari email yang kami kirim.</p>
          <Link to="/forgot-password" className="btn-primary w-full mt-5">Minta link baru</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="w-full max-w-md fade-up">
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_20px_60px_-20px_rgba(11,95,208,0.25)] p-6">
          <h1 className="text-xl font-extrabold text-ink tracking-tight">Buat password baru</h1>
          {done ? (
            <div className="mt-5 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto"><Icon name="check" size={22} strokeWidth={3} /></div>
              <p className="text-sm font-bold text-gray-800 mt-3">Password berhasil direset!</p>
              <p className="text-[13px] text-gray-500 mt-1">Mengalihkan ke halaman masuk…</p>
              <Link to="/login" className="btn-primary w-full mt-5">Masuk sekarang</Link>
            </div>
          ) : (
            <>
              <p className="text-[13px] text-gray-500 mt-1">Minimal 6 karakter, bedakan dari password lama.</p>
              <form onSubmit={submit} className="mt-5 space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wide mb-1.5 block">Password baru</label>
                  <div className="relative">
                    <Icon name="lock" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input type={showPw ? 'text' : 'password'} required minLength={6} value={pw} onChange={e => setPw(e.target.value)} placeholder="Min. 6 karakter" className="input-field !pl-10 !pr-11" />
                    <button type="button" onClick={() => setShowPw(v => !v)} aria-label={showPw ? 'Sembunyikan password' : 'Lihat password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0e76f1] transition-colors"><Icon name={showPw ? 'eye' : 'eyeOff'} size={18} className={showPw ? 'text-[#0e76f1]' : ''} /></button>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wide mb-1.5 block">Konfirmasi password</label>
                  <div className="relative">
                    <Icon name="lock" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input type={showPw ? 'text' : 'password'} required minLength={6} value={pw2} onChange={e => setPw2(e.target.value)} placeholder="Ulangi password baru" className="input-field !pl-10" />
                  </div>
                </div>
                {err && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-center gap-2"><Icon name="info" size={16} /> {err}</div>}
                <button className="btn-primary w-full !py-3" disabled={loading}>
                  {loading ? <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span> : 'Simpan password baru'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
