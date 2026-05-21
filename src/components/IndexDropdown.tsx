import { useState, useRef, useEffect } from 'react'

export type MarketIndex = 'sp500' | 'nasdaq100' | 'dow30' | 'kospi200' | 'kosdaq150'

const INDEX_OPTIONS: Array<{ id: MarketIndex; flag: string; label: string }> = [
  { id: 'sp500',     flag: '🇺🇸', label: 'S&P 500' },
  { id: 'nasdaq100', flag: '🇺🇸', label: '나스닥 100' },
  { id: 'dow30',     flag: '🇺🇸', label: '다우존스 30' },
  { id: 'kospi200',  flag: '🇰🇷', label: '코스피 200' },
  { id: 'kosdaq150', flag: '🇰🇷', label: '코스닥 150' },
]

interface Props {
  value: MarketIndex
  onChange: (v: MarketIndex) => void
}

export default function IndexDropdown({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = INDEX_OPTIONS.find(o => o.id === value)!

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm font-semibold text-gray-800 dark:text-gray-100"
      >
        <span>{selected.flag}</span>
        <span>{selected.label}</span>
        <span className="text-xs text-gray-400 ml-0.5">∨</span>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-1 min-w-[160px]">
          {INDEX_OPTIONS.map(opt => (
            <button
              key={opt.id}
              onClick={() => { onChange(opt.id); setOpen(false) }}
              className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-left transition-colors ${
                opt.id === value
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 font-semibold'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <span>{opt.flag}</span>
              <span className="flex-1">{opt.label}</span>
              {opt.id === value && <span>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
