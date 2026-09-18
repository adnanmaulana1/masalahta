import { Link } from 'react-router-dom'
import { formatIDR, parseImages } from '../utils/format'
import Stars from './Stars'
import Icon from './Icon'

export default function GigCard({ gig, index = 0 }) {
  const images = parseImages(gig.images)
  const img = images[0] || 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400'
  const price = gig.packages?.[0]?.price || 150000
  const user = gig.user || {}
  const style = { animationDelay: `${index * 60}ms` }

  return (
    <Link
      to={`/gig/${gig.slug}`}
      style={style}
      className="card group overflow-hidden flex flex-col fade-up transition-all duration-300 hover:-translate-y-1 hover:shadow-lift hover:border-blue-200"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
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
        <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur px-2.5 py-1 text-[11px] font-bold text-gray-700 shadow-sm">
          {gig.category?.icon} {gig.category?.name || 'Jasa'}
        </span>
        <button
          onClick={e => e.preventDefault()}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors shadow-sm"
          title="Simpan"
        >
          <Icon name="heart" size={16} />
        </button>
        <span className="absolute bottom-2.5 left-2.5 text-[11px] font-medium text-white/90 flex items-center gap-1 bg-black/35 backdrop-blur rounded-full px-2 py-0.5">
          <Icon name="eye" size={12} /> {gig.view_count?.toLocaleString('id-ID')}
        </span>
      </div>

      <div className="p-3 sm:p-4 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-2 sm:mb-2.5">
          <img src={user.avatar} alt="" className="w-6 h-6 rounded-full ring-1 ring-gray-200 object-cover" loading="lazy" onError={e => e.target.style.display = 'none'} />
          <span className="text-[12px] font-semibold text-gray-700 truncate">{user.full_name || user.username}</span>
          <Icon name="verified" size={14} className="text-[#0e76f1] shrink-0 hidden sm:inline-block" />
          <span className="ml-auto flex items-center gap-1 text-[12px] font-medium shrink-0">
            <span className="text-amber-500"><Stars rating={gig.rating} size={11} /></span>
            <span className="text-gray-600">{Number(gig.rating).toFixed(1)}</span>
            <span className="text-gray-400 hidden sm:inline">({gig.review_count})</span>
          </span>
        </div>

        <h3 className="text-[12.5px] sm:text-[13px] font-semibold leading-snug text-ink line-clamp-2 flex-1 group-hover:text-[#0e76f1] transition-colors">{gig.title}</h3>

        <div className="mt-3 sm:mt-3.5 pt-2.5 sm:pt-3 border-t flex items-end justify-between">
          <div>
            <div className="text-[10px] sm:text-[11px] text-gray-400 font-medium">Mulai dari</div>
            <div className="font-extrabold text-[13px] sm:text-[15px] text-[#0e76f1]">{formatIDR(price)}</div>
          </div>
          <span className="hidden sm:flex items-center gap-1 text-[12px] font-semibold text-gray-600 group-hover:gap-2 group-hover:text-[#0e76f1] transition-all">
            Detail <Icon name="arrowRight" size={14} />
          </span>
        </div>
      </div>
    </Link>
  )
}