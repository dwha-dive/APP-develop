import type { SectorItem } from '../hooks/useMarketData'

interface Props { sectors: SectorItem[] }

export default function SectorView({ sectors }: Props) {
  const sorted = [...sectors].sort((a, b) => b.change_pct - a.change_pct)
  const maxAbs = Math.max(...sorted.map(s => Math.abs(s.change_pct)), 0.01)

  return (
    <div className="px-3 py-2 space-y-1">
      {sorted.map(s => {
        const isUp = s.change_pct >= 0
        const barWidth = (Math.abs(s.change_pct) / maxAbs) * 100
        return (
          <div key={s.name} className="flex items-center gap-2 py-1.5">
            {s.emoji && (
              <span className="text-base w-6 text-center shrink-0">{s.emoji}</span>
            )}
            <span className="text-xs text-gray-700 dark:text-gray-200 w-20 shrink-0">{s.name}</span>
            <div className="flex-1 h-4 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
              <div
                className="h-full rounded transition-all"
                style={{
                  width: `${barWidth}%`,
                  backgroundColor: isUp ? '#b91c1c' : '#1e3a5f',
                }}
              />
            </div>
            <span className={`text-xs font-semibold w-14 text-right shrink-0 ${isUp ? 'text-red-500' : 'text-blue-500'}`}>
              {isUp ? '+' : ''}{s.change_pct.toFixed(2)}%
            </span>
          </div>
        )
      })}
    </div>
  )
}
