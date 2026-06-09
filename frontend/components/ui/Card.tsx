import { HTMLAttributes, forwardRef } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean
  hoverColor?: string
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ hoverable, hoverColor = '#86EFAC', children, className = '', style, ...props }, ref) => {
    const hoverStyle = hoverable
      ? { '--hover-color': hoverColor } as React.CSSProperties
      : {}

    return (
      <div
        ref={ref}
        className={[
          'bg-bg-surface border border-border-default rounded-[14px] p-[18px]',
          hoverable ? 'card-hoverable transition-all' : '',
          className,
        ].join(' ')}
        style={{ ...hoverStyle, ...style }}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Card.displayName = 'Card'

export default Card
