import { Link } from 'react-router-dom'
import Icon from '../components/Icon'

export default function Forbidden() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-md fade-up">
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto"><Icon name="lock" size={30} /></div>
        <div className="text-5xl font-extrabold text-ink mt-4">403</div>
        <h1 className="text-xl font-extrabold text-ink mt-1">Akses ditolak</h1>
        <p className="text-sm text-gray-500 mt-2">Kamu tidak punya izin membuka halaman ini.</p>
        <div className="mt-6 flex flex-col sm:flex-row gap-2.5 justify-center">
          <Link to="/" className="btn-primary"><Icon name="home" size={16} /> Ke Beranda</Link>
          <Link to="/dashboard" className="btn-outline">Ke Dashboard</Link>
        </div>
      </div>
    </div>
  )
}
