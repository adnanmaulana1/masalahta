import { Link } from 'react-router-dom'
import Icon from '../components/Icon'

const STEPS = [
  { icon: 'wallet', t: 'Client membayar ke escrow', d: 'Dana ditahan aman oleh masalahta.id, bukan langsung ke freelancer.' },
  { icon: 'briefcase', t: 'Freelancer mengerjakan', d: 'Pekerjaan dimulai dengan brief jelas, progres bisa dipantau.' },
  { icon: 'verified', t: 'Client menyetujui hasil', d: 'Revisi sampai puas. Dana dicairkan setelah kamu approve.' },
]

const ITEMS = [
  { icon: 'shield', t: 'Dana kembali 100%', d: 'Jika freelancer tidak memulai pekerjaan sesuai kesepakatan, danamu kembali penuh otomatis.' },
  { icon: 'lock', t: 'Pembayaran terenkripsi', d: 'Seluruh transaksi lewat jalur aman. Password tersimpan sebagai hash, bukan teks asli.' },
  { icon: 'check', t: 'Freelancer terverifikasi', d: 'Identitas dan keahlian freelancer dicek sebelum bisa menerima order.' },
  { icon: 'chat', t: 'Mediasi sengketa', d: 'Tim kami menengahi jika terjadi perselisihan, dengan keputusan yang adil dan final.' },
]

export default function Security() {
  return (
    <div className="max-w-[760px] mx-auto px-4 py-8 sm:py-12">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-[#0e76f1] transition-colors">
        <Icon name="arrowRight" size={16} className="rotate-180" /> Beranda
      </Link>
      <div className="flex items-center gap-3 mt-4">
        <span className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><Icon name="shield" size={22} /></span>
        <div>
          <h1 className="text-2xl font-extrabold text-ink tracking-tight">Keamanan & Escrow</h1>
          <p className="text-sm text-gray-500">Uangmu aman sampai pekerjaan benar-benar selesai</p>
        </div>
      </div>

      <div className="relative mt-8">
        <span className="hidden sm:block absolute top-8 left-[16%] right-[16%] h-0.5 rounded-full bg-emerald-100" aria-hidden="true"></span>
        <div className="relative grid sm:grid-cols-3 gap-6">
          {STEPS.map((s, i) => (
            <div key={s.t} className="text-center">
              <div className="relative inline-flex">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 ring-4 ring-emerald-100 flex items-center justify-center bg-white relative z-10">
                  <Icon name={s.icon} size={26} />
                </div>
                <span className="absolute -top-2 -right-2 z-20 bg-emerald-500 text-white text-[11px] font-extrabold w-7 h-7 rounded-full flex items-center justify-center shadow-md ring-4 ring-white">{i + 1}</span>
              </div>
              <h2 className="font-extrabold text-ink mt-3 text-[15px]">{s.t}</h2>
              <p className="text-[13px] text-gray-500 leading-relaxed mt-1">{s.d}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 grid sm:grid-cols-2 gap-3">
        {ITEMS.map(s => (
          <div key={s.t} className="rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm">
            <span className="w-10 h-10 rounded-xl bg-blue-50 text-[#0e76f1] flex items-center justify-center"><Icon name={s.icon} size={19} /></span>
            <h2 className="font-extrabold text-ink mt-3">{s.t}</h2>
            <p className="text-sm text-gray-600 leading-relaxed mt-1">{s.d}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto">
        <Link to="/explore" className="btn-primary flex-1 !py-3.5">Mulai Cari Jasa</Link>
        <Link to="/terms" className="btn-outline flex-1 !py-3.5">Baca S&K</Link>
      </div>
    </div>
  )
}
