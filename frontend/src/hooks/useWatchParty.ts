import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'

export interface WatchPartyPlayback {
  type: 'playback' | 'episode' | 'sync-request'
  tmdbId: number
  season: number
  episode: number
  action?: 'play' | 'pause' | 'seek'
  currentTime?: number
  duration?: number
  senderId: string
  sentAt: number
}

export interface WatchPartyChatMessage {
  id: string
  senderId: string
  senderName: string
  text: string
  sentAt: number
}

interface UseWatchPartyOptions {
  roomId: string | null
  userId: string | undefined
  displayName: string
  onPlayback: (message: WatchPartyPlayback) => void
}

export function useWatchParty({ roomId, userId, displayName, onPlayback }: UseWatchPartyOptions) {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const playbackHandlerRef = useRef(onPlayback)
  const [connected, setConnected] = useState(false)
  const [participantCount, setParticipantCount] = useState(0)
  const [messages, setMessages] = useState<WatchPartyChatMessage[]>([])

  useEffect(() => {
    playbackHandlerRef.current = onPlayback
  }, [onPlayback])

  useEffect(() => {
    if (!roomId || !userId) return

    const channel = supabase.channel(`watch-party:${roomId}`, {
      config: { presence: { key: userId } },
    })
    channelRef.current = channel

    channel
      .on('broadcast', { event: 'playback' }, ({ payload }) => {
        if (payload.senderId !== userId) playbackHandlerRef.current(payload as WatchPartyPlayback)
      })
      .on('broadcast', { event: 'chat' }, ({ payload }) => {
        if (payload.senderId !== userId) {
          setMessages(current => [...current, payload as WatchPartyChatMessage].slice(-100))
        }
      })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        setParticipantCount(Object.keys(state).length)
      })
      .subscribe(async status => {
        if (status === 'SUBSCRIBED') {
          setConnected(true)
          await channel.track({ userId, displayName })
        }
      })

    return () => {
      setConnected(false)
      setParticipantCount(0)
      setMessages([])
      channelRef.current = null
      void supabase.removeChannel(channel)
    }
  }, [roomId, userId, displayName])

  const sendPlayback = useCallback((message: Omit<WatchPartyPlayback, 'senderId' | 'sentAt'>) => {
    if (!channelRef.current || !userId || !connected) return
    void channelRef.current.send({
      type: 'broadcast',
      event: 'playback',
      payload: { ...message, senderId: userId, sentAt: Date.now() },
    })
  }, [connected, userId])

  const sendChat = useCallback((text: string) => {
    const trimmed = text.trim()
    if (!channelRef.current || !userId || !connected || !trimmed) return
    const message: WatchPartyChatMessage = {
      id: `${userId}-${Date.now()}`,
      senderId: userId,
      senderName: displayName,
      text: trimmed.slice(0, 500),
      sentAt: Date.now(),
    }
    setMessages(current => [...current, message].slice(-100))
    void channelRef.current.send({ type: 'broadcast', event: 'chat', payload: message })
  }, [connected, displayName, userId])

  return { connected, participantCount, messages, sendPlayback, sendChat }
}
