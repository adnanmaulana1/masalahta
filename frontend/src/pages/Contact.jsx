import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import Icon from '../components/Icon'

export default function Contact() {
  const { user } = useAuth()
  const [form, setForm] = useState({ name: user?.full_name || '', email: user?.email || '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [done, setDone] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    setLoading(true)
    try {
      await api.post('/contact', form)
      setDone(true)
    } catch (e2) {
      setErr(e2.response?.data?.error || 'Gagal mengirim pesan')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-[760px] mx-auto px-4 py-8 sm:py-12">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-[#0e76f1] transition-colors dark:text-gray-400">
        <Icon name="arrowRight" size={16} className="rotate-180" /> Beranda
      </Link>
      <div className="flex items-center gap-3 mt-4">
        <span className="w-11 h-11 rounded-xl bg-blue-50 text-[#0e76f1] flex items-center justify-center"><Icon name="chat" size={22} /></span>
        <div>
          <h1 className="text-2xl font-extrabold text-ink tracking-tight dark:text-gray-100">Hubungi Kami</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Respon maksimal 3 hari kerja</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 mt-6">
        {[
          { icon: 'mail', t: 'Email', d: 'bantuan@masalahta.id' },
          { icon: 'chat', t: 'Live Chat', d: 'Senin–Jumat, 09.00–17.00' },
          { icon: 'shield', t: 'Lapor Pelanggaran', d: 'Sertakan bukti & ID order' },
        ].map(c => (
          <div key={c.t} className="rounded-2xl border border-gray-200/70 bg-white p-4 shadow-sm text-center dark:bg-slate-900">
            <span className="w-10 h-10 rounded-xl bg-blue-50 text-[#0e76f1] flex items-center justify-center mx-auto"><Icon name={c.icon} size={18} /></span>
            <div className="text-sm font-extrabold text-ink mt-2 dark:text-gray-100">{c.t}</div>
            <div className="text-xs text-gray-500 mt-0.5 dark:text-gray-400">{c.d}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-200/70 bg-white p-5 sm:p-6 shadow-sm mt-4 dark:bg-slate-900">
        {done ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto"><Icon name="check" size={22} strokeWidth={3} /></div>
            <p className="font-extrabold text-ink mt-3 dark:text-gray-100">Pesan terkirim!</p>
            <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">Tim kami akan membalas ke <span className="font-semibold text-gray-700 dark:text-gray-100">{form.email}</span> maksimal 3 hari kerja.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wide mb-1.5 block dark:text-gray-400">Nama</label>
                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nama kamu" className="input-field" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wide mb-1.5 block dark:text-gray-400">Email</label>
                <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="nama@email.com" className="input-field" />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wide mb-1.5 block dark:text-gray-400">Subjek</label>
              <input required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Contoh: Kendala pembayaran order #123" className="input-field" />
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wide mb-1.5 block dark:text-gray-400">Pesan</label>
              <textarea required minLength={10} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Ceritakan detail masalahmu (min. 10 karakter)" className="input-field h-32 resize-none" />
            </div>
            {err && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-center gap-2"><Icon name="info" size={16} /> {err}</div>}
            <button className="btn-primary w-full !py-3" disabled={loading}>
              {loading ? <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span> : <>Kirim Pesan <Icon name="send" size={16} /></>}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
