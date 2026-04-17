import { useState, useMemo } from 'react'
import { useAppContext } from '@/context/AppContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DatePickerWithRange } from '@/components/DatePickerWithRange'
import {
  differenceInDays,
  parseISO,
  isWithinInterval,
  startOfDay,
  endOfDay,
  subDays,
} from 'date-fns'
import { Target, TrendingUp, AlertTriangle, CheckCircle2, Zap } from 'lucide-react'
import { formatNumber, formatCurrency } from '@/lib/formatters'

export default function Predictability() {
  const { data, filters, setFilters } = useAppContext()
  const [goals, setGoals] = useState({ leads: 150, orders: 30, budget: 5000 })

  const forecast = useMemo(() => {
    let range = filters.dateRange
    let rangeDays = 30
    let toDate = new Date()
    let fromDate = subDays(toDate, rangeDays)

    if (range?.from) {
      fromDate = startOfDay(range.from)
      toDate = range.to ? endOfDay(range.to) : endOfDay(range.from)
      rangeDays = differenceInDays(toDate, fromDate) + 1
      if (rangeDays === 0) rangeDays = 1
    }

    const rangeData = data.filter((d) => {
      const date = parseISO(d.date)
      return date >= fromDate && date <= toDate
    })

    const totalLeads = rangeData.reduce((acc, d) => acc + d.leadsRD, 0)
    const totalOrders = rangeData.reduce((acc, d) => acc + d.orderQty, 0)
    const totalBudget = rangeData.reduce((acc, d) => acc + (d.quoteValue || 0), 0)

    const dailyLeads = totalLeads / rangeDays
    const dailyOrders = totalOrders / rangeDays
    const dailyBudget = totalBudget / rangeDays

    return {
      leads: Math.round(dailyLeads * 7),
      orders: Math.round(dailyOrders * 7),
      budget: Math.round(dailyBudget * 7),
      historicalDays: rangeDays,
    }
  }, [data, filters.dateRange])

  const renderStatus = (projected: number, target: number, inverseGood = false) => {
    const isSuccess = inverseGood ? projected <= target : projected >= target
    const pct = target > 0 ? (projected / target) * 100 : 0

    return (
      <div className="mt-4 pt-4 border-t flex flex-col gap-2">
        <div className="flex justify-between items-center text-sm font-medium">
          <span className="text-slate-600">Progresso Estimado</span>
          <span className={isSuccess ? 'text-emerald-600' : 'text-amber-600'}>
            {pct.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${isSuccess ? 'bg-emerald-500' : 'bg-amber-500'}`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
        <div className="flex items-center gap-1.5 mt-1 text-xs">
          {isSuccess ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          )}
          <span className={isSuccess ? 'text-emerald-700' : 'text-amber-700 font-medium'}>
            {isSuccess ? 'Meta atingível com o ritmo atual.' : 'Abaixo da meta, necessita atenção.'}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-fade-in-up pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Previsibilidade de Dados
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Defina metas e acompanhe a previsão para a próxima semana baseada no histórico recente.
          </p>
        </div>
        <div className="flex flex-col gap-1 items-end">
          <span className="text-xs text-muted-foreground font-medium">
            Período de Análise Histórica
          </span>
          <DatePickerWithRange
            date={filters.dateRange}
            setDate={(date) => setFilters((prev) => ({ ...prev, dateRange: date }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1 shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50/50 border-b pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-500" />
              Metas Semanais
            </CardTitle>
            <CardDescription>Defina seus objetivos para os próximos 7 dias.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold">Meta de Leads</Label>
              <Input
                type="number"
                value={goals.leads}
                onChange={(e) => setGoals({ ...goals, leads: Number(e.target.value) })}
                className="bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 text-lg font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold">Meta de Pedidos</Label>
              <Input
                type="number"
                value={goals.orders}
                onChange={(e) => setGoals({ ...goals, orders: Number(e.target.value) })}
                className="bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 text-lg font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold">Teto de Gastos (R$)</Label>
              <Input
                type="number"
                value={goals.budget}
                onChange={(e) => setGoals({ ...goals, budget: Number(e.target.value) })}
                className="bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 text-lg font-mono"
              />
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-full bg-indigo-50 text-indigo-800 p-4 rounded-lg flex items-start gap-3 border border-indigo-100 shadow-sm">
            <Zap className="w-5 h-5 mt-0.5 text-indigo-600" />
            <div>
              <h4 className="font-semibold">Insights Preditivos IA</h4>
              <p className="text-sm mt-1 text-indigo-700/80 leading-relaxed">
                As previsões abaixo são calculadas com base na média diária dos últimos{' '}
                {forecast?.historicalDays} dias selecionados no filtro. Ajuste o período para
                influenciar a projeção.
              </p>
            </div>
          </div>

          <Card className="hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                Previsão de Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900 font-mono">
                  {formatNumber(forecast!.leads)}
                </span>
                <span className="text-sm text-slate-500">/ {formatNumber(goals.leads)} meta</span>
              </div>
              {renderStatus(forecast!.leads, goals.leads)}
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                Previsão de Pedidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900 font-mono">
                  {formatNumber(forecast!.orders)}
                </span>
                <span className="text-sm text-slate-500">/ {formatNumber(goals.orders)} meta</span>
              </div>
              {renderStatus(forecast!.orders, goals.orders)}
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-400 to-red-500" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                Projeção de Gastos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900 font-mono">
                  {formatCurrency(forecast!.budget)}
                </span>
              </div>
              <div className="text-sm text-slate-500 mt-1">
                Limite: {formatCurrency(goals.budget)}
              </div>
              {renderStatus(forecast!.budget, goals.budget, true)}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
