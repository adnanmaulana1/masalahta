import Icon from './Icon'

export default function Stars({ rating = 0, size = 14, total = 5 }) {
  const rounded = Math.round(rating)
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: total }).map((_, i) => (
        <Icon
          key={i}
          name="starFill"
          size={size}
          align="h"
          className={i < rounded ? 'text-amber-400' : 'text-gray-300'}
          fill="currentColor"
          strokeWidth={0}
        />
      ))}
    </span>
  )
}