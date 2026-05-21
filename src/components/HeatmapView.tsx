import { useState } from 'react'
import StockDetailModal from './StockDetailModal'

export interface HeatmapItem {
  ticker: string
  name?: string
  price: number
  change_pct: number
  market_cap: number
  pe_ratio?: number
  forward_pe?: number
  week52_high?: number
  week52_low?: number
  dividend_yield?: number
}

function getColor(pct: number): string {
  if (pct >= 3)  return '#166534'
  if (pct >= 1)  return '#16A34A'
  if (pct >= 0)  return '#86EFAC'
  if (pct >= -1) return '#FCA5A5'
  if (pct >= -3) return '#DC2626'
  return '#991B1B'
}

function getTextColor(pct: number): string {
  return (pct >= 0 && pct < 1) || (pct < 0 && pct > -1) ? '#1f2937' : '#ffffff'
}

interface Props {
  items: HeatmapItem[]
}

export default function HeatmapView({ items }: Props) {
  const [selected, setSelected] = useState<HeatmapItem | null>(null)

  const sorted = [...items].sort((a, b) => b.market_cap - a.market_cap)
  const maxCap = sorted[0]?.market_cap || 1

  return (
    <>
      <div className="flex flex-wrap gap-0.5 p-2">
        {sorted.map(item => {
          const ratio = Math.sqrt(item.market_cap / maxCap)
          const w = Math.max(44, Math.round(ratio * 130))
          const h = Math.max(36, Math.round(ratio * 80))
          const showText = w >= 44
          const showChange = h >= 48

          return (
            <div
              key={item.ticker}
              className="flex flex-col items-center justify-center rounded-sm cursor-pointer active:opacity-80 overflow-hidden"
              style={{
                width: w,
                height: h,
                backgroundColor: getColor(item.change_pct),
                color: getTextColor(item.change_pct),
                flexShrink: 0,
              }}
              onClick={() => setSelected(item)}
            >
              {showText && (
                <span className="font-bold leading-tight" style={{ fontSize: w > 70 ? 11 : 9 }}>
                  {item.ticker}
                </span>
              )}
              {showChange && (
                <span className="leading-tight" style={{ fontSize: 9 }}>
                  {item.change_pct > 0 ? '+' : ''}{item.change_pct.toFixed(1)}%
                </span>
              )}
            </div>
          )
        })}
      </div>

      {selected && (
        <StockDetailModal item={selected} onClose={() => setSelected(null)} />
      )}
    </>
  )
}
