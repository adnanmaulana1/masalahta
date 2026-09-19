export default function Avatar({ src, size = 40, username = '', className = '', status }) {
  const url = src || `https://i.pravatar.cc/200?u=${username || 'x'}`
  return (
    <div className={`relative rounded-full bg-gray-100 dark:bg-white/5 shrink-0 ${className}`} style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <img src={url} alt="" loading="lazy" className="w-full h-full object-cover" onError={e => e.target.parentElement.classList.add('bg-blue-100')} />
      </div>
      {status && (
        <span
          title={status === 'online' ? 'Online' : 'Offline'}
          className={`absolute bottom-0 right-0 rounded-full ring-2 ring-white ${status === 'online' ? 'bg-emerald-400' : 'bg-gray-300'}`}
          style={{ width: Math.max(10, size * 0.28), height: Math.max(10, size * 0.28) }}
        ></span>
      )}
    </div>
  )
}