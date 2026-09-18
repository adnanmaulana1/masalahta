export default function Avatar({ src, size = 40, username = '', className = '' }) {
  const url = src || `https://i.pravatar.cc/200?u=${username || 'x'}`
  return (
    <div className={`relative rounded-full overflow-hidden bg-gray-100 ${className}`} style={{ width: size, height: size }}>
      <img src={url} alt="" loading="lazy" className="w-full h-full object-cover" onError={e => e.target.parentElement.classList.add('bg-blue-100')} />
    </div>
  )
}