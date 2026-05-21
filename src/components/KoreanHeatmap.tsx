import { Treemap, ResponsiveContainer } from 'recharts'
import type { HeatmapStock } from '../hooks/useMarketData'

const LEGEND_COLORS = ['#b91c1c', '#991b1b', '#7f1d1d', '#1e5c3c', '#16a34a', '#15803d', '#166534']
const LEGEND_LABELS = ['-3%', '-2%', '-1%', '0', '+1%', '+2%', '+3%']

function getHeatColor(pct: number): string {
  if (pct >=  3) return '#166534'
  if (pct >=  2) return '#15803d'
  if (pct >=  1) return '#16a34a'
  if (pct >=  0) return '#1e5c3c'
  if (pct >= -1) return '#7f1d1d'
  if (pct >= -2) return '#991b1b'
  return '#b91c1c'
}

function groupBySector(stocks: HeatmapStock[]) {
  const map = new Map<string, HeatmapStock[]>()
  for (const s of stocks) {
    const sec = s.sector ?? '기타'
    if (!map.has(sec)) map.set(sec, [])
    map.get(sec)!.push(s)
  }
  return Array.from(map.entries()).map(([name, items]) => ({
    name,
    children: items.map(s => ({
      name: s.ticker,
      displayName: s.name,
      size: s.market_cap,
      change: s.change_pct,
    })),
  }))
}

interface CellProps {
  x?: number; y?: number; width?: number; height?: number
  name?: string; displayName?: string; change?: number
}

function CustomCell({ x = 0, y = 0, width = 0, height = 0, name = '', displayName, change = 0 }: CellProps) {
  const bg = getHeatColor(change)
  const label = displayName ?? name
  const show = width > 30 && height > 24
  const showChange = height > 38
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={bg} stroke="#111827" strokeWidth={1} />
      {show && (
        <>
          <text
            x={x + width / 2} y={showChange ? y + height / 2 - 6 : y + height / 2 + 4}
            textAnchor="middle" fill="white"
            fontSize={Math.min(12, width / 5)} fontWeight="bold"
          >
            {label}
          </text>
          {showChange && (
            <text
              x={x + width / 2} y={y + height / 2 + 10}
              textAnchor="middle" fill="white"
              fontSize={Math.min(10, width / 6)}
            >
              {change > 0 ? '+' : ''}{change.toFixed(2)}%
            </text>
          )}
        </>
      )}
    </g>
  )
}

interface Props {
  stocks: HeatmapStock[]
  label?: string
}

export default function KoreanHeatmap({ stocks, label }: Props) {
  if (stocks.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
        히트맵 데이터 없음
      </div>
    )
  }

  return (
    <div className="pb-2">
      {label && <div className="text-xs text-gray-400 px-3 pb-1">{label}</div>}
      <ResponsiveContainer width="100%" height={380}>
        <Treemap
          data={groupBySector(stocks)}
          dataKey="size"
          aspectRatio={4 / 3}
          content={<CustomCell />}
        />
      </ResponsiveContainer>
      <div className="flex items-center justify-center gap-1 pt-1 pb-1">
        {LEGEND_COLORS.map((color, i) => (
          <div key={i} className="flex flex-col items-center gap-0.5">
            <div className="w-6 h-2 rounded-sm" style={{ backgroundColor: color }} />
            <span className="text-[9px] text-gray-400">{LEGEND_LABELS[i]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
