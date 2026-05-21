import type { MarketData } from '../hooks/useMarketData'

interface Props { data: MarketData }

function getMarketStatus() {
  const now = new Date()
  const kstMin = ((now.getUTCHours() + 9) % 24) * 60 + now.getUTCMinutes()

  let us = 'closed'
  // Pre-market: 18:00~23:30 KST, Regular: 23:30~06:00 KST, After: 06:00~10:00 KST
  if (kstMin >= 18 * 60 && kstMin < 23 * 60 + 30) us = 'premarket'
  else if (kstMin >= 23 * 60 + 30 || kstMin < 6 * 60) us = 'regular'
  else if (kstMin >= 6 * 60 && kstMin < 10 * 60) us = 'afterhours'

  let kr = 'closed'
  if (kstMin >= 9 * 60 && kstMin < 15 * 60 + 30) kr = 'open'

  return { us, kr }
}

const US_LABELS: Record<string, string> = {
  premarket:  '🇺🇸 프리마켓',
  regular:    '🇺🇸 정규장',
  afterhours: '🇺🇸 애프터',
  closed:     '🇺🇸 폐장',
}
const KR_LABELS: Record<string, string> = {
  open:   '🇰🇷 정규장',
  closed: '🇰🇷 폐장',
}

function StatusBadge({ label, active }: { label: string; active: boolean }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
      active
        ? 'bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300'
        : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400'
    }`}>
      {label}
    </span>
  )
}

function TickerItem({ label, value, change }: { label: string; value: string; change: number }) {
  const isUp = change >= 0
  return (
    <div className="shrink-0 px-3 py-1.5 text-center">
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{label}</div>
      <div className="text-sm font-bold text-gray-900 dark:text-white">{value}</div>
      <div className={`text-xs font-medium ${isUp ? 'text-red-500' : 'text-blue-500'}`}>
        {isUp ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
      </div>
    </div>
  )
}

export default function MarketHeader({ data }: Props) {
  const status = getMarketStatus()
  const h = data.header_tickers

  const tickers = h ? [
    { label: 'S&P 500', value: h.sp500.value.toLocaleString(),    change: h.sp500.change_pct },
    { label: '나스닥',  value: h.nasdaq.value.toLocaleString(),   change: h.nasdaq.change_pct },
    { label: '달러/원', value: h.usd_krw.value.toLocaleString(),  change: h.usd_krw.change_pct },
    { label: '비트코인',value: (h.bitcoin.value / 1_000_000).toFixed(1) + 'M', change: h.bitcoin.change_pct },
    { label: '코스피',  value: h.kospi.value.toLocaleString(),    change: h.kospi.change_pct },
    { label: '코스닥',  value: h.kosdaq.value.toLocaleString(),   change: h.kosdaq.change_pct },
  ] : []

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      {/* Market status badges */}
      <div className="flex gap-1.5 px-3 pt-2 pb-1">
        <StatusBadge label={US_LABELS[status.us]} active={status.us === 'regular'} />
        <StatusBadge label={KR_LABELS[status.kr]} active={status.kr === 'open'} />
      </div>

      {/* Ticker scroll bar */}
      {tickers.length > 0 && (
        <div className="flex overflow-x-auto divide-x divide-gray-100 dark:divide-gray-700 pb-1"
             style={{ scrollbarWidth: 'none' }}>
          {tickers.map(t => <TickerItem key={t.label} {...t} />)}
        </div>
      )}
    </div>
  )
}
