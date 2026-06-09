import { HTMLAttributes } from 'react'

type BadgeVariant = 'positive' | 'info' | 'warning' | 'danger' | 'neutral'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variants: Record<BadgeVariant, string> = {
  positive: 'bg-positive-bg border-positive-border text-positive-text',
  info:     'bg-info-bg border-info-border text-info-text',
  warning:  'bg-warning-bg border-warning-border text-warning-text',
  danger:   'bg-danger-bg border-danger-border text-danger-text',
  neutral:  'bg-border-muted border-border-default text-text-muted',
}

export default function Badge({ variant = 'neutral', children, className = '', ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-[20px] px-[10px] py-[3px] text-[11px] font-medium border ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}
