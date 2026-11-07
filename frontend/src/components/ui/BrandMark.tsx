interface BrandMarkProps {
  className?: string
  size?: number
}

/** AFTERSHOW's clapper/play mark — a compact symbol for the show's opening cue. */
export default function BrandMark({ className = '', size = 24 }: BrandMarkProps) {
  return (
    <svg aria-hidden="true" className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4.5 9.5h15v9h-15v-9Z" fill="currentColor" fillOpacity=".16" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4.5 9.5 6.4 5.5h14.1l-1.9 4H4.5Z" fill="currentColor" fillOpacity=".28" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="m8.3 5.5 2 4m2.2-4 2 4m2.2-4 2 4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <path d="m10 12.2 5.2 2.8-5.2 2.8v-5.6Z" fill="currentColor" />
    </svg>
  )
}
