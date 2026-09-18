import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import api from '../utils/api'
import { useAuth } from './AuthContext'

const NotificationContext = createContext({ items: [], unread: 0, refresh: () => {}, markOne: () => {}, markAll: () => {} })

export function NotificationProvider({ children }) {
  const { user } = useAuth()
  const [items, setItems] = useState([])

  const refresh = useCallback(() => {
    if (!user) { setItems([]); return }
    api.get('/notifications').then(r => setItems(r.data.data || [])).catch(() => {})
  }, [user])

  useEffect(() => { refresh() }, [refresh])
  useEffect(() => {
    if (!user) return
    const onPush = () => refresh()
    window.addEventListener('notify-push', onPush)
    const t = setInterval(refresh, 60000)
    return () => {
      window.removeEventListener('notify-push', onPush)
      clearInterval(t)
    }
  }, [user, refresh])

  const markOne = useCallback(async (id) => {
    setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    try { await api.put(`/notifications/${id}/read`) } catch { refresh() }
  }, [refresh])

  const markAll = useCallback(async () => {
    setItems(prev => prev.map(n => ({ ...n, read: true })))
    try { await api.put('/notifications/read-all') } catch { refresh() }
  }, [refresh])

  const unread = items.filter(n => !n.read).length

  return (
    <NotificationContext.Provider value={{ items, unread, refresh, markOne, markAll }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => useContext(NotificationContext)

export const notifStyle = {
  order: { icon: 'box', chip: 'bg-blue-50 text-[#0e76f1]' },
  payment: { icon: 'wallet', chip: 'bg-emerald-50 text-emerald-600' },
  review: { icon: 'star', chip: 'bg-amber-50 text-amber-500' },
  chat: { icon: 'chat', chip: 'bg-violet-50 text-violet-600' },
  promo: { icon: 'sparkles', chip: 'bg-rose-50 text-rose-500' },
  system: { icon: 'info', chip: 'bg-gray-100 text-gray-500' },
}
