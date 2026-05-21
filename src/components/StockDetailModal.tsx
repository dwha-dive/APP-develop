import { X } from 'lucide-react'
import type { HeatmapItem } from './HeatmapView'
import { changeColor } from '../utils/scoreCalc'

interface Props {
  item: HeatmapItem
  onClose: () => void
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-sm font-semibold text-gray-900 dark:text-white">{value}</span>
    </div>
  )
}

function fmtCap(v: number): string {
  if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`
  if (v >= 1e9)  return `$${(v / 1e9).toFixed(1)}B`
  return `$${(v / 1e6).toFixed(0)}M`
}

export default function StockDetailModal({ item, onClose }: Props) {
  const isKr = item.ticker.match(/^\d{6}$/)
  const priceStr = isKr
    ? `₩${item.price.toLocaleString()}`
    : `$${item.price.toFixed(2)}`

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white dark:bg-gray-800 rounded-t-2xl z-50 p-5"
           style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 20px)' }}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {item.ticker} {item.name ? `— ${item.name}` : ''}
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{priceStr}</span>
              <span className={`text-sm font-semibold ${changeColor(item.change_pct)}`}>
                {item.change_pct > 0 ? '+' : ''}{item.change_pct.toFixed(2)}%
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full bg-gray-100 dark:bg-gray-700">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="space-y-0">
          {item.market_cap > 0 && <Row label="시가총액" value={fmtCap(item.market_cap)} />}
          {item.pe_ratio != null && item.pe_ratio > 0 && <Row label="PER" value={`${item.pe_ratio.toFixed(1)}x`} />}
          {item.forward_pe != null && item.forward_pe > 0 && <Row label="Forward PER" value={`${item.forward_pe.toFixed(1)}x`} />}
          {item.week52_high != null && <Row label="52주 고가" value={isKr ? `₩${item.week52_high?.toLocaleString()}` : `$${item.week52_high?.toFixed(2)}`} />}
          {item.week52_low != null && <Row label="52주 저가" value={isKr ? `₩${item.week52_low?.toLocaleString()}` : `$${item.week52_low?.toFixed(2)}`} />}
          {item.dividend_yield != null && item.dividend_yield > 0 && <Row label="배당수익률" value={`${(item.dividend_yield * 100).toFixed(2)}%`} />}
        </div>

        <a
          href={isKr
            ? `https://finance.naver.com/item/main.nhn?code=${item.ticker}`
            : `https://finance.yahoo.com/quote/${item.ticker}`}
          target="_blank"
          rel="noreferrer"
          className="mt-4 w-full flex items-center justify-center py-2.5 rounded-xl bg-blue-500 text-white text-sm font-semibold"
        >
          {isKr ? '네이버 금융에서 더 보기 →' : 'Yahoo Finance에서 더 보기 →'}
        </a>
      </div>
    </>
  )
}
