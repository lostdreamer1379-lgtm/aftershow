import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Bookmark, Check, Trash2 } from 'lucide-react'
import { WatchStatus, WATCH_STATUS_LABELS } from '@/types'
import Button from '@/components/ui/Button'
import { useWatchlistEntryFor, useAddToWatchlist, useUpdateWatchlistEntry, useRemoveFromWatchlist } from '@/hooks/useWatchlist'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/useToast'

const STATUSES: WatchStatus[] = ['plan_to_watch', 'watching', 'completed', 'on_hold', 'dropped']

interface WatchlistStatusMenuProps {
  tmdbTvId: number
  size?: 'sm' | 'md' | 'lg'
}

export default function WatchlistStatusMenu({ tmdbTvId, size = 'md' }: WatchlistStatusMenuProps) {
  const { user } = useAuth()
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
  const ref = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const entry = useWatchlistEntryFor(tmdbTvId)
  const addMutation = useAddToWatchlist()
  const updateMutation = useUpdateWatchlistEntry()
  const removeMutation = useRemoveFromWatchlist()

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        ref.current &&
        !ref.current.contains(e.target as Node) &&
        !menuRef.current?.contains(e.target as Node)
      ) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  useEffect(() => {
    if (!open) return

    const updateMenuPosition = () => {
      const button = buttonRef.current
      if (!button) return

      const rect = button.getBoundingClientRect()
      const menuWidth = 192
      const menuHeight = entry ? 248 : 208
      const gap = 4
      const horizontalPadding = 8
      const canOpenBelow = window.innerHeight - rect.bottom >= menuHeight + gap
      const top = canOpenBelow ? rect.bottom + gap : Math.max(horizontalPadding, rect.top - menuHeight - gap)
      const left = Math.min(
        Math.max(horizontalPadding, rect.left),
        window.innerWidth - menuWidth - horizontalPadding,
      )

      setMenuPosition({ top, left })
    }

    updateMenuPosition()
    window.addEventListener('resize', updateMenuPosition)
    window.addEventListener('scroll', updateMenuPosition, true)
    return () => {
      window.removeEventListener('resize', updateMenuPosition)
      window.removeEventListener('scroll', updateMenuPosition, true)
    }
  }, [entry, open])

  if (!user) {
    return (
      <Button variant="ghost" size={size} icon={<Bookmark size={16} />} disabled title="Sign in to use your watchlist">
        Watchlist
      </Button>
    )
  }

  const handleSelect = async (status: WatchStatus) => {
    try {
      if (entry) {
        await updateMutation.mutateAsync({ id: entry.id, status })
      } else {
        await addMutation.mutateAsync({ tmdbTvId, status })
      }
      toast.success(`Added to "${WATCH_STATUS_LABELS[status]}"`)
      setOpen(false)
    } catch {
      toast.error('Could not update watchlist')
    }
  }

  const handleRemove = async () => {
    if (!entry) return
    try {
      await removeMutation.mutateAsync(entry.id)
      toast.success('Removed from watchlist')
      setOpen(false)
    } catch {
      toast.error('Could not remove from watchlist')
    }
  }

  return (
    <div className="relative" ref={ref}>
      <Button
        ref={buttonRef}
        variant={entry ? 'secondary' : 'ghost'}
        size={size}
        icon={<Bookmark size={16} fill={entry ? 'currentColor' : 'none'} />}
        onClick={() => setOpen(v => !v)}
      >
        {entry ? WATCH_STATUS_LABELS[entry.status] : 'Watchlist'}
      </Button>

      {open && createPortal(
        <div
          ref={menuRef}
          className="fixed z-[100] w-48 overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] shadow-xl"
          style={{ top: menuPosition.top, left: menuPosition.left }}
        >
          {STATUSES.map(status => (
            <button
              key={status}
              onClick={() => handleSelect(status)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm text-left text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              {WATCH_STATUS_LABELS[status]}
              {entry?.status === status && <Check size={14} className="text-[var(--color-accent)]" />}
            </button>
          ))}
          {entry && (
            <button
              onClick={handleRemove}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-[var(--color-error)] hover:bg-[rgba(224,92,92,0.1)] transition-colors border-t border-[var(--color-border)]"
            >
              <Trash2 size={14} /> Remove from watchlist
            </button>
          )}
        </div>,
        document.body,
      )}
    </div>
  )
}
