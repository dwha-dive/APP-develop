import { useState, useEffect } from 'react'
import type { HeatmapItem } from '../components/HeatmapView'
import type { SectorData } from '../components/SectorView'
import type { EconomicEvent } from '../components/EconomicCalendar'
import type { EarningsItem } from '../components/EarningsCalendar'
import type { FedWatchData } from '../components/FedWatchCard'

export interface MarketData {
  updated_at: string
  temperature: {
    composite: { score: number; status: string; description: string }
    vix:        { value: number; score: number; status: string }
    fear_greed: { value: number; score: number; status: string }
    forward_pe: { value: number; score: number; status: string }
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
    sp500:     HeatmapItem[]
    nasdaq100: HeatmapItem[]
    kospi:     HeatmapItem[]
  }
  sectors?: SectorData[]
  calendar?: {
    economic: EconomicEvent[]
    earnings: EarningsItem[]
    fed_watch?: FedWatchData
  }
}

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
