import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import api from '../utils/api'
import { useAuth } from './AuthContext'

const RealtimeContext = createContext({ online: false, onChat: () => () => {}, onTyping: () => () => {}, sendTyping: () => {}, isOnline: () => false })

function wsURL() {
  const base = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8080/api`
  const ws = base.replace(/^http/, 'ws').replace(/\/api$/, '')
  const token = localStorage.getItem('token')
  return `${ws}/ws?token=${encodeURIComponent(token || '')}`
}

export function RealtimeProvider({ children }) {
  const { user } = useAuth()
  const [online, setOnline] = useState(false)
  const [presence, setPresence] = useState({})
  const subs = useRef(new Set())
  const typingSubs = useRef(new Set())
  const ws = useRef(null)
  const timer = useRef(null)

  const onChat = useCallback((fn) => {
    subs.current.add(fn)
    return () => subs.current.delete(fn)
  }, [])

  const onTyping = useCallback((fn) => {
    typingSubs.current.add(fn)
    return () => typingSubs.current.delete(fn)
  }, [])

  const sendTyping = useCallback((to, conversationId) => {
    try {
      if (ws.current?.readyState === 1) {
        ws.current.send(JSON.stringify({ type: 'typing', to, conversation_id: conversationId }))
      }
    } catch { /* abaikan */ }
  }, [])

  useEffect(() => {
    if (!user) return
    let dead = false
    let backoff = 1000

    const connect = () => {
      if (dead) return
      const sock = new WebSocket(wsURL())
      ws.current = sock
      sock.onopen = () => { setOnline(true); backoff = 1000 }
      sock.onclose = () => {
        setOnline(false)
        if (!dead) {
          timer.current = setTimeout(connect, Math.min(backoff, 15000))
          backoff *= 2
        }
      }
      sock.onerror = () => sock.close()
      sock.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data)
          if (msg.type === 'chat') subs.current.forEach(fn => fn(msg.data))
          if (msg.type === 'typing') typingSubs.current.forEach(fn => fn(msg.data))
          if (msg.type === 'notify') window.dispatchEvent(new CustomEvent('notify-push'))
        } catch { /* abaikan */ }
      }
    }
    connect()
    // ping tiap 25 detik agar koneksi hidup
    const ping = setInterval(() => {
      try { ws.current?.readyState === 1 && ws.current.send('ping') } catch { /* abaikan */ }
    }, 25000)
    return () => {
      dead = true
      clearInterval(ping)
      clearTimeout(timer.current)
      try { ws.current?.close() } catch { /* abaikan */ }
    }
  }, [user])

  const isOnline = useCallback((id) => !!presence[id], [presence])

  const checkPresence = useCallback(async (ids) => {
    if (!user || !ids.length) return
    try {
      const r = await api.post('/presence', { ids })
      setPresence(prev => ({ ...prev, ...(r.data.data || {}) }))
    } catch { /* abaikan */ }
  }, [user])

  return (
    <RealtimeContext.Provider value={{ online, onChat, onTyping, sendTyping, isOnline, checkPresence }}>
      {children}
    </RealtimeContext.Provider>
  )
}

export const useRealtime = () => useContext(RealtimeContext)
