import MetricCard from '../components/MetricCard'
import type { MarketData } from '../hooks/useMarketData'

interface Props {
  data: MarketData
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-1 mb-2">
        {title}
      </h2>
      <div className="grid grid-cols-2 gap-2">{children}</div>
    </div>
  )
}

export default function DashboardTab({ data }: Props) {
  const { kr_market: k, us_market: u, macro: m, global_index: g } = data

  return (
    <div className="p-4 space-y-5">
      <Section title="한국 증시">
        <MetricCard label="KOSPI"    value={k.kospi.value.toLocaleString()}    change={k.kospi.change} />
        <MetricCard label="KOSDAQ"   value={k.kosdaq.value.toLocaleString()}   change={k.kosdaq.change} />
        <MetricCard label="KOSPI 200" value={k.kospi200.value.toLocaleString()} change={k.kospi200.change} />
      </Section>

      <Section title="미국 증시">
        <MetricCard label="S&P 500"      value={u.sp500.value.toLocaleString()}   change={u.sp500.change} />
        <MetricCard label="NASDAQ"       value={u.nasdaq.value.toLocaleString()}   change={u.nasdaq.change} />
        <MetricCard label="DOW Jones"    value={u.dow.value.toLocaleString()}      change={u.dow.change} />
        <MetricCard label="Russell 2000" value={u.russell.value.toLocaleString()}  change={u.russell.change} />
      </Section>

      <Section title="매크로">
        <MetricCard label="미 기준금리"      value={m.fed_rate.value.toFixed(2)}    unit="%" />
        <MetricCard label="미 10년 국채"     value={m.us_10y.value.toFixed(2)}      unit="%" />
        <MetricCard label="미 2년 국채"      value={m.us_2y.value.toFixed(2)}       unit="%" />
        <MetricCard label="장단기 스프레드"  value={m.spread_10_2.value.toFixed(2)} unit="%" />
        <MetricCard label="달러인덱스 DXY"   value={m.dxy.value.toFixed(2)} />
        <MetricCard label="달러/원"          value={m.usd_krw.value.toLocaleString()} unit="₩" />
        <MetricCard label="WTI 유가"         value={m.wti.value.toFixed(2)}          unit="$" />
        <MetricCard label="금 가격"          value={m.gold.value.toLocaleString()}   unit="$" />
      </Section>

      <Section title="글로벌 지수">
        <MetricCard label="니케이 225" value={g.nikkei.value.toLocaleString()}   change={g.nikkei.change} />
        <MetricCard label="상해종합"   value={g.shanghai.value.toLocaleString()} change={g.shanghai.change} />
        <MetricCard label="항셍"       value={g.hangseng.value.toLocaleString()} change={g.hangseng.change} />
        <MetricCard label="DAX"        value={g.dax.value.toLocaleString()}      change={g.dax.change} />
      </Section>
    </div>
  )
}
