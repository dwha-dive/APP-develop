import { useState } from 'react'
import FullscreenModal from './FullscreenModal'
import type { MarketIndex } from './IndexDropdown'

const FINVIZ_BASE: Partial<Record<MarketIndex, string>> = {
  sp500:    'https://finviz.com/map.ashx?t=sec',
  nasdaq100:'https://finviz.com/map.ashx?t=sec_all&idx=NDX',
  dow30:    'https://finviz.com/map.ashx?t=sec&idx=DJI',
}

const PERIOD_PARAMS: Record<string, string> = {
  '1일': 'd1', '5일': 'w1', '1개월': 'w4', '3개월': 'w13', '1년': 'w52',
}

interface Props {
  index: MarketIndex
  period: string
}

export default function FinvizHeatmap({ index, period }: Props) {
  const [fullscreen, setFullscreen] = useState(false)
  const base = FINVIZ_BASE[index]
  const st = PERIOD_PARAMS[period] ?? 'd1'
  const src = base ? `${base}&st=${st}` : null

  if (!src) return null

  return (
    <div className="relative mx-2 mb-2 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
      <iframe
        src={src}
        title="Finviz Heatmap"
        className="w-full border-0 block"
        style={{ height: '420px' }}
        loading="lazy"
        sandbox="allow-scripts allow-same-origin"
      />
      <button
        onClick={() => setFullscreen(true)}
        className="absolute bottom-2 right-2 w-9 h-9 flex items-center justify-center bg-black/60 text-white rounded-lg text-base hover:bg-black/80 transition-colors"
        aria-label="전체화면"
        title="전체화면"
      >
        ⛶
      </button>

      {fullscreen && (
        <FullscreenModal onClose={() => setFullscreen(false)}>
          <iframe
            src={src}
            title="Finviz Heatmap Fullscreen"
            className="w-full h-full border-0 block"
            sandbox="allow-scripts allow-same-origin"
          />
        </FullscreenModal>
      )}
    </div>
  )
}
