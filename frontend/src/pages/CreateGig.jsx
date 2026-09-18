import { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import Icon from '../components/Icon'
import { formatIDR } from '../utils/format'
import { showToast } from '../components/Toast'
import Stars from '../components/Stars'

const EMPTY_PKG = { name: 'Basic', description: 'Paket hemat untuk kebutuhan dasar', price: 150000, delivery_days: 3, revisions: 2, features: ['1 Konsep', '2 x Revisi', 'File JPG / PNG'] }
const PKG_OPTIONS = [
  { name: 'Basic', desc: 'Paket hemat untuk kebutuhan dasar', color: 'from-blue-500 to-indigo-600' },
  { name: 'Standard', desc: 'Paling populer, nilai terbaik', color: 'from-[#ff6b00] to-[#ff9f2e]' },
  { name: 'Premium', desc: 'All-in, hasil maksimal', color: 'from-violet-500 to-purple-600' },
]

export default function CreateGig() {
  const { user } = useAuth()
  const nav = useNavigate()
  const [cats, setCats] = useState([])
  const [form, setForm] = useState({ title: '', description: '', category_id: '' })
  const [images, setImages] = useState([])
  const [packages, setPackages] = useState([{ ...EMPTY_PKG }])
  const [usePackages, setUsePackages] = useState(true)
  const [noPrice, setNoPrice] = useState(150000)
  const [activePkg, setActivePkg] = useState(0)
  const [saving, setSaving] = useState(false)
  const imgRef = useRef(null)

  useEffect(() => { api.get('/categories').then(r => setCats(r.data.data || [])).catch(() => {}) }, [])

  const updatePkg = (i, patch) => setPackages(p => p.map((x, idx) => idx === i ? { ...x, ...patch } : x))
  const addPkg = () => {
    const next = PKG_OPTIONS[packages.length]
    if (!next) return
    setPackages(p => [...p, { name: next.name, description: next.desc, price: packages[packages.length - 1].price * 2, delivery_days: 2, revisions: 5, features: [] }])
    setActivePkg(packages.length)
  }
  const removePkg = (i) => { setPackages(p => p.filter((_, idx) => idx !== i)); setActivePkg(Math.max(0, i - 1)) }

  const compressImage = (file, max = 800) => new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height))
        const c = document.createElement('canvas')
        c.width = Math.round(img.width * scale)
        c.height = Math.round(img.height * scale)
        c.getContext('2d')?.drawImage(img, 0, 0, c.width, c.height)
        resolve(c.toDataURL('image/jpeg', 0.8))
      }
      img.onerror = () => resolve(null)
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })

  const onFiles = async (files) => {
    const remaining = 8 - images.length
    if (remaining <= 0) return
    const slice = [...files].slice(0, remaining)
    const results = await Promise.all(slice.map(f => compressImage(f)))
    setImages(prev => [...prev, ...results.filter(Boolean)])
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!user) { showToast('Login dulu untuk membuat jasa', 'error'); nav('/login'); return }
    setSaving(true)
    try {
      const payload = {
        title: form.title,
        description: form.description,
        category_id: Number(form.category_id),
        images,
        packages: usePackages ? packages.map(p => ({ ...p, features: p.features.filter(Boolean) })) : [{ name: 'Harga', description: 'Harga langsung', price: noPrice || 0, delivery_days: 0, revisions: 0, features: [] }],
      }
      const res = await api.post('/gigs', payload)
      showToast('Jasa berhasil dipublish!')
      setTimeout(() => nav(`/gig/${res.data.slug}`), 600)
    } catch (e2) {
      showToast(e2.response?.data?.error || 'Gagal membuat jasa', 'error')
    }
    setSaving(false)
  }

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-6 grid lg:grid-cols-[1fr_340px] gap-6 items-start">
      <form onSubmit={submit} className="space-y-4">
        <div className="rounded-3xl bg-gradient-to-br from-blue-50 via-white to-indigo-100 text-ink p-5 sm:p-6 relative overflow-hidden border border-blue-100 shadow-sm">
          <div className="absolute -top-16 -right-8 w-56 h-56 rounded-full bg-blue-100/50 blur-3xl"></div>
          <div className="absolute -bottom-24 -left-12 w-52 h-52 rounded-full bg-violet-100/50 blur-3xl"></div>
          <div className="relative flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
              <Icon name="plus" size={22} strokeWidth={3} className="text-[#0e76f1]" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-extrabold">Buat Jasa Baru</h1>
              <p className="text-[12.5px] text-gray-500 mt-1 leading-relaxed">Isi jasa & paketmu selengkap mungkin. Semakin jelas informasinya, semakin mudah ditemukan dan dipercaya calon client.</p>
              <p className="text-[12.5px] text-gray-500 mt-1 leading-relaxed">Tips: gunakan judul yang menarik, foto jasa yang rapi, dan paket harga yang jelas agar jasa terlihat profesional.</p>
            </div>
          </div>
        </div>

        <div className="card p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-100">
            <span className="w-7 h-7 rounded-lg bg-blue-50 text-[#0e76f1] flex items-center justify-center text-[12px] font-extrabold">1</span>
            <h2 className="font-extrabold text-ink">Informasi Jasa</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 block">Judul Jasa <span className="text-red-500">*</span></label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Contoh: Jasa Desain Logo Modern Minimalis Premium" className="input-field" required />
              <p className="text-[11px] text-gray-400 mt-1 text-right">{form.title.length}/80</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 block">Kategori <span className="text-red-500">*</span></label>
                <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} className="input-field cursor-pointer" required>
                  <option value="">Pilih Kategori</option>
                  {cats.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 block">Gambar Jasa (maks. 8)</label>
                <input ref={imgRef} type="file" accept="image/*" multiple className="hidden" onChange={e => { onFiles(e.target.files); e.target.value = '' }} />
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
                  {images.map((src, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-100 group">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                              className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity text-white">
                        <Icon name="trash" size={18} />
                      </button>
                    </div>
                  ))}
                  {images.length < 8 && (
                    <button type="button" onClick={() => imgRef.current?.click()}
                            className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-[#0e76f1] hover:text-[#0e76f1] transition-colors">
                      <Icon name="image" size={20} />
                      <span className="text-[10px] font-bold mt-1">{images.length === 0 ? 'Upload' : '+'}</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 mt-1.5">Klik atau seret gambar. Maks 8 gambar, format JPG/PNG.</p>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 block">Deskripsi <span className="text-red-500">*</span></label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Ceritakan detail jasa: apa yang kamu berikan, hasil akhir, keunggulan, target customer, dll." className="input-field h-32 resize-none" required maxLength={1000} />
              <p className="text-[11px] text-gray-400 mt-1 text-right">{form.description.length}/1000</p>
            </div>
          </div>
        </div>

        {/* packages */}
        <div className="card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100 gap-3">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center text-[12px] font-extrabold">2</span>
              <div>
                <h2 className="font-extrabold text-ink">Paket Harga</h2>
                <p className="text-xs text-gray-400 mt-0.5">Tambahkan paket agar pembeli punya pilihan</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <label className="relative inline-flex items-center cursor-pointer select-none" title={usePackages ? 'Nonaktifkan paket' : 'Aktifkan paket'}>
                <input type="checkbox" className="sr-only peer" checked={usePackages} onChange={() => setUsePackages(v => !v)} />
                <div className="w-10 h-6 rounded-full bg-gray-200 peer-checked:bg-[#0e76f1] transition-colors shadow-inner"></div>
                <div className="absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white shadow ring-0 peer-checked:ring-0 transition-transform translate-x-0 peer-checked:translate-x-4"></div>
              </label>
              <button type="button" onClick={addPkg} disabled={packages.length >= 3 || !usePackages} className="tag font-bold !text-[#0e76f1] !border-blue-200 hover:!bg-blue-50 disabled:opacity-40"><Icon name="plus" size={14} strokeWidth={3} /> Tambah</button>
            </div>
          </div>

          {!usePackages ? (
            <div className="py-2">
              <label className="text-[11px] font-bold text-gray-500 mb-1 block">Harga Jasa (Rp) *</label>
              <input type="number" value={noPrice} onChange={e => setNoPrice(Number(e.target.value))} className="input-field" min={0} required />
            </div>
          ) : packages.map((p, i) => {
            const opt = PKG_OPTIONS.find(o => o.name === p.name) || PKG_OPTIONS[0]

  return (
              <div key={i} className={`rounded-xl mb-3 overflow-hidden transition-all ${activePkg === i ? 'ring-2 ring-[#0e76f1] shadow-glow' : 'border border-gray-200 hover:border-gray-300'}`}>
                <div className={`flex items-center gap-2 px-4 py-3 cursor-pointer ${activePkg === i ? 'bg-blue-50/60' : 'bg-gray-50/60'}`} onClick={() => setActivePkg(i)}>
                  <span className={`w-8 h-8 rounded-lg bg-gradient-to-br ${opt.color} text-white flex items-center justify-center font-extrabold text-[11px] shadow-sm shrink-0`}>{i + 1}</span>
                  <select value={p.name} onClick={e => e.stopPropagation()} onChange={e => { const o = PKG_OPTIONS.find(x => x.name === e.target.value); updatePkg(i, { name: o.name, description: o.desc }) }}
                          className="input-field !w-auto !py-2 !rounded-lg !text-sm font-bold cursor-pointer">
                    {PKG_OPTIONS.map(o => <option key={o.name} value={o.name}>{o.name}</option>)}
                  </select>
                  <span className="text-[11px] text-gray-400 font-medium hidden sm:inline">{opt.desc}</span>
                  <div className="ml-auto flex items-center gap-1 shrink-0">
                    <span className={`hidden sm:inline-flex items-center gap-1 text-[12px] font-bold ${activePkg === i ? 'text-[#0e76f1]' : 'text-gray-400'}`}><Icon name="chevDown" size={13} className={`transition-transform ${activePkg === i ? 'rotate-180' : ''}`} /> {activePkg === i ? 'Tutup' : 'Edit'}</span>
                    {packages.length > 1 && <button type="button" onClick={() => removePkg(i)} className="p-1.5 ml-1 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"><Icon name="trash" size={14} /></button>}
                  </div>
                </div>

                {activePkg === i && (
                  <div className="grid sm:grid-cols-3 gap-3 p-4 border-t border-gray-100 bg-white">
                    <div><label className="text-[11px] font-bold text-gray-500 mb-1 block">Harga (Rp)</label><input type="number" value={p.price} onChange={e => updatePkg(i, { price: Number(e.target.value) })} className="input-field !py-2.5" /></div>
                    <div><label className="text-[11px] font-bold text-gray-500 mb-1 block">Durasi (hari)</label><input type="number" value={p.delivery_days} onChange={e => updatePkg(i, { delivery_days: Number(e.target.value) })} className="input-field !py-2.5" /></div>
                    <div><label className="text-[11px] font-bold text-gray-500 mb-1 block">Revisi</label><input type="number" value={p.revisions} onChange={e => updatePkg(i, { revisions: Number(e.target.value) })} className="input-field !py-2.5" /></div>
                    <div className="sm:col-span-3"><label className="text-[11px] font-bold text-gray-500 mb-1 block">Deskripsi paket</label><input value={p.description} onChange={e => updatePkg(i, { description: e.target.value })} className="input-field !py-2.5" /></div>
                    <div className="sm:col-span-3">
                      <label className="text-[11px] font-bold text-gray-500 mb-1 block">Fitur (pisahkan dengan koma)</label>
                      <input value={p.features.join(', ')} onChange={e => updatePkg(i, { features: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="Logo 1 konsep, Revisi 2x, File HD" className="input-field !py-2.5" />
                      {p.features.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {p.features.map((f, fi) => <span key={fi} className="inline-flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-700 font-semibold rounded-full px-2.5 py-1"><span className="text-emerald-500"><Icon name="check" size={11} strokeWidth={3} /></span> {f}</span>)}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="flex items-center gap-3 sticky bottom-3 z-40 bg-white/95 backdrop-blur rounded-2xl border border-gray-200/80 p-3.5 shadow-lift">
          <Link to="/dashboard" className="btn-outline !py-3.5 shrink-0">Batal</Link>
          <button className="flex-1 !py-3.5 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#0e76f1] to-[#4a2fd8] text-white rounded-xl text-sm font-extrabold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed" disabled={saving}>
            {saving ? <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span> : <><Icon name="sparkles" size={17} /> Publish Jasa</>}
          </button>
        </div>
      </form>

      {/* live preview */}
      <div className="lg:sticky lg:top-28">
        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 px-1"><Icon name="eye" size={14} /> Pratinjau</div>
        <div className="card overflow-hidden">
          <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100">
            {images.length > 0 ? <img src={images[0]} alt="" className="w-full h-full object-cover" /> : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 flex-col gap-2"><Icon name="image" size={36} /><span className="text-xs font-medium">Cover jasa kamu di sini</span></div>
            )}
            {images.length > 1 && <span className="absolute bottom-2.5 right-2.5 rounded-full bg-black/50 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5">+{images.length - 1}</span>}
            <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur px-2.5 py-1 text-[11px] font-bold text-gray-700 shadow-sm">
              {cats.find(c => c.id === Number(form.category_id))?.icon} {cats.find(c => c.id === Number(form.category_id))?.name || 'Kategori'}
            </span>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#0e76f1] to-[#6a3cff]"></div>
              <span className="text-[12px] font-semibold text-gray-600">{user?.full_name || 'Nama kamu'}</span>
              <Stars rating={5} size={11} />
              <span className="ml-auto text-[12px] font-bold text-[#0e76f1]">{formatIDR(packages[activePkg]?.price || 0)}</span>
            </div>
            <div className="text-[13px] font-semibold text-ink line-clamp-2 h-9">{form.title || 'Judul jasa kamu akan tampil di sini'}</div>
          </div>
        </div>
        <div className="card p-4 mt-3 text-xs text-gray-500 space-y-2.5">
          <div className="flex items-center justify-between"><span>Paket</span><b className="text-ink">{usePackages ? `${packages[activePkg]?.name} (${packages.length}/3)` : 'Harga Langsung'}</b></div>
          <div className="flex items-center justify-between"><span>Mulai dari</span><b className="text-[#0e76f1]">{usePackages ? formatIDR(Math.min(...packages.map(p => p.price || 0))) : formatIDR(noPrice)}</b></div>
          <div className="flex items-center justify-between"><span>Status</span><span className="inline-flex items-center gap-1 text-emerald-600 font-bold"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Siap tayang</span></div>
        </div>
      </div>
    </div>
  )
}