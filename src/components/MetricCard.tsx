import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatNumber, formatPercent, getDiffColor } from '@/lib/formatters'
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  title: string
  current: number
  past: number
  type: 'currency' | 'number' | 'percent'
  inverseGood?: boolean
}

export function MetricCard({ title, current, past, type, inverseGood = false }: MetricCardProps) {
  const diff = current - past
  const pct = past > 0 ? diff / past : 0

  const formatVal = (v: number) => {
    if (type === 'currency') return formatCurrency(v)
    if (type === 'percent') return formatPercent(v)
    return formatNumber(v)
  }

  const isPositive = diff > 0
  const isZero = diff === 0

  let icon = <Minus className="w-4 h-4 text-muted-foreground" />
  if (!isZero) {
    if (isPositive)
      icon = <ArrowUpRight className={cn('w-4 h-4', getDiffColor(diff, inverseGood))} />
    else icon = <ArrowDownRight className={cn('w-4 h-4', getDiffColor(diff, inverseGood))} />
  }

  return (
    <Card className="hover:shadow-elevation transition-all duration-300 transform hover:-translate-y-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-mono">{formatVal(current)}</div>
        <div className="flex items-center gap-1 mt-1 text-xs">
          {icon}
          <span className={cn('font-medium', getDiffColor(diff, inverseGood))}>
            {formatPercent(pct)}
          </span>
          <span className="text-muted-foreground ml-1">vs Sem. Passada</span>
        </div>
      </CardContent>
    </Card>
  )
}
