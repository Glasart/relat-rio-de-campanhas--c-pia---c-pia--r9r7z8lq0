import { useMemo, useCallback, useState } from 'react'
import { useAppContext } from '@/context/AppContext'
import { MetricCard } from '@/components/MetricCard'
import { ComparisonTable } from '@/components/ComparisonTable'
import { OtherChannelsTable } from '@/components/OtherChannelsTable'
import { DatePickerWithRange } from '@/components/DatePickerWithRange'
import { subDays, parseISO, startOfDay, endOfDay, format } from 'date-fns'
import { CampaignRow, OtherChannelRow } from '@/types'
import { OTHER_CHANNELS } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Settings2, Maximize2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'

const tableCols = [
  { id: 'startDate', label: 'Data Início' },
  { id: 'endDate', label: 'Data Fim' },
  { id: 'platform', label: 'Plataforma' },
  { id: 'campaign', label: 'Nome da Campanha' },
  { id: 'audience', label: 'Público' },
]

const otherCols = [
  { id: 'channel', label: 'Canal' },
  { id: 'accesses', label: 'Acessos' },
  { id: 'clicks', label: 'Cliques' },
  { id: 'conversations', label: 'Conversas' },
  { id: 'leads', label: 'Leads' },
  { id: 'quotesQty', label: 'Orçamentos (Qtd)' },
  { id: 'quotesValue', label: 'Orçamentos (R$)' },
  { id: 'ordersQty', label: 'Pedidos (Qtd)' },
  { id: 'ordersValue', label: 'Pedidos (R$)' },
  { id: 'convLeadQuote', label: '% Lead → Orç.' },
  { id: 'convQuoteOrder', label: '% Orç. → Ped.' },
  { id: 'userName', label: 'Usuário Responsável' },
]

const SectionHeader = ({ title, cols, visibleCols, setVisibleCols, onExpand }: any) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-4 gap-4">
      <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
      <div className="flex flex-wrap gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-2 bg-white text-xs">
              <Settings2 className="w-4 h-4" />
              Colunas
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 max-h-80 overflow-y-auto">
            {cols.map((col: any) => (
              <DropdownMenuCheckboxItem
                key={col.id}
                checked={visibleCols[col.id]}
                onCheckedChange={(c) => setVisibleCols((prev: any) => ({ ...prev, [col.id]: !!c }))}
              >
                {col.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-2 bg-white text-xs"
          onClick={onExpand}
        >
          <Maximize2 className="w-4 h-4" /> Expandir
        </Button>
      </div>
    </div>
  )
}

export default function Index() {
  const {
    data,
    setData,
    otherChannelsData,
    setOtherChannelsData,
    filters,
    setFilters,
    logAction,
    user,
  } = useAppContext()

  const { toast } = useToast()

  const [expandedState, setExpandedState] = useState({
    camp: false,
    other: false,
  })

  const [visibleCols, setVisibleCols] = useState<Record<string, boolean>>({
    startDate: true,
    endDate: true,
    platform: true,
    campaign: true,
    audience: true,
  })

  const [visibleOtherCols, setVisibleOtherCols] = useState<Record<string, boolean>>({
    channel: true,
    accesses: true,
    clicks: true,
    conversations: true,
    leads: true,
    quotesQty: true,
    quotesValue: true,
    ordersQty: true,
    ordersValue: true,
    convLeadQuote: true,
    convQuoteOrder: true,
    userName: true,
  })

  const dates = useMemo(() => {
    const baseFrom = filters.dateRange?.from
    const baseTo = filters.dateRange?.to || baseFrom
    const currentFrom = baseFrom ? startOfDay(baseFrom) : new Date(0)
    const currentTo = baseTo ? endOfDay(baseTo) : new Date(8640000000000000)
    const pastFrom = subDays(currentFrom, 7)
    const pastTo = subDays(currentTo, 7)
    return { currentFrom, currentTo, pastFrom, pastTo }
  }, [filters.dateRange])

  const { currMergedCamp, currMergedOther, totals } = useMemo(() => {
    const filterRows = (arr: any[], from: Date, to: Date, isOther = false) => {
      return arr.filter((r) => {
        const dDate = parseISO(isOther ? r.date : r.startDate || r.date || '')
        return dDate >= from && dDate <= to
      })
    }

    const currCampRows = filterRows(data, dates.currentFrom, dates.currentTo)
    const pastCampRows = filterRows(data, dates.pastFrom, dates.pastTo)

    const currOtherRows = filterRows(otherChannelsData, dates.currentFrom, dates.currentTo, true)
    const pastOtherRows = filterRows(otherChannelsData, dates.pastFrom, dates.pastTo, true)

    const aggregateCampaigns = (rows: CampaignRow[], compareRows: CampaignRow[]) => {
      const getRowKey = (r: any) => `${r.platform}|${r.campaign}|${r.audience}`
      const grouped = new Map<string, any>()

      rows.forEach((r) => {
        const key = getRowKey(r)
        if (!grouped.has(key)) {
          grouped.set(key, {
            id: key,
            platform: r.platform,
            campaign: r.campaign,
            audience: r.audience,
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
        }
        const g = grouped.get(key)
        g.impressions += r.impressions || 0
        g.reach += r.reach || 0
        g.clicksAds += r.clicksAds || 0
        g.clicksRD += r.clicksRD || 0
        g.leadsSalesSheet += r.leadsSalesSheet || 0
        g.leadsRD += r.leadsRD || 0
        g.quoteQty += r.quoteQty || 0
        g.quoteValue += r.quoteValue || 0
        g.orderQty += r.orderQty || 0
        g.orderValue += r.orderValue || 0
        g.cost += r.cost || 0
      })

      compareRows.forEach((r) => {
        const key = getRowKey(r)
        if (grouped.has(key)) grouped.get(key).pastClicksRD += r.clicksRD || 0
      })

      return Array.from(grouped.values())
    }

    const aggregateOther = (rows: OtherChannelRow[]) => {
      const groupedOther = new Map<string, any>()
      OTHER_CHANNELS.forEach((ch) => {
        groupedOther.set(ch, {
          channel: ch,
          leads: 0,
          quotesQty: 0,
          quotesValue: 0,
          ordersQty: 0,
          ordersValue: 0,
          clicks: 0,
          conversations: 0,
          accesses: 0,
          userName: undefined,
          userColor: undefined,
        })
      })

      rows.forEach((r) => {
        const g = groupedOther.get(r.channel)
        if (g) {
          g.leads += r.leads || 0
          g.quotesQty += r.quotesQty || 0
          g.quotesValue += r.quotesValue || 0
          g.ordersQty += r.ordersQty || 0
          g.ordersValue += r.ordersValue || 0
          g.clicks += r.clicks || 0
          g.conversations += r.conversations || 0
          g.accesses += r.accesses || 0
          if (r.userName) {
            g.userName = r.userName
            g.userColor = r.userColor
          }
        }
      })
      return Array.from(groupedOther.values())
    }

    const cMergedCamp = aggregateCampaigns(currCampRows, pastCampRows)
    const cMergedOther = aggregateOther(currOtherRows)

    const t = {
      currInvestimento: currCampRows.reduce((s, r) => s + (r.cost || 0), 0),
      pastInvestimento: pastCampRows.reduce((s, r) => s + (r.cost || 0), 0),
      currOrcamento:
        currCampRows.reduce((s, r) => s + (r.quoteValue || 0), 0) +
        currOtherRows.reduce((s, r) => s + (r.quotesValue || 0), 0),
      pastOrcamento:
        pastCampRows.reduce((s, r) => s + (r.quoteValue || 0), 0) +
        pastOtherRows.reduce((s, r) => s + (r.quotesValue || 0), 0),
      currLeads:
        currCampRows.reduce((s, r) => s + (r.leadsRD || 0), 0) +
        currOtherRows.reduce((s, r) => s + (r.leads || 0), 0),
      pastLeads:
        pastCampRows.reduce((s, r) => s + (r.leadsRD || 0), 0) +
        pastOtherRows.reduce((s, r) => s + (r.leads || 0), 0),
      currPedidos:
        currCampRows.reduce((s, r) => s + (r.orderQty || 0), 0) +
        currOtherRows.reduce((s, r) => s + (r.ordersQty || 0), 0),
      pastPedidos:
        pastCampRows.reduce((s, r) => s + (r.orderQty || 0), 0) +
        pastOtherRows.reduce((s, r) => s + (r.ordersQty || 0), 0),
    }

    return {
      currMergedCamp: cMergedCamp,
      currMergedOther: cMergedOther,
      totals: t,
    }
  }, [data, otherChannelsData, dates])

  const handleUpdateCampGeneric = useCallback(
    (id: string, field: string, newValue: number) => {
      const [platform, campaign, audience] = id.split('|')
      const fromD = dates.currentFrom
      const toD = dates.currentTo

      setData((prev) => {
        const newData = [...prev]
        const matchingRows = newData.filter((r) => {
          const dDate = parseISO(r.startDate || r.date || '')
          return (
            r.platform === platform &&
            r.campaign === campaign &&
            r.audience === audience &&
            dDate >= fromD &&
            dDate <= toD
          )
        })

        if (matchingRows.length > 0) {
          const currentTotal = matchingRows.reduce(
            (sum, r) => sum + (Number(r[field as keyof CampaignRow]) || 0),
            0,
          )
          const diff = newValue - currentTotal
          const firstRowIndex = newData.findIndex((r) => r.id === matchingRows[0].id)
          if (firstRowIndex !== -1) {
            const oldRow = newData[firstRowIndex]
            const newRow = {
              ...oldRow,
              [field]: (Number(oldRow[field as keyof CampaignRow]) || 0) + diff,
              version: (oldRow.version || 1) + 1,
            }
            newData[firstRowIndex] = newRow
            logAction('UPDATE_DATA', `Editou ${field} em ${oldRow.campaign}`, {
              id: oldRow.id,
              prev: oldRow,
              next: newRow,
            })
          }
        }
        return newData
      })
      toast({
        title: 'Atualização Automática',
        description: 'Os dados estão sendo sincronizados com a nuvem.',
        duration: 2000,
      })
    },
    [dates, setData, logAction, toast],
  )

  const handleBulkUpdateCampGeneric = useCallback(
    (ids: string[], updates: Record<string, number>) => {
      const fromD = dates.currentFrom
      const toD = dates.currentTo

      setData((prev) => {
        const newData = [...prev]
        ids.forEach((id) => {
          const [platform, campaign, audience] = id.split('|')
          const matchingRows = newData.filter((r) => {
            const dDate = parseISO(r.startDate || r.date || '')
            return (
              r.platform === platform &&
              r.campaign === campaign &&
              r.audience === audience &&
              dDate >= fromD &&
              dDate <= toD
            )
          })

          if (matchingRows.length > 0) {
            const firstRowIndex = newData.findIndex((r) => r.id === matchingRows[0].id)
            if (firstRowIndex !== -1) {
              const oldRow = newData[firstRowIndex]
              const newRow = { ...oldRow, version: (oldRow.version || 1) + 1 }
              Object.entries(updates).forEach(([field, val]) => {
                const currentTotal = matchingRows.reduce(
                  (sum, r) => sum + (Number(r[field as keyof CampaignRow]) || 0),
                  0,
                )
                const diff = val - currentTotal
                newRow[field as keyof CampaignRow] =
                  (Number(oldRow[field as keyof CampaignRow]) || 0) + diff
              })
              newData[firstRowIndex] = newRow
            }
          }
        })
        logAction('BULK_UPDATE_DATA', `Edição em massa aplicada a ${ids.length} campanhas`, {
          updates,
        })
        return newData
      })
      toast({
        title: 'Edição em Lote',
        description: 'Sincronizando alterações em massa com a nuvem...',
      })
    },
    [dates, setData, logAction, toast],
  )

  const handleDeleteCampGeneric = useCallback(
    (id: string) => {
      const [platform, campaign, audience] = id.split('|')
      const fromD = dates.currentFrom
      const toD = dates.currentTo

      setData((prev) => {
        const newData = prev.filter((r) => {
          const dDate = parseISO(r.startDate || r.date || '')
          const isMatch =
            r.platform === platform &&
            r.campaign === campaign &&
            r.audience === audience &&
            dDate >= fromD &&
            dDate <= toD
          return !isMatch
        })
        logAction('DELETE_DATA', `Excluiu a campanha ${campaign}`, { id })
        return newData
      })
      toast({ title: 'Ação Sincronizada', description: 'Registro excluído do banco central.' })
    },
    [dates, setData, logAction, toast],
  )

  const handleBulkDeleteCampGeneric = useCallback(
    (ids: string[]) => {
      const fromD = dates.currentFrom
      const toD = dates.currentTo

      setData((prev) => {
        const newData = prev.filter((r) => {
          const dDate = parseISO(r.startDate || r.date || '')
          const key = `${r.platform}|${r.campaign}|${r.audience}`
          const isMatch = ids.includes(key) && dDate >= fromD && dDate <= toD
          return !isMatch
        })
        logAction('BULK_DELETE_DATA', `Excluiu ${ids.length} campanhas`, { ids })
        return newData
      })
      toast({ title: 'Ação Sincronizada', description: 'Exclusão em lote confirmada.' })
    },
    [dates, setData, logAction, toast],
  )

  const handleUpdateOtherGeneric = useCallback(
    (channel: string, field: string, newValue: number) => {
      const fromD = dates.currentFrom
      const toD = dates.currentTo

      setOtherChannelsData((prev) => {
        const newData = [...prev]
        const matchingRows = newData.filter((r) => {
          const dDate = parseISO(r.date)
          return r.channel === channel && dDate >= fromD && dDate <= toD
        })

        if (matchingRows.length > 0) {
          const currentTotal = matchingRows.reduce(
            (sum, r) => sum + (Number(r[field as keyof OtherChannelRow]) || 0),
            0,
          )
          const diff = newValue - currentTotal
          const firstRowIndex = newData.findIndex((r) => r.id === matchingRows[0].id)
          if (firstRowIndex !== -1) {
            const oldRow = newData[firstRowIndex]
            const newRow = {
              ...oldRow,
              [field]: (Number(oldRow[field as keyof OtherChannelRow]) || 0) + diff,
              userName: user?.name || oldRow.userName,
              userColor: user?.color || oldRow.userColor,
            }
            newData[firstRowIndex] = newRow
            logAction('UPDATE_OTHER_DATA', `Editou ${field} do canal ${channel}`, {
              id: oldRow.id,
              prev: oldRow,
              next: newRow,
            })
          }
        } else {
          const dateStr = format(fromD, 'yyyy-MM-dd')
          const newRow: OtherChannelRow = {
            id: crypto.randomUUID(),
            date: dateStr,
            channel,
            leads: 0,
            quotesQty: 0,
            quotesValue: 0,
            ordersQty: 0,
            ordersValue: 0,
            clicks: 0,
            conversations: 0,
            accesses: 0,
            [field]: newValue,
            userName: user?.name,
            userColor: user?.color,
          }
          newData.push(newRow)
          logAction('UPDATE_OTHER_DATA', `Criou registro para ${channel}`, {
            id: newRow.id,
            prev: null,
            next: newRow,
          })
        }
        return newData
      })
      toast({
        title: 'Atualização Automática',
        description: 'Os dados estão sendo sincronizados com a nuvem.',
        duration: 2000,
      })
    },
    [dates, setOtherChannelsData, logAction, user, toast],
  )

  const handleBulkUpdateOtherGeneric = useCallback(
    (channels: string[], updates: Record<string, number>) => {
      const fromD = dates.currentFrom
      const toD = dates.currentTo

      setOtherChannelsData((prev) => {
        const newData = [...prev]
        channels.forEach((channel) => {
          const matchingRows = newData.filter((r) => {
            const dDate = parseISO(r.date)
            return r.channel === channel && dDate >= fromD && dDate <= toD
          })

          if (matchingRows.length > 0) {
            const firstRowIndex = newData.findIndex((r) => r.id === matchingRows[0].id)
            if (firstRowIndex !== -1) {
              const oldRow = newData[firstRowIndex]
              const newRow = {
                ...oldRow,
                userName: user?.name || oldRow.userName,
                userColor: user?.color || oldRow.userColor,
              }
              Object.entries(updates).forEach(([field, val]) => {
                const currentTotal = matchingRows.reduce(
                  (sum, r) => sum + (Number(r[field as keyof OtherChannelRow]) || 0),
                  0,
                )
                const diff = val - currentTotal
                newRow[field as keyof OtherChannelRow] =
                  (Number(oldRow[field as keyof OtherChannelRow]) || 0) + diff
              })
              newData[firstRowIndex] = newRow
            }
          }
        })
        logAction(
          'BULK_UPDATE_OTHER_DATA',
          `Edição em massa aplicada a ${channels.length} canais`,
          { updates },
        )
        return newData
      })
      toast({
        title: 'Edição em Lote',
        description: 'Sincronizando alterações em massa com a nuvem...',
      })
    },
    [dates, setOtherChannelsData, logAction, user, toast],
  )

  const handleDeleteOtherGeneric = useCallback(
    (channel: string) => {
      const fromD = dates.currentFrom
      const toD = dates.currentTo

      setOtherChannelsData((prev) => {
        const newData = prev.filter((r) => {
          const dDate = parseISO(r.date)
          const isMatch = r.channel === channel && dDate >= fromD && dDate <= toD
          return !isMatch
        })
        logAction('DELETE_OTHER_DATA', `Excluiu o canal ${channel}`, { channel })
        return newData
      })
      toast({ title: 'Ação Sincronizada', description: 'Registro excluído do banco central.' })
    },
    [dates, setOtherChannelsData, logAction, toast],
  )

  const handleBulkDeleteOtherGeneric = useCallback(
    (channels: string[]) => {
      const fromD = dates.currentFrom
      const toD = dates.currentTo

      setOtherChannelsData((prev) => {
        const newData = prev.filter((r) => {
          const dDate = parseISO(r.date)
          const isMatch = channels.includes(r.channel) && dDate >= fromD && dDate <= toD
          return !isMatch
        })
        logAction('BULK_DELETE_OTHER_DATA', `Excluiu ${channels.length} canais`, { channels })
        return newData
      })
      toast({ title: 'Ação Sincronizada', description: 'Exclusão em lote confirmada.' })
    },
    [dates, setOtherChannelsData, logAction, toast],
  )

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Comparativo Semanal</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Análise agregada das campanhas e canais com base no período selecionado.
          </p>
        </div>
        <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2">
          <span className="text-sm font-medium text-slate-600 mr-2">Período:</span>
          <DatePickerWithRange
            date={filters.dateRange}
            setDate={(date) => setFilters((prev) => ({ ...prev, dateRange: date }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Investimento Total"
          current={totals.currInvestimento}
          past={totals.pastInvestimento}
          type="currency"
          inverseGood
        />
        <MetricCard
          title="Orçamento Total"
          current={totals.currOrcamento}
          past={totals.pastOrcamento}
          type="currency"
        />
        <MetricCard
          title="Leads Totais"
          current={totals.currLeads}
          past={totals.pastLeads}
          type="number"
        />
        <MetricCard
          title="Pedidos Totais"
          current={totals.currPedidos}
          past={totals.pastPedidos}
          type="number"
        />
      </div>

      <div className="space-y-8">
        <div className="pt-4">
          <SectionHeader
            title="Performance de Campanhas"
            cols={tableCols}
            visibleCols={visibleCols}
            setVisibleCols={setVisibleCols}
            onExpand={() => setExpandedState((prev) => ({ ...prev, camp: true }))}
          />
          <ComparisonTable
            mergedData={currMergedCamp}
            dateRange={{ from: dates.currentFrom, to: dates.currentTo }}
            onUpdate={handleUpdateCampGeneric}
            onBulkUpdate={handleBulkUpdateCampGeneric}
            onDelete={handleDeleteCampGeneric}
            onBulkDelete={handleBulkDeleteCampGeneric}
            visibleCols={visibleCols}
          />
        </div>

        <div className="pt-4">
          <SectionHeader
            title="Outros Canais"
            cols={otherCols}
            visibleCols={visibleOtherCols}
            setVisibleCols={setVisibleOtherCols}
            onExpand={() => setExpandedState((prev) => ({ ...prev, other: true }))}
          />
          <OtherChannelsTable
            data={currMergedOther}
            onUpdate={handleUpdateOtherGeneric}
            onBulkUpdate={handleBulkUpdateOtherGeneric}
            onDelete={handleDeleteOtherGeneric}
            onBulkDelete={handleBulkDeleteOtherGeneric}
            visibleCols={visibleOtherCols}
          />
        </div>
      </div>

      <Dialog
        open={expandedState.camp}
        onOpenChange={(v) => setExpandedState((prev) => ({ ...prev, camp: v }))}
      >
        <DialogContent className="max-w-[98vw] w-full h-[96vh] flex flex-col p-4 sm:p-6 gap-4">
          <DialogHeader className="flex flex-row items-center justify-between border-b pb-2">
            <DialogTitle className="text-xl">Visualização Completa - Campanhas</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden min-h-0 -mx-2 sm:-mx-0">
            <ComparisonTable
              mergedData={currMergedCamp}
              dateRange={{ from: dates.currentFrom, to: dates.currentTo }}
              onUpdate={handleUpdateCampGeneric}
              onBulkUpdate={handleBulkUpdateCampGeneric}
              onDelete={handleDeleteCampGeneric}
              onBulkDelete={handleBulkDeleteCampGeneric}
              visibleCols={visibleCols}
              isExpanded={true}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={expandedState.other}
        onOpenChange={(v) => setExpandedState((prev) => ({ ...prev, other: v }))}
      >
        <DialogContent className="max-w-[98vw] w-full h-[96vh] flex flex-col p-4 sm:p-6 gap-4">
          <DialogHeader className="flex flex-row items-center justify-between border-b pb-2">
            <DialogTitle className="text-xl">Visualização Completa - Outros Canais</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden min-h-0 -mx-2 sm:-mx-0">
            <OtherChannelsTable
              data={currMergedOther}
              onUpdate={handleUpdateOtherGeneric}
              onBulkUpdate={handleBulkUpdateOtherGeneric}
              onDelete={handleDeleteOtherGeneric}
              onBulkDelete={handleBulkDeleteOtherGeneric}
              visibleCols={visibleOtherCols}
              isExpanded={true}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
