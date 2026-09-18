import { useEffect, useState } from 'react'
import Icon from './Icon'

export default function OfflineBanner() {
  const [online, setOnline] = useState(navigator.onLine)

  useEffect(() => {
    const up = () => setOnline(true)
    const down = () => setOnline(false)
    window.addEventListener('online', up)
    window.addEventListener('offline', down)
    return () => {
      window.removeEventListener('online', up)
      window.removeEventListener('offline', down)
    }
  }, [])

  if (online) return null

  return (
    <div className="sticky top-0 z-[60] bg-amber-500 text-white text-sm font-semibold px-4 py-2.5 flex items-center justify-center gap-2">
      <Icon name="info" size={16} /> Kamu sedang offline — beberapa fitur tidak tersedia
      <button onClick={() => window.location.reload()} className="underline font-bold hover:no-underline">Coba lagi</button>
    </div>
  )
}
