import { Link } from 'react-router-dom'
import Icon from '../components/Icon'

const SECTIONS = [
  { t: '1. Data yang Kami Kumpulkan', d: 'Nama, username, email, nomor HP, lokasi, bio, keahlian, foto profil, serta data transaksi (riwayat order, pembayaran via escrow) dan data teknis (perangkat, log aktivitas).' },
  { t: '2. Penggunaan Data', d: 'Data dipakai untuk menjalankan layanan: verifikasi akun, memproses order dan pembayaran, menampilkan profil ke calon client/freelancer, mencegah penipuan, dan mengirim notifikasi penting.' },
  { t: '3. Berbagi Data', d: 'Profil publikmu (nama, foto, rating, portofolio) terlihat semua pengunjung. Data pembayaran hanya dibagikan ke penyedia pembayaran resmi. Kami tidak menjual datamu ke pihak ketiga.' },
  { t: '4. Keamanan', d: 'Password disimpan dalam bentuk hash bcrypt, akses admin dibatasi, dan koneksi dilindungi enkripsi. Meski begitu, tidak ada sistem yang 100% kebal — segera laporkan jika menemukan aktivitas mencurigakan.' },
  { t: '5. Hak Kamu', d: 'Kamu bisa melihat, mengoreksi, dan meminta penghapusan data pribadimu lewat halaman dashboard atau email ke kami. Penarikan persetujuan tertentu bisa membatasi sebagian fungsi layanan.' },
  { t: '6. Cookie', d: 'Kami memakai penyimpanan lokal browser untuk sesi login dan preferensi (mis. filter). Kamu bisa menghapusnya kapan saja lewat pengaturan browser, tapi kamu akan keluar dari akun.' },
  { t: '7. Penyimpanan & Penghapusan', d: 'Data disimpan selama akun aktif. Akun yang dihapus akan dianonimkan dalam 30 hari, kecuali data transaksi yang wajib disimpan untuk keperluan hukum dan audit.' },
  { t: '8. Kontak', d: 'Pertanyaan soal privasi: kirim email ke privasi@masalahta.id. Kami merespons maksimal 3 hari kerja.' },
]

export default function Privacy() {
  return (
    <div className="max-w-[760px] mx-auto px-4 py-8 sm:py-12">
      <Link to="/register" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-[#0e76f1] transition-colors dark:text-gray-400">
        <Icon name="arrowRight" size={16} className="rotate-180" /> Kembali
      </Link>
      <div className="flex items-center gap-3 mt-4">
        <span className="w-11 h-11 rounded-xl bg-violet-50 text-[#6a3cff] flex items-center justify-center"><Icon name="lock" size={22} /></span>
        <div>
          <h1 className="text-2xl font-extrabold text-ink tracking-tight dark:text-gray-100">Kebijakan Privasi</h1>
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
    </div>
  )
}
