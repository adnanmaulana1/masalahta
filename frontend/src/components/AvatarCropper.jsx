import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Icon from './Icon'

export default function AvatarCropper({ src, onCancel, onCrop }) {
  const boxRef = useRef(null)
  const imgRef = useRef(null)
  const [nat, setNat] = useState({ w: 0, h: 0 })
  const [scale, setScale] = useState(1)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [saving, setSaving] = useState(false)
  const drag = useRef(null)

  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      setNat({ w: img.naturalWidth, h: img.naturalHeight })
      setScale(1)
      setPos({ x: 0, y: 0 })
    }
    img.src = src
  }, [src])

  const vw = boxRef.current?.clientWidth || 280
  const base = nat.w && nat.h ? vw / Math.min(nat.w, nat.h) : 1
  const dw = nat.w * base * scale
  const dh = nat.h * base * scale

  const clamp = (x, y) => {
    const maxX = Math.max(0, (dw - vw) / 2)
    const maxY = Math.max(0, (dh - vw) / 2)
    return { x: Math.min(maxX, Math.max(-maxX, x)), y: Math.min(maxY, Math.max(-maxY, y)) }
  }

  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { sx: e.clientX, sy: e.clientY, px: pos.x, py: pos.y }
  }
  const onPointerMove = (e) => {
    if (!drag.current) return
    setPos(clamp(drag.current.px + (e.clientX - drag.current.sx), drag.current.py + (e.clientY - drag.current.sy)))
  }
  const onPointerUp = () => { drag.current = null }

  const onZoom = (v) => {
    const next = Math.min(3, Math.max(1, v))
    setScale(next)
    setPos(p => {
      const dw2 = nat.w * base * next
      const dh2 = nat.h * base * next
      const mx = Math.max(0, (dw2 - vw) / 2)
      const my = Math.max(0, (dh2 - vw) / 2)
      return { x: Math.min(mx, Math.max(-mx, p.x)), y: Math.min(my, Math.max(-my, p.y)) }
    })
  }

  const save = () => {
    setSaving(true)
    const S = 512
    const k = base * scale
    const cx = (vw - dw) / 2 + pos.x
    const cy = (vw - dh) / 2 + pos.y
    const canvas = document.createElement('canvas')
    canvas.width = S
    canvas.height = S
    const ctx = canvas.getContext('2d')
    const img = imgRef.current
    if (ctx && img) {
      ctx.drawImage(img, (0 - cx) / k, (0 - cy) / k, vw / k, vw / k, 0, 0, S, S)
      onCrop(canvas.toDataURL('image/jpeg', 0.9))
    }
    setSaving(false)
  }

  return createPortal(
    <div className="fixed inset-0 flex items-end justify-center sm:items-center sm:p-4 overflow-y-auto" style={{ zIndex: 95 }}>
      <div className="fixed inset-0 bg-black/60" onClick={onCancel}></div>
      <div className="relative w-full sm:max-w-[380px] rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-900 p-5 pb-[max(20px,env(safe-area-inset-bottom))] shadow-2xl slide-up">
        <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-4 sm:hidden" aria-hidden="true"></div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-extrabold text-ink dark:text-gray-100">Atur Foto Profil</h3>
          <button onClick={onCancel} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400"><Icon name="x" size={18} /></button>
        </div>
        <div
          ref={boxRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-900 touch-none select-none cursor-move"
        >
          {nat.w > 0 && (
            <img
              ref={imgRef}
              src={src}
              alt=""
              draggable={false}
              className="absolute max-w-none"
              style={{ width: dw, height: dh, left: `calc(50% + ${pos.x}px)`, top: `calc(50% + ${pos.y}px)`, transform: 'translate(-50%, -50%)' }}
            />
          )}
          <div className="absolute inset-0 pointer-events-none rounded-2xl ring-1 ring-inset ring-white/20"></div>
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 0H100V100H0Z M50 50 m-50 0 a50 50 0 1 0 100 0 a50 50 0 1 0 -100 0" fill="rgba(0,0,0,0.45)" fillRule="evenodd" />
            <circle cx="50" cy="50" r="49" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1" strokeDasharray="3 2" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>
        <p className="text-[11px] text-gray-400 dark:text-gray-400 mt-2 text-center">Geser & zoom • area dalam lingkaran jadi foto profil</p>
        <div className="flex items-center gap-3 mt-3">
          <Icon name="image" size={16} className="text-gray-400 dark:text-gray-400" />
          <input type="range" min={1} max={3} step={0.01} value={scale} onChange={e => onZoom(Number(e.target.value))} className="flex-1 accent-[#0e76f1]" aria-label="Zoom" />
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 w-10 text-right">{Math.round(scale * 100)}%</span>
        </div>
        <button onClick={save} disabled={saving || !nat.w} className="btn-primary w-full mt-4 !py-3">
          {saving ? <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span> : 'Simpan Foto'}
        </button>
      </div>
    </div>, document.body)
}
