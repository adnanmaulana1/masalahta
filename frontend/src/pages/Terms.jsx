import { Link } from 'react-router-dom'
import Icon from '../components/Icon'

const SECTIONS = [
  { t: '1. Definisi Layanan', d: 'masalahta.id adalah marketplace yang mempertemukan client dengan freelancer. Kami menyediakan platform, sistem escrow, dan penyelesaian sengketa — bukan pihak yang mengerjakan project.' },
  { t: '2. Akun Pengguna', d: 'Kamu wajib memberikan data yang benar, menjaga kerahasiaan password, dan bertanggung jawab atas seluruh aktivitas di akunmu. Satu orang hanya boleh memiliki satu akun per peran.' },
  { t: '3. Jual Beli Jasa', d: 'Freelancer wajib menjelaskan lingkup kerja, harga, estimasi, dan revisi dengan jujur. Client wajib memberikan brief yang jelas dan membayar sesuai harga yang disepakati sebelum pekerjaan dimulai.' },
  { t: '4. Pembayaran & Escrow', d: 'Dana client ditahan aman (escrow) dan baru dicairkan ke freelancer setelah client menyetujui hasil. Dana dikembalikan penuh jika freelancer tidak memulai pekerjaan dalam batas waktu yang disepakati.' },
  { t: '5. Revisi & Sengketa', d: 'Revisi mengikuti jumlah yang tertera di paket. Jika terjadi perselisihan, kedua pihak wajib bermusyawarah dulu; jika buntu, tim masalahta.id menjadi penengah dan keputusannya bersifat final.' },
  { t: '6. Larangan', d: 'Dilarang menipu, memalsukan portofolio, transaksi di luar platform untuk menghindari biaya layanan, mengunggah konten ilegal, serta melakukan spam atau pelecehan.' },
  { t: '7. Penangguhan Akun', d: 'Pelanggaran berulang atau berat berakibat peringatan, pembekuan sementara, hingga penutupan akun permanen beserta penahanan dana yang sedang disengketakan.' },
  { t: '8. Perubahan Ketentuan', d: 'Ketentuan ini dapat diperbarui sewaktu-waktu. Perubahan penting akan diumumkan lewat notifikasi atau email, dan penggunaan layanan setelahnya dianggap sebagai persetujuan.' },
]

export default function Terms() {
  return (
    <div className="max-w-[760px] mx-auto px-4 py-8 sm:py-12">
      <Link to="/register" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-[#0e76f1] transition-colors dark:text-gray-400">
        <Icon name="arrowRight" size={16} className="rotate-180" /> Kembali
      </Link>
      <div className="flex items-center gap-3 mt-4">
        <span className="w-11 h-11 rounded-xl bg-blue-50 text-[#0e76f1] flex items-center justify-center"><Icon name="shield" size={22} /></span>
        <div>
          <h1 className="text-2xl font-extrabold text-ink tracking-tight dark:text-gray-100">Syarat & Ketentuan</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Terakhir diperbarui: September 2026</p>
        </div>
      </div>
      <div className="mt-6 space-y-4">
        {SECTIONS.map(s => (
          <div key={s.t} className="rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm dark:bg-slate-900">
            <h2 className="font-extrabold text-ink dark:text-gray-100">{s.t}</h2>
            <p className="text-sm text-gray-600 leading-relaxed mt-1.5 dark:text-gray-400">{s.d}</p>
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-500 mt-6 text-center dark:text-gray-400">Ada pertanyaan? Hubungi <span className="font-bold text-[#0e76f1]">bantuan@masalahta.id</span></p>
    </div>
  )
}
