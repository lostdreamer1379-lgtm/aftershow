interface BrandMarkProps {
  className?: string
  size?: number
}

/** AFTERSHOW's clapper/play mark — a compact symbol for the show's opening cue. */
export default function BrandMark({ className = '', size = 24 }: BrandMarkProps) {
  return (
    <svg aria-hidden="true" className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4.5" y="8.5" width="15" height="10" rx="2.5" fill="currentColor" fillOpacity=".12" stroke="currentColor" strokeWidth="1.6" />
      <path d="m10.2 11.3 5 2.7-5 2.7v-5.4Z" fill="currentColor" />
    </svg>
  )
}
