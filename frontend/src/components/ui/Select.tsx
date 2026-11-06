import { SelectHTMLAttributes, forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string | number; label: string }[]
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(({ label, error, options, className = '', id, ...props }, ref) => {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={selectId} className="text-sm font-medium text-[var(--color-text-secondary)]">{label}</label>}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={`
            w-full appearance-none rounded-md border bg-[var(--color-bg-card)]
            text-[var(--color-text-primary)] text-sm px-3 py-2 h-9 pr-8
            border-[var(--color-border)] focus:border-[var(--color-accent)]
            outline-none transition-colors cursor-pointer
            ${error ? 'border-[var(--color-error)]' : ''}
            ${className}
          `}
          {...props}
        >
          {options.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
      </div>
      {error && <p className="text-xs text-[var(--color-error)]">{error}</p>}
    </div>
  )
})
Select.displayName = 'Select'
export default Select
