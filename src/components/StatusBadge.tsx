import { badgeColor } from '../utils/scoreCalc'

interface Props {
  status: string
}

export default function StatusBadge({ status }: Props) {
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badgeColor(status)}`}>
      {status}
    </span>
  )
}
