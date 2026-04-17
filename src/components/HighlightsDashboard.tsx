import { useMemo } from 'react'
import { useAppContext } from '@/context/AppContext'
import {
  differenceInDays,
  subDays,
  isWithinInterval,
  startOfDay,
  endOfDay,
  parseISO,
} from 'date-fns'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Info } from 'lucide-react'

export function HighlightsDashboard() {
  const { data, filters } = useAppContext()
  const range = filters.dateRange

  const highlights = useMemo(() => {
    if (!range?.from || !range?.to) return null
    const days = differenceInDays(range.to, range.from) + 1
    const prevFrom = subDays(range.from, days)
    const prevTo = subDays(range.to, days)

    const currentStats: Record<
      string,
      { leads: number; imp: number; clicks: number; desc: string }
    > = {}
    const prevStats: Record<string, { leads: number; imp: number; clicks: number }> = {}

    data.forEach((row) => {
      const d = parseISO(row.date)
      if (isWithinInterval(d, { start: startOfDay(range.from), end: endOfDay(range.to) })) {
        if (!currentStats[row.campaign])
          currentStats[row.campaign] = { leads: 0, imp: 0, clicks: 0, desc: row.description || '' }
        currentStats[row.campaign].leads += row.leadsRD
        currentStats[row.campaign].imp += row.impressions
        currentStats[row.campaign].clicks += row.clicksAds
      } else if (isWithinInterval(d, { start: startOfDay(prevFrom), end: endOfDay(prevTo) })) {
        if (!prevStats[row.campaign]) prevStats[row.campaign] = { leads: 0, imp: 0, clicks: 0 }
        prevStats[row.campaign].leads += row.leadsRD
        prevStats[row.campaign].imp += row.impressions
        prevStats[row.campaign].clicks += row.clicksAds
      }
    })

    const diffs = Object.keys(currentStats)
      .map((camp) => {
        const curr = currentStats[camp]
        const prev = prevStats[camp] || { leads: 0, imp: 0, clicks: 0 }

        const currCtr = curr.imp > 0 ? (curr.clicks / curr.imp) * 100 : 0
        const prevCtr = prev.imp > 0 ? (prev.clicks / prev.imp) * 100 : 0

        const leadsDiff = curr.leads - prev.leads
        const ctrDiff = currCtr - prevCtr

        return { campaign: camp, leadsDiff, ctrDiff, curr, prev }
      })
      .filter((d) => d.curr.leads > 0 || d.prev.leads > 0)

    diffs.sort((a, b) => b.leadsDiff - a.leadsDiff)

    return {
      improved: diffs.filter((d) => d.leadsDiff > 0 || d.ctrDiff > 0.5).slice(0, 3),
      worsened: diffs
        .filter((d) => d.leadsDiff < 0 || d.ctrDiff < -0.5)
        .reverse()
        .slice(0, 3),
    }
  }, [data, range])

  if (!highlights) return null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-fade-in-up">
      <Card className="border-emerald-100 shadow-sm bg-emerald-50/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-emerald-800">
            <TrendingUp className="w-5 h-5" /> Top Performers (O que melhorou)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {highlights.improved.length > 0 ? (
            <ul className="space-y-3">
              {highlights.improved.map((h) => (
                <li
                  key={h.campaign}
                  className="flex justify-between items-start bg-white p-4 rounded-lg border border-emerald-100 shadow-sm gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-slate-800 block truncate">
                      {h.campaign}
                    </span>
                    {h.curr.desc && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5 flex items-center gap-1">
                        <Info className="w-3 h-3" /> {h.curr.desc}
                      </p>
                    )}
                    <p className="text-xs mt-2 text-emerald-700 font-medium bg-emerald-50 inline-block px-2 py-1 rounded">
                      Motivo: {h.leadsDiff > 0 ? `Ganhou +${h.leadsDiff} Leads` : 'Manteve Leads'},
                      CTR{' '}
                      {h.ctrDiff >= 0
                        ? `aumentou +${h.ctrDiff.toFixed(1)}%`
                        : `variou ${h.ctrDiff.toFixed(1)}%`}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-emerald-600/70">
              Nenhuma melhora significativa encontrada para o período.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="border-red-100 shadow-sm bg-red-50/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-red-800">
            <TrendingDown className="w-5 h-5" /> Bottom Performers (O que piorou)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {highlights.worsened.length > 0 ? (
            <ul className="space-y-3">
              {highlights.worsened.map((h) => (
                <li
                  key={h.campaign}
                  className="flex justify-between items-start bg-white p-4 rounded-lg border border-red-100 shadow-sm gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-slate-800 block truncate">
                      {h.campaign}
                    </span>
                    {h.curr.desc && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5 flex items-center gap-1">
                        <Info className="w-3 h-3" /> {h.curr.desc}
                      </p>
                    )}
                    <p className="text-xs mt-2 text-red-700 font-medium bg-red-50 inline-block px-2 py-1 rounded">
                      Motivo:{' '}
                      {h.leadsDiff < 0 ? `Perdeu ${Math.abs(h.leadsDiff)} Leads` : 'Manteve Leads'},
                      CTR{' '}
                      {h.ctrDiff < 0
                        ? `caiu ${Math.abs(h.ctrDiff).toFixed(1)}%`
                        : `variou ${h.ctrDiff.toFixed(1)}%`}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-red-600/70">
              Nenhuma queda significativa encontrada para o período.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
