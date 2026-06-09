'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

const base = 'inline-flex items-center justify-center gap-2 font-medium transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none'

const variants: Record<Variant, string> = {
  primary: [
    'bg-primary text-white border-none rounded-[10px]',
    'border-b-[3px] border-b-[#2E7D32]',
    'hover:brightness-95 active:brightness-90',
  ].join(' '),
  secondary: [
    'bg-bg-subtle text-text-secondary rounded-[10px]',
    'border border-border-default border-b-[3px] border-b-border-default',
    'hover:bg-primary-muted hover:border-primary-border hover:border-b-primary-hover',
  ].join(' '),
  danger: [
    'bg-danger-bg text-danger-text rounded-[10px]',
    'border border-danger-border border-b-[3px] border-b-danger-border',
    'hover:brightness-95',
  ].join(' '),
  ghost: [
    'bg-transparent text-text-secondary rounded-[10px]',
    'border border-transparent',
    'hover:bg-bg-subtle',
  ].join(' '),
}

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-[12px]',
  md: 'px-4 py-[7px] text-[13px]',
  lg: 'px-5 py-2.5 text-[14px]',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, className = '', disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && (
        <span className="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  )
)
Button.displayName = 'Button'

export default Button
