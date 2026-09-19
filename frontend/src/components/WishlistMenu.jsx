import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import Icon from './Icon'
import { formatIDR, parseImages } from '../utils/format'
import { useWishlist } from '../context/WishlistContext'

export default function WishlistMenu() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const { ids, toggle } = useWishlist()
  const ref = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    api.get('/wishlist').then(r => setItems(r.data.data || [])).catch(() => {})
  }, [open, ids])

  const remove = (id) => toggle(id)

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        title="Favorit"
        aria-expanded={open}
        className={`relative p-2.5 rounded-full transition-colors ${open ? 'bg-red-50 dark:bg-red-500/10 text-red-500' : 'hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400'}`}
      >
        <Icon name="heart" size={20} fill={ids.size > 0 ? 'currentColor' : 'none'} className={ids.size > 0 ? 'text-red-500' : ''} />
        {ids.size > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
            {ids.size > 9 ? '9+' : ids.size}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2.5 w-[360px] max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-white/10 shadow-lift overflow-hidden fade-up z-50">
          <div className="flex items-center gap-2 px-4 pt-4 pb-3">
            <h3 className="font-extrabold text-ink dark:text-gray-100">Favorit</h3>
            {items.length > 0 && (
              <span className="text-[11px] font-bold bg-red-50 dark:bg-red-500/10 text-red-500 rounded-full px-2 py-0.5">{items.length} jasa</span>
            )}
          </div>

          <div className="max-h-[380px] overflow-auto">
            {items.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 dark:text-gray-400 mb-3">
                  <Icon name="heart" size={24} />
                </div>
                <div className="font-bold text-ink dark:text-gray-100 text-sm">Belum ada favorit</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Ketuk ikon hati di jasa yang kamu suka.</div>
              </div>
            ) : items.slice(0, 6).map((g) => (
              <div
                key={g.id}
                className="w-full flex gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-white/10"
              >
                <button onClick={() => { setOpen(false); navigate(`/gig/${g.slug}`) }} className="w-16 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-100 dark:bg-white/5">
                  <img src={parseImages(g.images)[0]} alt="" className="w-full h-full object-cover" loading="lazy" onError={e => e.target.style.display = 'none'} />
                </button>
                <button onClick={() => { setOpen(false); navigate(`/gig/${g.slug}`) }} className="flex-1 min-w-0 text-left">
                  <span className="block text-[13px] font-bold text-ink dark:text-gray-100 leading-snug line-clamp-2">{g.title}</span>
                  <span className="block text-xs font-extrabold text-[#0e76f1] mt-1">{formatIDR(g.packages?.[0]?.price)}</span>
                </button>
                <button onClick={() => remove(g.id)} title="Hapus dari favorit" className="p-1.5 rounded-full text-gray-300 dark:text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors shrink-0 self-start">
                  <Icon name="x" size={15} />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={() => { setOpen(false); navigate('/dashboard?tab=favorit') }}
            className="w-full flex items-center justify-center gap-1.5 px-4 py-3 text-sm font-bold text-[#0e76f1] hover:bg-blue-50 dark:hover:bg-blue-500/10 border-t border-gray-200 dark:border-white/10 transition-colors"
          >
            Lihat semua favorit <Icon name="arrowRight" size={15} />
          </button>
        </div>
      )}
    </div>
  )
}
