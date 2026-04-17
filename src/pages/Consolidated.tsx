import { useAppContext } from '@/context/AppContext'
import { Activity, RotateCcw } from 'lucide-react'
import { useConsolidatedData } from '@/hooks/useConsolidatedData'
import { ResultsTable } from '@/components/consolidated/ResultsTable'
import { FunnelChartCard } from '@/components/consolidated/FunnelChartCard'
import { SemesterCharts } from '@/components/consolidated/SemesterCharts'
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
import { isSameMonth, parseISO } from 'date-fns'

export default function Consolidated() {
  const { data, otherChannelsData, setData, setOtherChannelsData, logAction } = useAppContext()
  const { tableData, funnelData, semesterData } = useConsolidatedData(data, otherChannelsData)

  const handleGlobalZeroOut = () => {
    const resetCampaign = (r: any) => ({
      ...r,
      impressions: 0,
      reach: 0,
      clicksAds: 0,
      clicksRD: 0,
      leadsSalesSheet: 0,
      leadsRD: 0,
      quoteQty: 0,
      quoteValue: 0,
      orderQty: 0,
      orderValue: 0,
      cost: 0,
      pastClicksRD: 0,
    })

    setData((prev) => prev.map(resetCampaign))

    setOtherChannelsData((prev) =>
      prev.map((r) => ({
        ...r,
        leads: 0,
        quotesQty: 0,
        quotesValue: 0,
        ordersQty: 0,
        ordersValue: 0,
        clicks: 0,
        conversations: 0,
        accesses: 0,
      })),
    )

    logAction('GLOBAL_ZERO', 'Zerou todos os dados globais numéricos em toda a base central', {})
  }

  const handleZeroSources = (sources: string[]) => {
    const today = new Date()
    const isCurrentMonth = (dateStr: string | undefined) =>
      dateStr ? isSameMonth(parseISO(dateStr), today) : false

    const zeroCampaign = (r: any) => {
      if (sources.includes(r.platform) && isCurrentMonth(r.startDate || r.date)) {
        return {
          ...r,
          impressions: 0,
          reach: 0,
          clicksAds: 0,
          clicksRD: 0,
          leadsSalesSheet: 0,
          leadsRD: 0,
          quoteQty: 0,
          quoteValue: 0,
          orderQty: 0,
          orderValue: 0,
          cost: 0,
          pastClicksRD: 0,
        }
      }
      return r
    }

    setData((prev) => prev.map(zeroCampaign))

    setOtherChannelsData((prev) =>
      prev.map((r) => {
        if (sources.includes(r.channel) && isCurrentMonth(r.date)) {
          return {
            ...r,
            leads: 0,
            quotesQty: 0,
            quotesValue: 0,
            ordersQty: 0,
            ordersValue: 0,
            clicks: 0,
            conversations: 0,
            accesses: 0,
          }
        }
        return r
      }),
    )

    logAction(
      'ZERO_CONSOLIDATED_SOURCES',
      `Zerou métricas do mês atual na base central para: ${sources.join(', ')}`,
      { sources },
    )
  }

  return (
    <div className="space-y-10 max-w-[1600px] mx-auto animate-fade-in-up pb-12">
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
        <div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3 flex items-center gap-4 relative z-10 drop-shadow-sm">
            <Activity className="w-10 h-10 text-blue-200" /> Dashboard Consolidado
          </h1>
          <p className="text-blue-100 font-medium relative z-10 text-sm md:text-lg max-w-3xl drop-shadow-sm">
            Acompanhe indicadores vibrantes de crescimento e projete a saúde do funil baseada no
            histórico dos últimos 6 meses.
          </p>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              className="relative z-10 bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-lg border border-amber-400/50"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Zerar Números (Global)
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Zerar Todos os Dados Numéricos?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to zero all numeric data? This action cannot be undone.
                <br />
                <br />
                <span className="text-xs text-muted-foreground">
                  (Tem certeza que deseja zerar todas as métricas de campanhas e canais de toda a
                  base de dados central? Esta ação definirá todos os valores para 0 sem excluir os
                  registros e não pode ser desfeita).
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleGlobalZeroOut}
                className="bg-amber-600 hover:bg-amber-700"
              >
                Confirmar Reset
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="flex flex-col gap-10">
        <ResultsTable tableData={tableData} onZeroSources={handleZeroSources} />
        <FunnelChartCard funnelData={funnelData} />
      </div>

      <div className="pt-10 border-t-[3px] border-dashed border-indigo-100">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 mb-8 flex items-center gap-3">
          Desempenho Semestral
          <span className="text-lg font-semibold text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full ml-2">
            Últimos 6 meses
          </span>
        </h2>
        <SemesterCharts semesterData={semesterData} />
      </div>
    </div>
  )
}
