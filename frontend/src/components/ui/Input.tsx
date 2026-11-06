import { forwardRef, InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: React.ReactNode
  iconRight?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label, error, hint, icon, iconRight, className = '', id, ...props
}, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-[var(--color-text-secondary)]">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full rounded-md border bg-[var(--color-bg-card)] text-[var(--color-text-primary)]
            placeholder:text-[var(--color-text-muted)] text-sm
            px-3 py-2 h-9 outline-none transition-colors
            border-[var(--color-border)] focus:border-[var(--color-accent)]
            ${error ? 'border-[var(--color-error)]' : ''}
            ${icon ? 'pl-9' : ''}
            ${iconRight ? 'pr-9' : ''}
            ${className}
          `}
          {...props}
        />
        {iconRight && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
            {iconRight}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-[var(--color-error)]">{error}</p>}
      {hint && !error && <p className="text-xs text-[var(--color-text-muted)]">{hint}</p>}
    </div>
  )
})
Input.displayName = 'Input'
export default Input
