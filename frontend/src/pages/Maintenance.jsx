import Icon from '../components/Icon'

export default function Maintenance() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="text-center max-w-md fade-up bg-white rounded-2xl border shadow-card p-8 dark:bg-slate-900">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#0e76f1] flex items-center justify-center mx-auto animate-float"><Icon name="shield" size={30} /></div>
        <h1 className="text-xl font-extrabold text-ink mt-4 dark:text-gray-100">Sedang perawatan</h1>
        <p className="text-sm text-gray-500 mt-2 dark:text-gray-400">masalahta.id lagi di-upgrade biar makin ngebut. Balik lagi sebentar ya.</p>
        <button onClick={() => window.location.reload()} className="btn-primary mt-6 w-full">Cek lagi</button>
      </div>
    </div>
  )
}
