import { useState } from 'react'
import { Plus, Check, Layers } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useCollections, useCreateCollection, useAddShowToCollection } from '@/hooks/useCollections'
import { useToast } from '@/hooks/useToast'

interface AddToCollectionModalProps {
  open: boolean
  onClose: () => void
  tmdbTvId: number
}

export default function AddToCollectionModal({ open, onClose, tmdbTvId }: AddToCollectionModalProps) {
  const toast = useToast()
  const { data: collections, isLoading } = useCollections()
  const createCollection = useCreateCollection()
  const addShow = useAddShowToCollection()
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)

  const handleAdd = async (collectionId: string) => {
    try {
      await addShow.mutateAsync({ collectionId, tmdbTvId })
      toast.success('Added to collection')
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(message || 'Could not add to collection')
    }
  }

  const handleCreateAndAdd = async () => {
    if (!newName.trim()) return
    setCreating(true)
    try {
      const collection = await createCollection.mutateAsync({ name: newName.trim() })
      await addShow.mutateAsync({ collectionId: collection.id, tmdbTvId })
      toast.success(`Added to "${collection.name}"`)
      setNewName('')
      onClose()
    } catch {
      toast.error('Could not create collection')
    } finally {
      setCreating(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add to Collection" size="sm">
      <div className="space-y-4">
        {isLoading && <p className="text-sm text-[var(--color-text-muted)]">Loading your collections…</p>}

        {!isLoading && collections && collections.length > 0 && (
          <div className="max-h-48 overflow-y-auto space-y-1 -mx-1 px-1">
            {collections.map(c => {
              const alreadyIn = c.shows?.some(s => s.tmdbTvId === tmdbTvId)
              return (
                <button
                  key={c.id}
                  onClick={() => !alreadyIn && handleAdd(c.id)}
                  disabled={alreadyIn}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md text-sm text-left text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card)] hover:text-[var(--color-text-primary)] transition-colors disabled:opacity-60 disabled:cursor-default"
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <Layers size={14} className="flex-shrink-0" />
                    <span className="truncate">{c.name}</span>
                  </span>
                  {alreadyIn && <Check size={14} className="text-[var(--color-accent)] flex-shrink-0" />}
                </button>
              )
            })}
          </div>
        )}

        {!isLoading && (!collections || collections.length === 0) && (
          <p className="text-sm text-[var(--color-text-muted)]">You don't have any collections yet.</p>
        )}

        <div className="pt-3 border-t border-[var(--color-border)] flex gap-2">
          <Input
            placeholder="New collection name…"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleCreateAndAdd() }}
          />
          <Button
            variant="primary"
            icon={<Plus size={16} />}
            onClick={handleCreateAndAdd}
            loading={creating}
            disabled={!newName.trim()}
          >
            Create
          </Button>
        </div>
      </div>
    </Modal>
  )
}
