import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="font-display text-6xl font-semibold mb-4">404</h1>
      <p className="text-text-secondary mb-6">This page hasn't aired yet.</p>
      <Link to="/" className="text-accent hover:text-accent-hover transition-colors">
        Back to home
      </Link>
    </div>
  )
}
