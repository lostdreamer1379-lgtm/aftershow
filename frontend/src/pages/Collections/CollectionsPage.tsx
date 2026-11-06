import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Layers, Plus, Trash2 } from 'lucide-react'
import { useCollections, useCreateCollection, useDeleteCollection } from '@/hooks/useCollections'
import { useShowsByIds } from '@/hooks/useShowsByIds'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import { ConfirmModal } from '@/components/ui/Modal'
import Skeleton from '@/components/ui/Skeleton'
import { getPosterUrl } from '@/lib/tmdb-image'
import { useToast } from '@/hooks/useToast'

function CollectionCoverStack({ tmdbTvIds }: { tmdbTvIds: number[] }) {
  const { data } = useShowsByIds(tmdbTvIds.slice(0, 4))
  if (tmdbTvIds.length === 0) {
    return (
      <div className="aspect-[16/9] rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)] flex items-center justify-center">
        <Layers size={28} className="text-[var(--color-text-muted)]" />
      </div>
    )
  }
  return (
    <div className="aspect-[16/9] rounded-lg overflow-hidden grid grid-cols-4 gap-0.5 bg-[var(--color-bg-card)]">
      {data.slice(0, 4).map(({ id, show }) => (
        <div key={id} className="relative overflow-hidden">
          {show ? (
            <img src={getPosterUrl(show.poster_path, 'w185')} alt={show.name} className="w-full h-full object-cover" />
          ) : (
            <div className="skeleton w-full h-full" />
          )}
        </div>
      ))}
      {Array.from({ length: Math.max(0, 4 - data.length) }).map((_, i) => (
        <div key={`empty-${i}`} className="bg-[var(--color-bg-card)]" />
      ))}
    </div>
  )
}

export default function CollectionsPage() {
  const { data: collections, isLoading, isError, refetch } = useCollections()
  const createCollection = useCreateCollection()
  const deleteCollection = useDeleteCollection()
  const toast = useToast()

  const [createOpen, setCreateOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  const handleCreate = async () => {
    if (!name.trim()) return
    try {
      await createCollection.mutateAsync({ name: name.trim(), description: description.trim() || undefined })
      toast.success('Collection created')
      setCreateOpen(false)
      setName('')
      setDescription('')
    } catch {
      toast.error('Could not create collection')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteCollection.mutateAsync(deleteTarget.id)
      toast.success('Collection deleted')
      setDeleteTarget(null)
    } catch {
      toast.error('Could not delete collection')
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[var(--color-text-primary)]">
          Collections
        </h1>
        <Button variant="primary" icon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>
          New Collection
        </Button>
      </div>

      {isError && <ErrorState retry={() => refetch()} />}

      {!isError && isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="aspect-[16/9] w-full" />
              <Skeleton className="mt-2 h-4 w-1/2" />
            </div>
          ))}
        </div>
      )}

      {!isError && !isLoading && (!collections || collections.length === 0) && (
        <EmptyState
          icon={<Layers size={22} />}
          title="No collections yet"
          description="Group shows into themed lists like Weekend Binge or Comfort Shows."
          action={{ label: 'Create your first collection', onClick: () => setCreateOpen(true) }}
        />
      )}

      {!isError && !isLoading && collections && collections.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {collections.map(c => (
            <div key={c.id} className="group relative">
              <Link to={`/collections/${c.id}`}>
                <CollectionCoverStack tmdbTvIds={(c.shows ?? []).map(s => s.tmdbTvId)} />
                <div className="mt-2">
                  <p className="font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors">
                    {c.name}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {c.shows?.length ?? 0} show{(c.shows?.length ?? 0) !== 1 ? 's' : ''}
                  </p>
                </div>
              </Link>
              <button
                onClick={() => setDeleteTarget({ id: c.id, name: c.name })}
                className="absolute top-2 right-2 w-7 h-7 rounded-md bg-black/60 text-white/80 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Delete ${c.name}`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New Collection" size="sm">
        <div className="space-y-4">
          <Input label="Name" placeholder="e.g. Weekend Binge" value={name} onChange={e => setName(e.target.value)} />
          <Input label="Description (optional)" placeholder="What's this collection for?" value={description} onChange={e => setDescription(e.target.value)} />
          <Button variant="primary" fullWidth onClick={handleCreate} loading={createCollection.isPending} disabled={!name.trim()}>
            Create Collection
          </Button>
        </div>
      </Modal>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This removes the collection and its show list. This can't be undone."
        confirmLabel="Delete"
        danger
        loading={deleteCollection.isPending}
      />
    </div>
  )
}
