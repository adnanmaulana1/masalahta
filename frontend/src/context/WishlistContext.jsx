import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import api from '../utils/api'
import { useAuth } from './AuthContext'
import { showToast } from '../components/Toast'

const WishlistContext = createContext({ ids: new Set(), toggle: async () => {}, has: () => false })

export function WishlistProvider({ children }) {
  const { user } = useAuth()
  const [ids, setIds] = useState(new Set())

  useEffect(() => {
    if (!user) { setIds(new Set()); return }
    api.get('/wishlist/ids').then(r => setIds(new Set(r.data.data || []))).catch(() => {})
  }, [user])

  const toggle = useCallback(async (gigId) => {
    if (!user) { showToast('Login dulu untuk menyimpan favorit', 'error'); return false }
    const saved = ids.has(gigId)
    setIds(prev => {
      const next = new Set(prev)
      saved ? next.delete(gigId) : next.add(gigId)
      return next
    })
    try {
      if (saved) await api.delete(`/wishlist/${gigId}`)
      else await api.post(`/wishlist/${gigId}`)
      return !saved
    } catch {
      setIds(prev => {
        const next = new Set(prev)
        saved ? next.add(gigId) : next.delete(gigId)
        return next
      })
      showToast('Gagal memperbarui favorit', 'error')
      return saved
    }
  }, [user, ids])

  const has = useCallback((gigId) => ids.has(gigId), [ids])

  return (
    <WishlistContext.Provider value={{ ids, toggle, has }}>
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => useContext(WishlistContext)
