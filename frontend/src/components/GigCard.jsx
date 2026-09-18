import { Link } from 'react-router-dom'
import { formatIDR, parseImages } from '../utils/format'
import Stars from './Stars'
import Icon from './Icon'
import { useWishlist } from '../context/WishlistContext'

export default function GigCard({ gig, index = 0 }) {
  const images = parseImages(gig.images)
  const img = images[0] || 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400'
  const price = gig.packages?.[0]?.price || 150000
  const user = gig.user || {}
  const style = { animationDelay: `${index * 60}ms` }
  const { has, toggle } = useWishlist()
  const saved = has(gig.id)

  return (
    <Link
      to={`/gig/${gig.slug}`}
      style={style}
      className="group overflow-hidden flex flex-col fade-up rounded-[20px] border border-gray-200/70 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(16,24,40,0.10)] hover:border-blue-200"
    >
      <div className="relative aspect-[1/1] sm:aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={img}
          alt={gig.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <span className="absolute inset-0 hidden md:flex items-center justify-center opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none">
          <span className="rounded-full bg-white/95 backdrop-blur px-5 py-2.5 text-xs font-extrabold text-[#0e76f1] shadow-lift">
            Lihat Detail
          </span>
        </span>
        {/* top pills like screenshot */}
        <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-gray-700 shadow-md">
          {gig.category?.icon} {gig.category?.name || 'Jasa'}
        </span>
        <button
          onClick={e => { e.preventDefault(); toggle(gig.id) }}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-md ${saved ? 'bg-red-500 text-white' : 'bg-white text-gray-400 hover:text-red-500'}`}
          title={saved ? 'Hapus dari favorit' : 'Simpan ke favorit'}
        >
          <Icon name="heart" size={16} fill={saved ? 'currentColor' : 'none'} />
        </button>
        <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 bg-black/45 backdrop-blur-md text-white text-[11px] font-bold rounded-full px-2.5 py-1">
          <Icon name="eye" size={12} className="text-white/90" /> {(gig.view_count || 5001).toLocaleString('id-ID')}
        </span>
      </div>

      <div className="p-3.5 flex-1 flex flex-col">
        <div className="flex items-center gap-1.5 min-w-0">
          <img src={user.avatar} alt="" className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover shrink-0" loading="lazy" onError={e => e.target.style.display = 'none'} />
          <span className="text-[11px] sm:text-[12px] font-semibold text-gray-700 truncate flex-1 min-w-0">{user.full_name || user.username || 'Freelancer'}</span>
          <span className="flex items-center gap-1 shrink-0">
            <Icon name="starFill" size={12} className="text-amber-400" fill="currentColor" strokeWidth={0} />
            <span className="text-[11px] sm:text-[13px] font-bold text-ink">{Number(gig.rating || 4.9).toFixed(1)}</span>
          </span>
        </div>

        <h3 className="mt-2 text-[13px] font-bold leading-snug text-ink line-clamp-2 min-h-[36px] group-hover:text-[#0e76f1] transition-colors">{gig.title}</h3>

        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="text-[11px] text-gray-400 font-medium">Mulai dari</div>
          <div className="font-extrabold text-[15px] text-[#0e76f1] leading-none mt-1">{formatIDR(price)}</div>
        </div>
      </div>
    </Link>
  )
}