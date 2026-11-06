import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

interface TrailerModalProps {
  videoKey: string | null
  onClose: () => void
}

export default function TrailerModal({ videoKey, onClose }: TrailerModalProps) {
  return (
    <AnimatePresence>
      {videoKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/85"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="relative z-10 w-full max-w-4xl"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              onClick={onClose}
              className="absolute -top-10 right-0 text-white/80 hover:text-white transition-colors"
              aria-label="Close trailer"
            >
              <X size={24} />
            </button>
            <div className="player-wrapper rounded-lg overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${videoKey}?autoplay=1`}
                title="Trailer"
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
