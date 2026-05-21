export function formatNum(val: number, decimals = 2): string {
  return val.toFixed(decimals)
}

export function formatLargeNum(val: number): string {
  const abs = Math.abs(val)
  const sign = val < 0 ? '-' : '+'
  if (abs >= 1_000_000_000_000) return `${sign}${(abs / 1_000_000_000_000).toFixed(1)}조`
  if (abs >= 100_000_000) return `${sign}${Math.round(abs / 100_000_000)}억`
  return `${sign}${Math.round(abs / 10_000)}만`
}

export function temperatureColor(score: number): string {
  if (score < 20) return 'bg-blue-100 dark:bg-blue-950 border-blue-200 dark:border-blue-800'
  if (score < 40) return 'bg-sky-100 dark:bg-sky-950 border-sky-200 dark:border-sky-800'
  if (score < 60) return 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
  if (score < 80) return 'bg-orange-100 dark:bg-orange-950 border-orange-200 dark:border-orange-800'
  return 'bg-red-100 dark:bg-red-950 border-red-200 dark:border-red-800'
}

export function badgeColor(status: string): string {
  const map: Record<string, string> = {
    '한파': 'bg-blue-500 text-white',
    '냉각': 'bg-sky-400 text-white',
    '보통': 'bg-gray-400 text-white',
    '온난': 'bg-orange-400 text-white',
    '과열': 'bg-red-500 text-white',
    '극단적 공포': 'bg-blue-500 text-white',
    '공포': 'bg-sky-400 text-white',
    '중립': 'bg-gray-400 text-white',
    '탐욕': 'bg-orange-400 text-white',
    '극단적 탐욕': 'bg-red-500 text-white',
    '매우 낮은 변동성': 'bg-red-500 text-white',
    '낮은 변동성': 'bg-orange-400 text-white',
    '평균 수준': 'bg-gray-400 text-white',
    '변동성 확대': 'bg-sky-400 text-white',
    '고변동성': 'bg-blue-500 text-white',
    '극단적 변동성': 'bg-blue-700 text-white',
    '역사적 하단': 'bg-blue-500 text-white',
    '평균 하단': 'bg-sky-400 text-white',
    '평균 상단': 'bg-gray-400 text-white',
    '상단 범위': 'bg-orange-400 text-white',
    '역사적 상단': 'bg-red-500 text-white',
  }
  return map[status] ?? 'bg-gray-400 text-white'
}

export function changeColor(change: number): string {
  if (change > 0) return 'text-red-500'
  if (change < 0) return 'text-blue-500'
  return 'text-gray-500'
}

export function changeArrow(change: number): string {
  if (change > 0) return '▲'
  if (change < 0) return '▼'
  return '-'
}
