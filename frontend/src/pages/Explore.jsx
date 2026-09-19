import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../utils/api'
import GigCard from '../components/GigCard'
import Icon from '../components/Icon'

function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-[4/3] skeleton m-0 rounded-none" />
      <div className="p-4 space-y-2.5"><div className="flex gap-2"><div className="w-6 h-6 skeleton rounded-full" /><div className="flex-1 h-3 skeleton" /></div><div className="h-3.5 skeleton w-4/5" /><div className="h-5 skeleton w-1/3" /></div>
    </div>
  )
}

const sorts = [
  { v: '', l: 'Terbaru' },
  { v: 'terlaris', l: 'Terlaris' },
  { v: 'rating', l: 'Rating Tertinggi' },
]

export default function Explore() {
  const [params, setParams] = useSearchParams()
  const [gigs, setGigs] = useState([])
  const [cats, setCats] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showFilter, setShowFilter] = useState(false)

  const q = params.get('q') || ''
  const category = params.get('category') || ''
  const sort = params.get('sort') || ''
  const [search, setSearch] = useState(q)

  useEffect(() => { setSearch(q) }, [q])
  useEffect(() => { api.get('/categories').then(r => setCats(r.data.data || [])).catch(() => {}) }, [])

  useEffect(() => {
    setLoading(true)
    const query = new URLSearchParams({ q, category, sort, limit: 12 }).toString()
    api.get(`/gigs?${query}`).then(r => { setGigs(r.data.data || []); setTotal(r.data.total || 0) }).catch(() => {}).finally(() => setLoading(false))
  }, [q, category, sort])

  useEffect(() => {
    const t = setTimeout(() => { if (search.trim() !== q) update({ q: search.trim() }) }, 450)
    return () => clearTimeout(t)
  }, [search])

  const update = (patch) => {
    const next = {}
    if (patch.q !== undefined) next.q = patch.q
    else if (q) next.q = q
    if (patch.category !== undefined && patch.category) next.category = patch.category
    if (patch.sort !== undefined && patch.sort) next.sort = patch.sort
    setParams(next)
  }

  const catAll = { id: 0, name: 'Semua Kategori', slug: '', icon: '🗂️' }

  return (
    <div className="max-w-[1240px] mx-auto px-4 py-6">
      {/* results header */}
      <div className="flex flex-wrap items-center gap-3 mb-4 fade-up">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20 shrink-0">
          <Icon name="search" size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-base md:text-xl font-extrabold text-ink leading-tight truncate dark:text-gray-100">
            {q ? `Hasil pencarian "` : 'Jelajahi Jasa '}
            {q && <span className="text-[#0e76f1]">{q}</span>}{q ? '"' : category || ''}
          </h1>
          <p className="text-xs md:text-[13px] text-gray-500 dark:text-gray-400">{loading ? 'Memuat...' : `${total} jasa ditemukan`}</p>
        </div>
      </div>

      {/* in-page search */}
      <div className="relative flex items-center gap-2 bg-white rounded-2xl border border-gray-200/80 dark:border-white/10 px-3.5 py-2.5 focus-within:border-[#0e76f1] focus-within:ring-4 focus-within:ring-blue-500/10 transition-all mb-3 dark:bg-slate-900">
        <Icon name="search" size={18} className="text-gray-400 shrink-0" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari jasa, contoh: desain logo, website..."
          className="flex-1 min-w-0 bg-transparent outline-none text-sm text-ink placeholder:text-gray-400 dark:placeholder-gray-500 dark:text-slate-300"
        />
        {search && (
          <button type="button" onClick={() => setSearch('')} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><Icon name="x" size={16} /></button>
        )}
      </div>

      {/* active filter chips */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto no-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0">
        <button onClick={() => setShowFilter(!showFilter)} className="lg:hidden tag shrink-0">
          <Icon name="sliders" size={14} /> Filter
        </button>
        {category && (
          <button onClick={() => update({ category: '' })} className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-[#0e76f1] dark:text-blue-400 border border-blue-200 dark:border-blue-500/25 px-3 py-1.5 text-xs font-semibold">
            {cats.find(c => c.slug === category)?.icon} {cats.find(c => c.slug === category)?.name} <Icon name="x" size={12} />
          </button>
        )}
        {q && (
          <button onClick={() => update({ q: '' })} className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-[#0e76f1] dark:text-blue-400 border border-blue-200 dark:border-blue-500/25 px-3 py-1.5 text-xs font-semibold">
            "{q}" <Icon name="x" size={12} />
          </button>
        )}
        <div className="ml-auto shrink-0 flex items-center gap-2">
          <span className="text-xs text-gray-400 hidden md:inline">Urutkan</span>
          <select
            value={sort}
            onChange={e => update({ sort: e.target.value })}
            className="input-field !w-auto !py-2 !px-3 !text-xs font-medium !rounded-full cursor-pointer dark:!text-slate-300 [&>option]:dark:bg-slate-900 [&>option]:dark:text-slate-300"
          >
            {sorts.map(s => <option key={s.v} value={s.v}>{s.l}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-6">
        {/* desktop sidebar */}
        <aside className="hidden lg:block w-[230px] shrink-0">
          <div className="card p-4 sticky top-28 max-h-[calc(100vh-8rem)] overflow-auto">
            <h3 className="font-bold text-sm mb-3 px-1 dark:text-slate-300">Kategori</h3>
            <div className="space-y-0.5">
              <button
                onClick={() => update({ category: '' })}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors ${!category ? 'bg-blue-50 dark:bg-blue-500/10 text-[#0e76f1] dark:text-blue-400 font-bold' : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/5'}`}
              >
                🗂️ Semua Kategori
              </button>
              {cats.map(c => (
                <button
                  key={c.id}
                  onClick={() => update({ category: c.slug })}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors ${category === c.slug ? 'bg-blue-50 dark:bg-blue-500/10 text-[#0e76f1] dark:text-blue-400 font-bold' : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                >
                  <span>{c.icon}</span> {c.name}
                </button>
              ))}
            </div>
            <div className="mt-5 pt-4 border-t dark:border-white/10">
              <h3 className="font-bold text-sm mb-2.5 px-1 dark:text-slate-300">Informasi</h3>
              <div className="space-y-2 text-[12px] text-gray-500 px-1 dark:text-gray-400">
                <div className="flex items-center gap-2"><Icon name="verified" size={14} className="text-emerald-500" /> Freelancer terverifikasi</div>
                <div className="flex items-center gap-2"><Icon name="shield" size={14} className="text-[#0e76f1]" /> Dana aman via escrow</div>
                <div className="flex items-center gap-2"><Icon name="clock" size={14} className="text-amber-500" /> Respon cepat &lt; 1 jam</div>
              </div>
            </div>
          </div>
        </aside>

        {/* mobile filter drawer */}
        {showFilter && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40 slide-in-left-face" onClick={() => setShowFilter(false)}></div>
            <div className="absolute left-0 top-0 bottom-0 w-[80%] max-w-[300px] bg-white shadow-2xl p-5 overflow-auto slide-in-left z-10 dark:bg-slate-900">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-ink dark:text-gray-100">Kategori</h3>
                <button onClick={() => setShowFilter(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10"><Icon name="x" size={18} /></button>
              </div>
              <div className="space-y-1">
                {[catAll, ...cats].map(c => (
                  <button key={c.id} onClick={() => { update({ category: c.slug }); setShowFilter(false) }}
                          className={`w-full flex items-center gap-2.5 px-3 py-3 rounded-xl text-sm font-medium ${category === c.slug ? 'bg-blue-50 dark:bg-blue-500/10 text-[#0e76f1] dark:text-blue-400 font-bold' : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/5'}`}>
                    <span>{c.icon}</span> {c.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* grid */}
        <div className="flex-1">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {loading ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
              : gigs.map((g, i) => <GigCard key={g.id} gig={g} index={i} />)}
          </div>
          {!loading && gigs.length === 0 && (
            <div className="card p-12 text-center mt-2">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center mb-4 text-gray-400"><Icon name="search" size={28} /></div>
              <h3 className="font-bold text-ink mb-1 dark:text-gray-100">Tidak ada jasa ditemukan</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Coba kata kunci lain atau jelajahi semua kategori.</p>
              <button onClick={() => update({ q: '', category: '' })} className="btn-primary mt-5 !py-2.5">Lihat Semua Jasa</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}