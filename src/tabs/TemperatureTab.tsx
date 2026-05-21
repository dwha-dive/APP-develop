import ThermometerBar from '../components/ThermometerBar'
import StatusBadge from '../components/StatusBadge'
import InfoTooltip from '../components/InfoTooltip'
import { temperatureColor } from '../utils/scoreCalc'
import type { MarketData } from '../hooks/useMarketData'

interface Props {
  data: MarketData
}

function TempCard({
  title, value, displayValue, score, status, tooltip, unit
}: {
  title: string; value?: number; displayValue?: string; score: number
  status: string; tooltip: string; unit?: string
}) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{title}</span>
          <InfoTooltip text={tooltip} />
        </div>
        <StatusBadge status={status} />
      </div>
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-3xl font-bold text-orange-500">
          {displayValue ?? (value !== undefined ? value.toFixed(2) : '—')}
        </span>
        {unit && <span className="text-sm text-gray-400">{unit}</span>}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
        점수: {score.toFixed(2)}점
      </div>
      <ThermometerBar score={score} />
    </div>
  )
}

export default function TemperatureTab({ data }: Props) {
  const { composite, vix, fear_greed, forward_pe } = data.temperature

  return (
    <div className="p-4 space-y-3">
      {/* 종합 카드 */}
      <div className={`border rounded-2xl p-5 ${temperatureColor(composite.score)}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-gray-800 dark:text-gray-100">
              시장 온도 지수
            </span>
            <InfoTooltip text="VIX점수×0.4 + Fear&Greed점수×0.4 + ForwardPE점수×0.2의 가중 합산. 0=극공포, 100=극과열." />
          </div>
          <StatusBadge status={composite.status} />
        </div>
        <div className="text-5xl font-black text-orange-500 mb-1">
          {composite.score.toFixed(1)}
          <span className="text-2xl text-gray-500 dark:text-gray-400 font-normal">/100</span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{composite.description}</p>
        <ThermometerBar score={composite.score} />
        <div className="text-xs text-gray-400 mt-2 text-right">
          기준일: {data.updated_at.slice(0, 10)}
        </div>
      </div>

      {/* VIX */}
      <TempCard
        title="VIX 공포지수"
        value={vix.value}
        score={vix.score}
        status={vix.status}
        tooltip="S&P 500 옵션의 향후 30일 내재변동성 지표. 역방향 반영: VIX가 낮을수록 온도 점수가 높습니다. 출처: Yahoo Finance(^VIX)"
      />

      {/* Fear & Greed */}
      <TempCard
        title="Fear & Greed 지수"
        value={fear_greed.value}
        score={fear_greed.score}
        status={fear_greed.status}
        tooltip="CNN에서 발표하는 투자 심리 지수(0~100). 모멘텀·시장강도·옵션수요 등 7개 지표 종합. 가중치 40%. 출처: CNN Fear & Greed Index"
      />

      {/* Forward P/E */}
      <TempCard
        title="Forward P/E (S&P 500)"
        displayValue={`${forward_pe.value.toFixed(2)}x`}
        score={forward_pe.score}
        status={forward_pe.status}
        tooltip="S&P 500의 향후 12개월 예상 이익 대비 주가 비율. 값이 높을수록 현재 주가가 높은 수준. 가중치 20%. 출처: Wall Street Journal"
      />
    </div>
  )
}
