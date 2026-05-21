import { useState, useEffect } from 'react'

// ── Shared types ─────────────────────────────────────────────────────────────
export interface HeatmapStock {
  ticker: string
  name?: string
  sector?: string
  price: number
  change_pct: number
  market_cap: number
  pe_ratio?: number
  forward_pe?: number
  week52_high?: number
  week52_low?: number
  dividend_yield?: number
  week_change?: number
  month_change?: number
  year_change?: number
}
export type HeatmapItem = HeatmapStock

export interface SectorItem {
  name: string
  emoji?: string
  etf: string
  change_pct: number
  stocks?: Array<{ ticker: string; change_pct: number }>
}
export type SectorData = SectorItem

export interface IndustryItem {
  name: string
  change_pct: number
  sector: string
}

export interface EarningsItem {
  ticker: string
  company: string
  logo_url?: string
  date: string
  weekday?: string
  timing: 'BMO' | 'AMC'
  time_str: string
  market_cap: number
  market_cap_tier: 'small' | 'mid' | 'large'
  eps_estimate?: number
  eps_actual?: number
  surprise_pct?: number
  revenue_estimate?: number
  revenue_actual?: number
}

export interface EarningsWeek {
  range: { start: string; end: string }
  items: EarningsItem[]
}

export interface EconomicEvent {
  event_id?: string
  time_kst?: string
  time?: string
  country: string
  flag?: string
  name: string
  importance: 1 | 2 | 3
  actual: string | null
  forecast: string | null
  previous: string | null
  is_next_release?: boolean
  next_release_datetime?: string
}

export interface FedWatchData {
  next_fomc: string
  days_until: number
  current_rate_low: number
  current_rate_high: number
  probabilities: {
    cut_50bp: number
    cut_25bp: number
    hold: number
    hike_25bp: number
  }
  fomc_schedule: Array<{
    date: string
    decision: string | null
    rate: number | null
  }>
}

export interface TickerData {
  value: number
  change_pct: number
}

// ── Main interface ────────────────────────────────────────────────────────────
export interface MarketData {
  updated_at: string | { kr_session?: string; us_session?: string }
  market_status?: { us: string; kr: string }

  header_tickers?: {
    sp500:   TickerData
    nasdaq:  TickerData
    usd_krw: TickerData
    bitcoin: TickerData
    kospi:   TickerData
    kosdaq:  TickerData
  }

  temperature: {
    composite: { score: number; status: string; description: string }
    vix:       { value: number; score: number; status: string }
    fear_greed:{ value: number; score: number; status: string }
    forward_pe:{ value: number; score: number; status: string }
  }

  kr_market: {
    kospi:    { value: number; change: number }
    kosdaq:   { value: number; change: number }
    kospi200: { value: number; change: number }
  }

  us_market: {
    sp500:   { value: number; change: number }
    nasdaq:  { value: number; change: number }
    dow:     { value: number; change: number }
    russell: { value: number; change: number }
  }

  macro: {
    fed_rate:    { value: number }
    us_10y:      { value: number }
    us_2y:       { value: number }
    spread_10_2: { value: number }
    dxy:         { value: number }
    usd_krw:     { value: number }
    wti:         { value: number }
    gold:        { value: number }
  }

  global_index: {
    nikkei:   { value: number; change: number }
    shanghai: { value: number; change: number }
    hangseng: { value: number; change: number }
    dax:      { value: number; change: number }
  }

  supply_demand: {
    date: string
    kospi_foreign: number
    kospi_institution: number
    kosdaq_foreign: number
    pension: number
    individual: number
    top_buy_foreign: Array<{ ticker: string; name: string; net: number; change: number }>
    top_buy_institution: Array<{ ticker: string; name: string; net: number; change: number }>
    foreign_daily: Array<{ date: string; net: number }>
    foreign_holdings: Array<{ ticker: string; name: string; ratio: number; change: number }>
  }

  heatmap?: {
    sp500?:     HeatmapStock[]
    nasdaq100?: HeatmapStock[]
    dow30?:     HeatmapStock[]
    kospi200?:  HeatmapStock[]
    kosdaq150?: HeatmapStock[]
    kospi?:     HeatmapStock[]
  }

  sectors?: SectorItem[] | { period: string; data: SectorItem[] }
  industries?: IndustryItem[]

  earnings?: {
    prev_week?: EarningsWeek
    curr_week?: EarningsWeek
    next_week?: EarningsWeek
  }

  economic_calendar?: {
    yesterday?: EconomicEvent[]
    today?: EconomicEvent[]
    tomorrow?: EconomicEvent[]
    this_week?: EconomicEvent[]
    next_week?: EconomicEvent[]
  }

  fed_watch?: FedWatchData

  calendar?: {
    economic?: EconomicEvent[]
    earnings?: EarningsItem[]
    fed_watch?: FedWatchData
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
export function getSectors(data: MarketData): SectorItem[] {
  if (!data.sectors) return []
  if (Array.isArray(data.sectors)) return data.sectors
  return data.sectors.data ?? []
}

export function getUpdatedAt(updated_at: MarketData['updated_at']): string {
  if (typeof updated_at === 'string') return updated_at.slice(0, 16).replace('T', ' ')
  const t = updated_at.us_session ?? updated_at.kr_session ?? ''
  return t.slice(0, 16).replace('T', ' ')
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useMarketData() {
  const [data, setData] = useState<MarketData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data.json`)
      .then(r => { if (!r.ok) throw new Error(r.status.toString()); return r.json() })
      .then(d => { setData(d); setLoading(false) })
      .catch(() => { setError('데이터를 불러올 수 없습니다'); setLoading(false) })
  }, [])

  return { data, loading, error }
}
