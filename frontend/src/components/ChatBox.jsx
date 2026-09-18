import { useEffect, useRef, useState } from 'react'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { useRealtime } from '../context/RealtimeContext'
import Avatar from './Avatar'
import Icon from './Icon'
import { relativeTime } from '../utils/format'

export default function ChatBox({ orderId, conversationId, partner }) {
  const { user } = useAuth()
  const { onChat, onTyping, sendTyping } = useRealtime()
  const [convoId, setConvoId] = useState(conversationId || null)
  const [msgs, setMsgs] = useState([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [typing, setTyping] = useState(false)
  const bottom = useRef(null)
  const lastType = useRef(0)
  const typingTimer = useRef(null)

  useEffect(() => {
    if (conversationId) {
      setConvoId(conversationId)
      api.get(`/conversations/${conversationId}/messages`).then(r => setMsgs(r.data.data || [])).catch(() => {})
    } else if (orderId) {
      api.get(`/orders/${orderId}/messages`).then(r => {
        setMsgs(r.data.data || [])
        if (r.data.conversation_id) setConvoId(r.data.conversation_id)
      }).catch(() => {})
    }
  }, [orderId, conversationId])

  useEffect(() => {
    if (!convoId) return
    return onChat((m) => {
      if (m.conversation_id === convoId) setMsgs(prev => [...prev, m])
    })
  }, [convoId, onChat])

  useEffect(() => {
    if (!convoId) return
    return onTyping((d) => {
      if (d.conversation_id === convoId && d.from !== user?.id) {
        setTyping(true)
        clearTimeout(typingTimer.current)
        typingTimer.current = setTimeout(() => setTyping(false), 3000)
      }
    })
  }, [convoId, onTyping, user?.id])

  const handleText = (v) => {
    setText(v)
    const now = Date.now()
    if (v.trim() && convoId && partner?.id && now - lastType.current > 2000) {
      lastType.current = now
      sendTyping(partner.id, convoId)
    }
  }

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [msgs])

  const send = async (e) => {
    e.preventDefault()
    const body = text.trim()
    if (!body || sending) return
    setSending(true)
    try {
      const url = convoId ? `/conversations/${convoId}/messages` : `/orders/${orderId}/messages`
      const r = await api.post(url, { body })
      if (r.data.conversation_id) setConvoId(r.data.conversation_id)
      setMsgs(prev => [...prev, r.data])
      window.dispatchEvent(new CustomEvent('chat-sent', { detail: r.data }))
      setText('')
    } catch {
      // biarkan, pesan masuk via WS jika terkirim
    }
    setSending(false)
  }

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-3">
        <Avatar src={partner?.avatar} username={partner?.username} size={24} />
        <span className="text-xs font-bold text-ink">Chat dengan {partner?.full_name || partner?.username || 'partner'}</span>
      </div>
      <div className="max-h-64 overflow-y-auto space-y-2.5 bg-gray-50/70 rounded-xl p-3">
        {msgs.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-4">Belum ada pesan. Sapa partner-mu dulu!</p>
        )}
        {msgs.map(m => {
          const mine = m.sender_id === user?.id
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 ${mine ? 'bg-[#0e76f1] text-white rounded-br-md' : 'bg-white border text-gray-800 rounded-bl-md shadow-sm'}`}>
                <p className="text-[13px] leading-relaxed whitespace-pre-wrap break-words">{m.body}</p>
                <p className={`text-[10px] mt-1 ${mine ? 'text-white/70' : 'text-gray-400'}`}>{relativeTime(m.created_at)}</p>
              </div>
            </div>
          )
        })}
        <div ref={bottom}></div>
      </div>
      {typing && (
        <div className="flex items-center gap-1.5 mt-2 ml-1 text-[11px] font-semibold text-gray-400">
          <span className="flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </span>
          {partner?.full_name || partner?.username} sedang mengetik…
        </div>
      )}
      <form onSubmit={send} className="flex gap-2 mt-3">
        <input
          value={text}
          onChange={e => handleText(e.target.value)}
          placeholder="Tulis pesan..."
          maxLength={2000}
          className="input-field !py-2.5"
        />
        <button disabled={!text.trim() || sending} className="btn-primary !px-4 !py-2.5 shrink-0" aria-label="Kirim pesan">
          <Icon name="send" size={16} />
        </button>
      </form>
    </div>
  )
}
