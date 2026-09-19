import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle({ className = '' }) {
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'
  return (
    <button
      onClick={toggle}
      title={dark ? 'Mode terang' : 'Mode gelap'}
      aria-label={dark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
      aria-pressed={dark}
      className={`p-2.5 rounded-full text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10 transition-colors ${className}`}
    >
      <span className="block transition-transform duration-300 hover:rotate-12">
        {dark ? <Sun size={20} /> : <Moon size={20} />}
      </span>
    </button>
  )
}
