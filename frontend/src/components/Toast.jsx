import { useState, useEffect } from 'react'

const listeners = new Set()
let toastId = 0

export function showToast(message, type = 'success') {
  toastId += 1
  listeners.forEach((fn) => fn({ id: toastId, message, type }))
}

function ToastIcon({ type }) {
  const d = {
    success: 'M22 11.08V12a10 10 0 1 1-5.93-9.14',
    error: 'M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z',
    info: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm-1-11h2v6h-2Zm0-4h2v2h-2z',
  }[type] || 'M22 11.08V12a10 10 0 1 1-5.93-9.14'
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d={d} />
      {type === 'success' && <path d="m9 11 3 3L22 4" strokeWidth="2.5" />}
    </svg>
  )
}

export default function Toast() {
  const [toasts, setToasts] = useState([])

  const dismiss = (id) => setToasts((p) => p.filter((x) => x.id !== id))

  useEffect(() => {
    const add = (t) => {
      setToasts((p) => [...p, t])
      setTimeout(() => dismiss(t.id), 3600)
    }
    listeners.add(add)
    return () => listeners.delete(add)
  }, [])

  const accent = {
    success: 'border-l-emerald-500 text-emerald-600',
    error: 'border-l-red-500 text-red-600',
    info: 'border-l-blue-500 text-blue-600',
  }

  if (toasts.length === 0) return null
  return (
    <div className="fixed z-[100] right-0 left-0 md:left-auto md:right-5 top-16 md:top-20 px-3 md:px-0 flex flex-col items-center md:items-end gap-2.5 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast-in pointer-events-auto w-full md:w-[340px] max-w-[400px] flex items-start gap-3 rounded-xl border border-l-4 border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-800 shadow-lift ${accent[t.type]}`}
        >
          <span className="mt-0.5 shrink-0"><ToastIcon type={t.type} /></span>
          <span className="flex-1 py-0.5 leading-snug">{t.message}</span>
          <button onClick={() => dismiss(t.id)} className="p-1 -mr-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
      ))}
    </div>
  )
}