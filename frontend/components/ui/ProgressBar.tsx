interface ProgressBarProps {
  value: number
  max?: number
  showLabel?: boolean
  className?: string
}

export default function ProgressBar({ value, max = 100, showLabel, className = '' }: ProgressBarProps) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  const color = pct >= 90 ? '#4ADE80' : pct >= 75 ? '#FBBF24' : '#F87171'

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex-1 h-2 bg-border-muted rounded-[20px] overflow-hidden">
        <div
          className="h-full rounded-[20px] transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      {showLabel && (
        <span className="text-[11px] text-text-muted w-8 text-right">{pct}%</span>
      )}
    </div>
  )
}
