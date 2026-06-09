import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-[12px] font-medium text-text-secondary">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={[
          'w-full bg-bg-subtle border border-border-default rounded-[10px] px-3 py-2',
          'text-[13px] text-text-primary placeholder:text-text-muted',
          'outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
          'transition-colors',
          error ? 'border-danger-border focus:border-danger-border focus:ring-danger-bg' : '',
          className,
        ].join(' ')}
        {...props}
      />
      {error && <p className="text-[11px] text-danger-text">{error}</p>}
    </div>
  )
)
Input.displayName = 'Input'

export default Input
