import { Link } from 'react-router-dom'

const columns = [
  {
    title: 'Kategori',
    links: [
      { label: 'Desain Grafis', to: '/explore?category=desain-grafis' },
      { label: 'Website & IT', to: '/explore?category=website-it' },
      { label: 'Video & Animasi', to: '/explore?category=video-animasi' },
      { label: 'Digital Marketing', to: '/explore?category=digital-marketing' },
    ],
  },
  {
    title: 'Perusahaan',
    links: [
      { label: 'Tentang Kami', to: '/explore' },
      { label: 'Cara Kerja', to: '/explore' },
      { label: 'Pusat Bantuan', to: '/explore' },
      { label: 'Blog', to: '/explore' },
    ],
  },
  {
    title: 'Bantuan',
    links: [
      { label: 'Keamanan & Escrow', to: '/security' },
      { label: 'Syarat & Ketentuan', to: '/terms' },
      { label: 'Kebijakan Privasi', to: '/privacy' },
      { label: 'Kontak', to: '/contact' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="bg-[#0f172a] text-gray-400 mt-14">
      <div className="h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"></div>
      <div className="max-w-[1240px] mx-auto px-4 py-8 sm:py-12 grid gap-8 sm:gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr] text-sm">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-[#0e76f1] to-[#6a3cff] flex items-center justify-center text-white font-extrabold text-lg ring-1 ring-inset ring-white/25">m</div>
            <span className="text-white font-extrabold text-lg tracking-tight">masalahta<span className="text-blue-400">.id</span></span>
          </div>
          <p className="leading-relaxed text-[13px]">Marketplace jasa freelancer terbaik di Indonesia. Temukan talent profesional untuk desain, website, dan bisnis Anda — semua aman dengan sistem escrow.</p>
          <div className="flex items-center gap-2 mt-4 text-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 font-medium">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
              Indonesia
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 font-medium">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" /></svg>
              React + Go
            </span>
          </div>
        </div>
        {columns.map(c => (
          <div key={c.title}>
            <h4 className="text-white font-bold mb-3.5 text-sm">{c.title}</h4>
            <ul className="space-y-2.5">
              {c.links.map(l => (
                <li key={l.label}><Link to={l.to} className="hover:text-white transition-colors text-[13px]">{l.label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-[1240px] mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
          <span>© 2026 masalahta.id. Semua hak dilindungi.</span>
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span> Semua sistem berjalan normal</span>
        </div>
      </div>
    </footer>
  )
}