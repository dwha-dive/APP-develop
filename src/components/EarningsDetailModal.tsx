import type { EarningsItem } from '../hooks/useMarketData'

interface Props {
  item: EarningsItem
  onClose: () => void
}

function fmt(n: number | undefined): string {
  if (n == null) return '-'
  const abs = Math.abs(n)
  if (abs >= 1e12) return '$' + (n / 1e12).toFixed(2) + 'T'
  if (abs >= 1e9)  return '$' + (n / 1e9).toFixed(1) + 'B'
  if (abs >= 1e6)  return '$' + (n / 1e6).toFixed(1) + 'M'
  return '$' + n.toFixed(2)
}

const TIER_KR: Record<string, string> = { large: '대형주', mid: '중형주', small: '소형주' }

export default function EarningsDetailModal({ item, onClose }: Props) {
  const hasSurprise = item.eps_actual != null && item.eps_estimate != null
  const beat = hasSurprise && (item.surprise_pct ?? 0) > 0

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end" onClick={onClose}>
      <div
        className="w-full bg-white dark:bg-gray-900 rounded-t-2xl p-5"
        style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">{item.ticker}</div>
            <div className="text-sm text-gray-500">{item.company}</div>
            <div className="text-xs text-gray-400 mt-0.5">
              {item.date} {item.timing === 'BMO' ? '장전' : '장후'} {item.time_str}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 text-2xl leading-none">×</button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-3">
          {[
            { label: 'EPS 예상', value: item.eps_estimate != null ? `$${item.eps_estimate.toFixed(2)}` : '-', cls: '' },
            { label: 'EPS 실제', value: item.eps_actual != null ? `$${item.eps_actual.toFixed(2)}` : '-',
              cls: hasSurprise ? (beat ? 'text-red-500' : 'text-blue-500') : '' },
            { label: '서프라이즈', value: hasSurprise ? `${beat ? '+' : ''}${item.surprise_pct!.toFixed(1)}%` : '-',
              cls: hasSurprise ? (beat ? 'text-red-500' : 'text-blue-500') : 'text-gray-400' },
          ].map(c => (
            <div key={c.label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">{c.label}</div>
              <div className={`text-sm font-bold ${c.cls || 'text-gray-800 dark:text-gray-100'}`}>{c.value}</div>
            </div>
          ))}
        </div>

        {(item.revenue_estimate != null || item.revenue_actual != null) && (
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">매출 예상</div>
              <div className="text-sm font-bold text-gray-800 dark:text-gray-100">{fmt(item.revenue_estimate)}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">매출 실제</div>
              <div className="text-sm font-bold text-gray-800 dark:text-gray-100">{fmt(item.revenue_actual)}</div>
            </div>
          </div>
        )}

        <div className="text-xs text-gray-400 text-center">
          {TIER_KR[item.market_cap_tier] ?? item.market_cap_tier}
        </div>
      </div>
    </div>
  )
}
