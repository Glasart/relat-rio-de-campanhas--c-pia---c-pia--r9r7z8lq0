import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatNumber, formatCurrency, formatPercent } from '@/lib/formatters'
import { ArrowUpRight, ArrowDownRight, RotateCcw } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

function MoMIndicator({
  diffPct,
  diffAbs,
  inverseGood = false,
  isCurrency = false,
}: {
  diffPct: number
  diffAbs: number
  inverseGood?: boolean
  isCurrency?: boolean
}) {
  if (Math.abs(diffPct) < 0.1)
    return (
      <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-sm">
        0% (0)
      </span>
    )
  const isPos = diffPct > 0
  const isGood = inverseGood ? !isPos : isPos

  const absFormatted = isCurrency
    ? formatCurrency(Math.abs(diffAbs))
    : formatNumber(Math.abs(diffAbs))
  const sign = isPos ? '+' : '-'

  return (
    <span
      className={`text-[11px] font-bold flex items-center gap-[2px] px-1.5 py-0.5 rounded-sm ${
        isGood ? 'text-emerald-700 bg-emerald-100' : 'text-red-700 bg-red-100'
      }`}
    >
      {isPos ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
      {sign}
      {Math.abs(diffPct).toFixed(1)}% ({sign}
      {absFormatted})
    </span>
  )
}

export function ResultsTable({
  tableData,
  onZeroSources,
}: {
  tableData: any[]
  onZeroSources?: (sources: string[]) => void
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const isAllSelected = tableData.length > 0 && selected.size === tableData.length

  const toggleAll = (checked: boolean) => {
    if (checked) setSelected(new Set(tableData.map((r) => r.source)))
    else setSelected(new Set())
  }

  const toggleRow = (source: string, checked: boolean) => {
    const next = new Set(selected)
    if (checked) next.add(source)
    else next.delete(source)
    setSelected(next)
  }

  const handleZero = () => {
    if (onZeroSources) {
      onZeroSources(Array.from(selected))
    }
    setSelected(new Set())
  }

  return (
    <Card className="shadow-lg border-0 bg-white ring-1 ring-slate-100 w-full overflow-hidden rounded-xl relative">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b pb-4">
        <CardTitle className="text-xl text-slate-800 font-bold tracking-tight">
          Resultados por Canal <span className="text-primary">(Mês Atual)</span>
        </CardTitle>
        <CardDescription className="text-sm font-medium text-slate-500">
          Comparativo automático de crescimento (Green) e queda (Red) versus mês anterior.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto pb-16">
        <Table className="min-w-[850px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-slate-100/50">
              <TableHead className="w-[50px] pl-4 text-center">
                <Checkbox checked={isAllSelected} onCheckedChange={toggleAll} />
              </TableHead>
              <TableHead className="pl-2 h-12 font-bold text-slate-700">Origem</TableHead>
              <TableHead className="text-right font-semibold text-slate-600">Impressões</TableHead>
              <TableHead className="text-right font-semibold text-slate-600">Alcance</TableHead>
              <TableHead className="text-right font-semibold text-slate-600">Cliques</TableHead>
              <TableHead className="text-right font-semibold text-slate-600">Orçamento</TableHead>
              <TableHead className="text-right font-semibold text-slate-600">Leads</TableHead>
              <TableHead className="text-right font-semibold text-slate-600">Pedidos</TableHead>
              <TableHead className="text-right pr-6 font-semibold text-slate-600">
                Taxas (CTR/CVL)
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.map((row) => (
              <TableRow
                key={row.source}
                className="hover:bg-slate-50/80 transition-colors group"
                data-state={selected.has(row.source) ? 'selected' : undefined}
              >
                <TableCell className="w-[50px] pl-4 text-center">
                  <Checkbox
                    checked={selected.has(row.source)}
                    onCheckedChange={(c) => toggleRow(row.source, !!c)}
                  />
                </TableCell>
                <TableCell className="pl-2 font-bold text-slate-800">{row.source}</TableCell>
                <TableCell className="text-right py-3">
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-semibold text-[15px]">{formatNumber(row.imp)}</span>
                    <MoMIndicator diffPct={row.impDiff} diffAbs={row.impAbs} />
                  </div>
                </TableCell>
                <TableCell className="text-right py-3">
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-semibold text-[15px]">{formatNumber(row.reach)}</span>
                    <MoMIndicator diffPct={row.reachDiff} diffAbs={row.reachAbs} />
                  </div>
                </TableCell>
                <TableCell className="text-right py-3">
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-semibold text-[15px]">{formatNumber(row.clicks)}</span>
                    <MoMIndicator diffPct={row.clicksDiff} diffAbs={row.clicksAbs} />
                  </div>
                </TableCell>
                <TableCell className="text-right py-3">
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-semibold text-[15px]">{formatCurrency(row.budget)}</span>
                    <MoMIndicator
                      diffPct={row.budgetDiff}
                      diffAbs={row.budgetAbs}
                      isCurrency
                      inverseGood
                    />
                  </div>
                </TableCell>
                <TableCell className="text-right py-3">
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-semibold text-[15px]">{formatNumber(row.leads)}</span>
                    <MoMIndicator diffPct={row.leadsDiff} diffAbs={row.leadsAbs} />
                  </div>
                </TableCell>
                <TableCell className="text-right py-3">
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-semibold text-[15px] text-indigo-700">
                      {formatNumber(row.orders)}
                    </span>
                    <MoMIndicator diffPct={row.ordersDiff} diffAbs={row.ordersAbs} />
                  </div>
                </TableCell>
                <TableCell className="text-right pr-6 py-3">
                  <div className="flex flex-col items-end text-xs font-mono gap-1">
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold shadow-sm">
                      CTR: {formatPercent(row.ctr)}
                    </span>
                    <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold shadow-sm">
                      CVL: {formatPercent(row.cvl)}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {tableData.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center h-24 text-muted-foreground">
                  Nenhum dado encontrado para o mês atual.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {selected.size > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-sm text-white px-4 py-3 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] flex items-center gap-4 z-50 border border-slate-800 animate-in slide-in-from-bottom-8">
            <Badge
              variant="secondary"
              className="bg-slate-800 text-white hover:bg-slate-700 border-none"
            >
              {selected.size} selecionados
            </Badge>
            <div className="w-px h-4 bg-slate-700 mx-1"></div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-slate-200 hover:text-white hover:bg-slate-800 gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Zerar Valores
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Zerar Valores</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja zerar todas as métricas para as {selected.size} origens
                    selecionadas no mês atual? Isso redefinirá orçamento, cliques, leads e pedidos
                    para 0 em toda a base correspondente a este mês.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleZero}
                    className="bg-primary hover:bg-primary/90 text-white"
                  >
                    Confirmar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
