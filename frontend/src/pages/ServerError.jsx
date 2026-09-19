import { Link } from 'react-router-dom'
import Icon from '../components/Icon'

export default function ServerError({ onRetry }) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-md fade-up">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto"><Icon name="info" size={30} /></div>
        <div className="text-5xl font-extrabold text-ink mt-4 dark:text-gray-100">500</div>
        <h1 className="text-xl font-extrabold text-ink mt-1 dark:text-gray-100">Server sedang bermasalah</h1>
        <p className="text-sm text-gray-500 mt-2 dark:text-gray-400">Terjadi kesalahan di sisi kami. Coba muat ulang, atau kembali lagi beberapa saat.</p>
        <div className="mt-6 flex flex-col sm:flex-row gap-2.5 justify-center">
          {onRetry
            ? <button onClick={onRetry} className="btn-primary">Muat ulang</button>
            : <button onClick={() => window.location.reload()} className="btn-primary">Muat ulang</button>}
          <Link to="/" className="btn-outline">Ke Beranda</Link>
        </div>
      </div>
    </div>
  )
}
