import { Link } from 'react-router-dom'
import Icon from '../components/Icon'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-md fade-up">
        <div className="text-[80px] sm:text-[100px] font-extrabold leading-none bg-gradient-to-r from-[#0e76f1] to-[#6a3cff] bg-clip-text text-transparent">404</div>
        <h1 className="text-xl font-extrabold text-ink mt-2 dark:text-gray-100">Halaman tidak ditemukan</h1>
        <p className="text-sm text-gray-500 mt-2 dark:text-gray-400">Alamat yang kamu tuju salah atau sudah dipindahkan. Yuk kembali ke jalan yang benar.</p>
        <div className="mt-6 flex flex-col sm:flex-row gap-2.5 justify-center">
          <Link to="/" className="btn-primary"><Icon name="home" size={16} /> Ke Beranda</Link>
          <Link to="/explore" className="btn-outline"><Icon name="search" size={16} /> Jelajahi Jasa</Link>
        </div>
      </div>
    </div>
  )
}
