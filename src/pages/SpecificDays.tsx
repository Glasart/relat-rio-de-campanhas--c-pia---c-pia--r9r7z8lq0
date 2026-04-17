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
import { Settings2, Maximize2, RotateCcw } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
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
import { useSpecificDatabase } from '@/hooks/useSpecificDatabase'
import { DatabaseHeader } from '@/components/database/DatabaseHeader'
import { DatabaseTable } from '@/components/database/DatabaseTable'
import { DatabaseModals } from '@/components/database/DatabaseModals'
import { useToast } from '@/hooks/use-toast'

const tableCols = [
  { id: 'startDate', label: 'Data Início' },
  { id: 'endDate', label: 'Data Fim' },
  { id: 'platform', label: 'Plataforma e Canal' },
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

const SectionHeader = ({ title, onReset, cols, visibleCols, setVisibleCols, onExpand }: any) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-4 gap-4">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
        {onReset && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50 gap-1 px-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Zerar Bloco
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Zerar Dados do Bloco</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja zerar todas as métricas deste período? As campanhas e
                  canais serão mantidos, mas com valores em zero.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={onReset} className="bg-red-600 hover:bg-red-700">
                  Confirmar Reset
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
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

export default function SpecificDays() {
  const {
    data,
    setData,
    otherChannelsData,
    setOtherChannelsData,
    specificFilters: filters,
    setSpecificFilters: setFilters,
    logAction,
    user,
  } = useAppContext()

  const { toast } = useToast()
  const dbState = useSpecificDatabase()

  const [expandedState, setExpandedState] = useState({
    campCurr: false,
    otherCurr: false,
    campPast: false,
    otherPast: false,
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
    const pastPastFrom = subDays(pastFrom, 7)
    const pastPastTo = subDays(pastTo, 7)
    return { currentFrom, currentTo, pastFrom, pastTo, pastPastFrom, pastPastTo }
  }, [filters.dateRange])

  const { currMergedCamp, pastMergedCamp, currMergedOther, pastMergedOther, totals } =
    useMemo(() => {
      const filterRows = (arr: any[], from: Date, to: Date, isOther = false) => {
        return arr.filter((r) => {
          const dDate = parseISO(isOther ? r.date : r.startDate || r.date || '')
          return dDate >= from && dDate <= to
        })
      }

      const currCampRows = filterRows(data, dates.currentFrom, dates.currentTo)
      const pastCampRows = filterRows(data, dates.pastFrom, dates.pastTo)
      const pastPastCampRows = filterRows(data, dates.pastPastFrom, dates.pastPastTo)

      const currOtherRows = filterRows(otherChannelsData, dates.currentFrom, dates.currentTo, true)
      const pastOtherRows = filterRows(otherChannelsData, dates.pastFrom, dates.pastTo, true)

      const aggregateCampaigns = (
        rows: CampaignRow[],
        compareRows: CampaignRow[],
        allCampRows: CampaignRow[],
      ) => {
        const getRowKey = (r: any) => `${r.platform}|${r.campaign}|${r.audience}`
        const grouped = new Map<string, any>()

        allCampRows.forEach((r) => {
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
              hasData: false,
            })
          }
        })

        rows.forEach((r) => {
          const key = getRowKey(r)
          const g = grouped.get(key)
          if (g) {
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
            g.hasData = true
          }
        })

        compareRows.forEach((r) => {
          const key = getRowKey(r)
          const g = grouped.get(key)
          if (g) {
            g.pastClicksRD += r.clicksRD || 0
            g.hasData = true
          }
        })

        return Array.from(grouped.values()).filter((g) => g.hasData)
      }

      const aggregateOther = (rows: OtherChannelRow[], allOtherRows: OtherChannelRow[]) => {
        const groupedOther = new Map<string, any>()

        const uniqueChannelsInRows = Array.from(new Set(allOtherRows.map((r) => r.channel)))
        const allChannels = [
          ...uniqueChannelsInRows,
          ...OTHER_CHANNELS.filter((c) => !uniqueChannelsInRows.includes(c)),
        ]

        allChannels.forEach((ch) => {
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

      const cMergedCamp = aggregateCampaigns(currCampRows, pastCampRows, data)
      const pMergedCamp = aggregateCampaigns(pastCampRows, pastPastCampRows, data)
      const cMergedOther = aggregateOther(currOtherRows, otherChannelsData)
      const pMergedOther = aggregateOther(pastOtherRows, otherChannelsData)

      const t = {
        currInvestimento: currCampRows.reduce((s, r) => s + (r.cost || 0), 0),
        pastInvestimento: pastCampRows.reduce((s, r) => s + (r.cost || 0), 0),
        currOrcamento:
          currCampRows.reduce((s, r) => s + (r.quoteValue || 0), 0) +
          currOtherRows.reduce((s, r) => s + (r.quotesValue || 0), 0),
        pastOrcamento:
          pastCampRows.reduce((s, r) => s + (r.quoteValue || 0), 0) +
          pastOtherRows.reduce((s, r) => s + (r.quotesValue || 0), 0),
        currOrcamentoQtd:
          currCampRows.reduce((s, r) => s + (r.quoteQty || 0), 0) +
          currOtherRows.reduce((s, r) => s + (r.quotesQty || 0), 0),
        pastOrcamentoQtd:
          pastCampRows.reduce((s, r) => s + (r.quoteQty || 0), 0) +
          pastOtherRows.reduce((s, r) => s + (r.quotesQty || 0), 0),
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
        currPedidosValor:
          currCampRows.reduce((s, r) => s + (r.orderValue || 0), 0) +
          currOtherRows.reduce((s, r) => s + (r.ordersValue || 0), 0),
        pastPedidosValor:
          pastCampRows.reduce((s, r) => s + (r.orderValue || 0), 0) +
          pastOtherRows.reduce((s, r) => s + (r.ordersValue || 0), 0),
      }

      return {
        currMergedCamp: cMergedCamp,
        pastMergedCamp: pMergedCamp,
        currMergedOther: cMergedOther,
        pastMergedOther: pMergedOther,
        totals: t,
      }
    }, [data, otherChannelsData, dates])

  const handleReorderCampGeneric = useCallback(
    (draggedId: string, targetId: string) => {
      const [dPlat, dCamp, dAud] = draggedId.split('|')
      const [tPlat, tCamp, tAud] = targetId.split('|')

      setData((prev) => {
        const draggedRows = prev.filter(
          (r) => r.platform === dPlat && r.campaign === dCamp && r.audience === dAud,
        )
        const otherRows = prev.filter(
          (r) => !(r.platform === dPlat && r.campaign === dCamp && r.audience === dAud),
        )

        const targetIndex = otherRows.findIndex(
          (r) => r.platform === tPlat && r.campaign === tCamp && r.audience === tAud,
        )

        if (targetIndex === -1) return prev

        logAction('REORDER_SPECIFIC_DATA', `Reordenou a campanha ${dCamp}`, { draggedId, targetId })
        return [...otherRows.slice(0, targetIndex), ...draggedRows, ...otherRows.slice(targetIndex)]
      })
    },
    [setData, logAction],
  )

  const handleReorderOtherGeneric = useCallback(
    (draggedId: string, targetId: string) => {
      setOtherChannelsData((prev) => {
        let draggedRows = prev.filter((r) => r.channel === draggedId)
        const otherRows = prev.filter((r) => r.channel !== draggedId)

        if (draggedRows.length === 0) {
          draggedRows = [
            {
              id: crypto.randomUUID(),
              date: new Date().toISOString(),
              channel: draggedId,
              leads: 0,
              quotesQty: 0,
              quotesValue: 0,
              ordersQty: 0,
              ordersValue: 0,
            },
          ]
        }

        let targetIndex = otherRows.findIndex((r) => r.channel === targetId)

        if (targetIndex === -1) {
          otherRows.push({
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            channel: targetId,
            leads: 0,
            quotesQty: 0,
            quotesValue: 0,
            ordersQty: 0,
            ordersValue: 0,
          })
          targetIndex = otherRows.length - 1
        }

        logAction('REORDER_OTHER_DATA', `Reordenou o canal ${draggedId}`, { draggedId, targetId })
        return [...otherRows.slice(0, targetIndex), ...draggedRows, ...otherRows.slice(targetIndex)]
      })
    },
    [setOtherChannelsData, logAction],
  )

  const handleUpdateCampGeneric = useCallback(
    (id: string, field: string, newValue: number, isPast: boolean) => {
      const [platform, campaign, audience] = id.split('|')
      const fromD = isPast ? dates.pastFrom : dates.currentFrom
      const toD = isPast ? dates.pastTo : dates.currentTo

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
            }
            newData[firstRowIndex] = newRow
            logAction('UPDATE_SPECIFIC_DATA', `Atualizou ${field} em ${oldRow.campaign}`, {
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
        description: 'Ação sincronizada com a nuvem.',
        duration: 2000,
      })
    },
    [dates, setData, logAction, toast],
  )

  const handleBulkUpdateCampGeneric = useCallback(
    (ids: string[], updates: Record<string, number>, isPast: boolean) => {
      const fromD = isPast ? dates.pastFrom : dates.currentFrom
      const toD = isPast ? dates.pastTo : dates.currentTo

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
              const newRow = { ...oldRow }
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
        logAction(
          'BULK_UPDATE_SPECIFIC_DATA',
          `Edição em massa aplicada a ${ids.length} campanhas`,
          { updates },
        )
        return newData
      })
      toast({
        title: 'Edição em Lote',
        description: 'Sincronizando com a nuvem...',
      })
    },
    [dates, setData, logAction, toast],
  )

  const handleBulkPasteCampGeneric = useCallback(
    (updates: { id: string; field: string; value: number }[], isPast: boolean) => {
      const fromD = isPast ? dates.pastFrom : dates.currentFrom
      const toD = isPast ? dates.pastTo : dates.currentTo

      setData((prev) => {
        const newData = [...prev]
        let updatedCount = 0

        updates.forEach(({ id, field, value }) => {
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
              const currentTotal = matchingRows.reduce(
                (sum, r) => sum + (Number(r[field as keyof CampaignRow]) || 0),
                0,
              )
              const diff = value - currentTotal

              const newRow = {
                ...oldRow,
                [field]: (Number(oldRow[field as keyof CampaignRow]) || 0) + diff,
              }
              newData[firstRowIndex] = newRow
              updatedCount++
            }
          }
        })

        if (updatedCount > 0) {
          logAction('BULK_PASTE_SPECIFIC_DATA', `Colou ${updatedCount} métricas em massa`, {
            updates,
          })
        }
        return newData
      })
      toast({ title: 'Colagem Múltipla', description: 'Sincronizando valores com a nuvem...' })
    },
    [dates, setData, logAction, toast],
  )

  const handleDeleteCampGeneric = useCallback(
    (id: string, isPast: boolean) => {
      const [platform, campaign, audience] = id.split('|')
      const fromD = isPast ? dates.pastFrom : dates.currentFrom
      const toD = isPast ? dates.pastTo : dates.currentTo

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
        logAction('DELETE_SPECIFIC_DATA', `Excluiu a campanha ${campaign}`, { id })
        return newData
      })
      toast({ title: 'Ação Sincronizada', description: 'Registro excluído.' })
    },
    [dates, setData, logAction, toast],
  )

  const handleBulkDeleteCampGeneric = useCallback(
    (ids: string[], isPast: boolean) => {
      const fromD = isPast ? dates.pastFrom : dates.currentFrom
      const toD = isPast ? dates.pastTo : dates.currentTo

      setData((prev) => {
        const newData = prev.filter((r) => {
          const dDate = parseISO(r.startDate || r.date || '')
          const key = `${r.platform}|${r.campaign}|${r.audience}`
          const isMatch = ids.includes(key) && dDate >= fromD && dDate <= toD
          return !isMatch
        })
        logAction('BULK_DELETE_SPECIFIC_DATA', `Excluiu ${ids.length} campanhas`, { ids })
        return newData
      })
      toast({ title: 'Ação Sincronizada', description: 'Exclusões em lote confirmadas.' })
    },
    [dates, setData, logAction, toast],
  )

  const handleUpdateOtherGeneric = useCallback(
    (channel: string, field: string, newValue: number, isPast: boolean) => {
      const fromD = isPast ? dates.pastFrom : dates.currentFrom
      const toD = isPast ? dates.pastTo : dates.currentTo

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
            logAction('UPDATE_OTHER_DATA', `Atualizou ${field} do canal ${channel}`, {
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
        description: 'Sincronizando com a nuvem...',
        duration: 2000,
      })
    },
    [dates, setOtherChannelsData, logAction, user, toast],
  )

  const handleBulkUpdateOtherGeneric = useCallback(
    (channels: string[], updates: Record<string, number>, isPast: boolean) => {
      const fromD = isPast ? dates.pastFrom : dates.currentFrom
      const toD = isPast ? dates.pastTo : dates.currentTo

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
        description: 'Sincronizando com a nuvem...',
      })
    },
    [dates, setOtherChannelsData, logAction, user, toast],
  )

  const handleDeleteOtherGeneric = useCallback(
    (channel: string, isPast: boolean) => {
      const fromD = isPast ? dates.pastFrom : dates.currentFrom
      const toD = isPast ? dates.pastTo : dates.currentTo

      setOtherChannelsData((prev) => {
        const newData = prev.filter((r) => {
          const dDate = parseISO(r.date)
          const isMatch = r.channel === channel && dDate >= fromD && dDate <= toD
          return !isMatch
        })
        logAction('DELETE_OTHER_DATA', `Excluiu o canal ${channel}`, { channel })
        return newData
      })
      toast({ title: 'Ação Sincronizada', description: 'Registro excluído.' })
    },
    [dates, setOtherChannelsData, logAction, toast],
  )

  const handleBulkDeleteOtherGeneric = useCallback(
    (channels: string[], isPast: boolean) => {
      const fromD = isPast ? dates.pastFrom : dates.currentFrom
      const toD = isPast ? dates.pastTo : dates.currentTo

      setOtherChannelsData((prev) => {
        const newData = prev.filter((r) => {
          const dDate = parseISO(r.date)
          const isMatch = channels.includes(r.channel) && dDate >= fromD && dDate <= toD
          return !isMatch
        })
        logAction('BULK_DELETE_OTHER_DATA', `Excluiu ${channels.length} canais`, { channels })
        return newData
      })
      toast({ title: 'Ação Sincronizada', description: 'Exclusões em lote confirmadas.' })
    },
    [dates, setOtherChannelsData, logAction, toast],
  )

  const handleResetCurrentCampaigns = () => {
    setData((prev) =>
      prev.map((r) => {
        const dDate = parseISO(r.startDate || r.date || '')
        if (dDate >= dates.currentFrom && dDate <= dates.currentTo) {
          return {
            ...r,
            cost: 0,
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
            pastClicksRD: 0,
          }
        }
        return r
      }),
    )
    logAction('RESET_BLOCK', 'Zerou métricas de Campanhas (Atual)', {})
    toast({
      title: 'Ação Sincronizada',
      description: 'O bloco foi zerado para todos os usuários.',
    })
  }

  const handleResetCurrentOther = () => {
    setOtherChannelsData((prev) =>
      prev.map((r) => {
        const dDate = parseISO(r.date)
        if (dDate >= dates.currentFrom && dDate <= dates.currentTo) {
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
    logAction('RESET_BLOCK', 'Zerou métricas de Outros Canais (Atual)', {})
    toast({
      title: 'Ação Sincronizada',
      description: 'O bloco foi zerado para todos os usuários.',
    })
  }

  const handleResetPastCampaigns = () => {
    setData((prev) =>
      prev.map((r) => {
        const dDate = parseISO(r.startDate || r.date || '')
        if (dDate >= dates.pastFrom && dDate <= dates.pastTo) {
          return {
            ...r,
            cost: 0,
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
            pastClicksRD: 0,
          }
        }
        return r
      }),
    )
    logAction('RESET_BLOCK', 'Zerou métricas de Campanhas (Anterior)', {})
    toast({
      title: 'Ação Sincronizada',
      description: 'O bloco foi zerado para todos os usuários.',
    })
  }

  const handleResetPastOther = () => {
    setOtherChannelsData((prev) =>
      prev.map((r) => {
        const dDate = parseISO(r.date)
        if (dDate >= dates.pastFrom && dDate <= dates.pastTo) {
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
    logAction('RESET_BLOCK', 'Zerou métricas de Outros Canais (Anterior)', {})
    toast({
      title: 'Ação Sincronizada',
      description: 'O bloco foi zerado para todos os usuários.',
    })
  }

  const handleGlobalZeroSpecific = () => {
    setData((prev) =>
      prev.map((r) => ({
        ...r,
        cost: 0,
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
        pastClicksRD: 0,
      })),
    )
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
    logAction('GLOBAL_ZERO_SPECIFIC', 'Zerou todas as métricas na visão de dias específicos', {})
    toast({
      title: 'Ação Sincronizada',
      description: 'Todos os valores numéricos foram redefinidos para 0 na nuvem.',
    })
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-fade-in-up">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Comparativo Dias Específicos
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Visualização em blocos comparativos para analisar períodos específicos lado a lado com o
            histórico central.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="gap-2 text-amber-600 border-amber-200 hover:bg-amber-50"
              >
                <RotateCcw className="w-4 h-4" /> Zerar Números Globais
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Zerar Números?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to zero all numeric data? This action cannot be undone once
                  saved.
                  <br />
                  <br />
                  <span className="text-xs text-muted-foreground">
                    (Tem certeza que deseja zerar todos os dados numéricos? Esta ação redefinirá
                    todas as métricas das campanhas e canais para 0, mantendo apenas as informações
                    de registro).
                  </span>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleGlobalZeroSpecific}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  Confirmar Reset
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600 mr-2">Data Alvo:</span>
            <DatePickerWithRange
              date={filters.dateRange}
              setDate={(date) => setFilters((prev) => ({ ...prev, dateRange: date }))}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard
          title="Investimento Total"
          current={totals.currInvestimento}
          past={totals.pastInvestimento}
          type="currency"
          inverseGood
        />
        <MetricCard
          title="Orçamentos (Qtd)"
          current={totals.currOrcamentoQtd}
          past={totals.pastOrcamentoQtd}
          type="number"
        />
        <MetricCard
          title="Valor Orçamentos"
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
          title="Pedidos (Qtd)"
          current={totals.currPedidos}
          past={totals.pastPedidos}
          type="number"
        />
        <MetricCard
          title="Valor Pedidos"
          current={totals.currPedidosValor}
          past={totals.pastPedidosValor}
          type="currency"
        />
      </div>

      <div className="space-y-12">
        {/* Current Period Blocks */}
        <div className="space-y-8">
          <div className="pt-4">
            <SectionHeader
              title="Resultados Unificados (Período Atual)"
              onReset={handleResetCurrentCampaigns}
              cols={tableCols}
              visibleCols={visibleCols}
              setVisibleCols={setVisibleCols}
              onExpand={() => setExpandedState((prev) => ({ ...prev, campCurr: true }))}
            />
            <ComparisonTable
              mergedData={currMergedCamp}
              dateRange={{ from: dates.currentFrom, to: dates.currentTo }}
              onUpdate={(id, f, v) => handleUpdateCampGeneric(id, f, v, false)}
              onBulkUpdate={(ids, u) => handleBulkUpdateCampGeneric(ids, u, false)}
              onBulkPasteUpdate={(updates) => handleBulkPasteCampGeneric(updates, false)}
              onDelete={(id) => handleDeleteCampGeneric(id, false)}
              onBulkDelete={(ids) => handleBulkDeleteCampGeneric(ids, false)}
              onReorder={handleReorderCampGeneric}
              visibleCols={visibleCols}
            />
          </div>

          <div className="pt-4">
            <SectionHeader
              title="Outros Canais (Período Atual)"
              onReset={handleResetCurrentOther}
              cols={otherCols}
              visibleCols={visibleOtherCols}
              setVisibleCols={setVisibleOtherCols}
              onExpand={() => setExpandedState((prev) => ({ ...prev, otherCurr: true }))}
            />
            <OtherChannelsTable
              data={currMergedOther}
              onUpdate={(ch, f, v) => handleUpdateOtherGeneric(ch, f, v, false)}
              onBulkUpdate={(chs, u) => handleBulkUpdateOtherGeneric(chs, u, false)}
              onDelete={(ch) => handleDeleteOtherGeneric(ch, false)}
              onBulkDelete={(chs) => handleBulkDeleteOtherGeneric(chs, false)}
              onReorder={handleReorderOtherGeneric}
              visibleCols={visibleOtherCols}
            />
          </div>
        </div>

        <div className="border-t-[3px] border-dashed border-slate-200"></div>

        {/* Previous Period Blocks */}
        <div className="space-y-8">
          <div className="pt-4">
            <SectionHeader
              title="Resultados Unificados (Período Anterior)"
              onReset={handleResetPastCampaigns}
              cols={tableCols}
              visibleCols={visibleCols}
              setVisibleCols={setVisibleCols}
              onExpand={() => setExpandedState((prev) => ({ ...prev, campPast: true }))}
            />
            <ComparisonTable
              mergedData={pastMergedCamp}
              dateRange={{ from: dates.pastFrom, to: dates.pastTo }}
              onUpdate={(id, f, v) => handleUpdateCampGeneric(id, f, v, true)}
              onBulkUpdate={(ids, u) => handleBulkUpdateCampGeneric(ids, u, true)}
              onBulkPasteUpdate={(updates) => handleBulkPasteCampGeneric(updates, true)}
              onDelete={(id) => handleDeleteCampGeneric(id, true)}
              onBulkDelete={(ids) => handleBulkDeleteCampGeneric(ids, true)}
              onReorder={handleReorderCampGeneric}
              visibleCols={visibleCols}
            />
          </div>

          <div className="pt-4">
            <SectionHeader
              title="Outros Canais (Período Anterior)"
              onReset={handleResetPastOther}
              cols={otherCols}
              visibleCols={visibleOtherCols}
              setVisibleCols={setVisibleOtherCols}
              onExpand={() => setExpandedState((prev) => ({ ...prev, otherPast: true }))}
            />
            <OtherChannelsTable
              data={pastMergedOther}
              onUpdate={(ch, f, v) => handleUpdateOtherGeneric(ch, f, v, true)}
              onBulkUpdate={(chs, u) => handleBulkUpdateOtherGeneric(chs, u, true)}
              onDelete={(ch) => handleDeleteOtherGeneric(ch, true)}
              onBulkDelete={(chs) => handleBulkDeleteOtherGeneric(chs, true)}
              onReorder={handleReorderOtherGeneric}
              visibleCols={visibleOtherCols}
            />
          </div>
        </div>
      </div>

      <div className="pt-12 border-t-[3px] border-solid border-slate-300 mt-12 pb-12">
        <DatabaseHeader
          state={dbState}
          title="Base de Dados Local (Dias Específicos)"
          description="Gerencie os dados centrais nesta visão. As edições aqui são sincronizadas instantaneamente para refletirem para todos os usuários."
        />
        <div className="mt-6">
          <DatabaseTable state={dbState} />
        </div>
        <DatabaseModals state={dbState} />
      </div>

      {/* Expanded Modals */}
      <Dialog
        open={expandedState.campCurr}
        onOpenChange={(v) => setExpandedState((prev) => ({ ...prev, campCurr: v }))}
      >
        <DialogContent className="max-w-[98vw] w-full h-[96vh] flex flex-col p-4 sm:p-6 gap-4">
          <DialogHeader className="flex flex-row items-center justify-between border-b pb-2">
            <DialogTitle className="text-xl">
              Visualização Completa - Resultados Unificados (Atual)
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden min-h-0 -mx-2 sm:-mx-0">
            <ComparisonTable
              mergedData={currMergedCamp}
              dateRange={{ from: dates.currentFrom, to: dates.currentTo }}
              onUpdate={(id, f, v) => handleUpdateCampGeneric(id, f, v, false)}
              onBulkUpdate={(ids, u) => handleBulkUpdateCampGeneric(ids, u, false)}
              onBulkPasteUpdate={(updates) => handleBulkPasteCampGeneric(updates, false)}
              onDelete={(id) => handleDeleteCampGeneric(id, false)}
              onBulkDelete={(ids) => handleBulkDeleteCampGeneric(ids, false)}
              onReorder={handleReorderCampGeneric}
              visibleCols={visibleCols}
              isExpanded={true}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={expandedState.otherCurr}
        onOpenChange={(v) => setExpandedState((prev) => ({ ...prev, otherCurr: v }))}
      >
        <DialogContent className="max-w-[98vw] w-full h-[96vh] flex flex-col p-4 sm:p-6 gap-4">
          <DialogHeader className="flex flex-row items-center justify-between border-b pb-2">
            <DialogTitle className="text-xl">
              Visualização Completa - Outros Canais (Atual)
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden min-h-0 -mx-2 sm:-mx-0">
            <OtherChannelsTable
              data={currMergedOther}
              onUpdate={(ch, f, v) => handleUpdateOtherGeneric(ch, f, v, false)}
              onBulkUpdate={(chs, u) => handleBulkUpdateOtherGeneric(chs, u, false)}
              onDelete={(ch) => handleDeleteOtherGeneric(ch, false)}
              onBulkDelete={(chs) => handleBulkDeleteOtherGeneric(chs, false)}
              onReorder={handleReorderOtherGeneric}
              visibleCols={visibleOtherCols}
              isExpanded={true}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={expandedState.campPast}
        onOpenChange={(v) => setExpandedState((prev) => ({ ...prev, campPast: v }))}
      >
        <DialogContent className="max-w-[98vw] w-full h-[96vh] flex flex-col p-4 sm:p-6 gap-4">
          <DialogHeader className="flex flex-row items-center justify-between border-b pb-2">
            <DialogTitle className="text-xl">
              Visualização Completa - Resultados Unificados (Anterior)
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden min-h-0 -mx-2 sm:-mx-0">
            <ComparisonTable
              mergedData={pastMergedCamp}
              dateRange={{ from: dates.pastFrom, to: dates.pastTo }}
              onUpdate={(id, f, v) => handleUpdateCampGeneric(id, f, v, true)}
              onBulkUpdate={(ids, u) => handleBulkUpdateCampGeneric(ids, u, true)}
              onBulkPasteUpdate={(updates) => handleBulkPasteCampGeneric(updates, true)}
              onDelete={(id) => handleDeleteCampGeneric(id, true)}
              onBulkDelete={(ids) => handleBulkDeleteCampGeneric(ids, true)}
              onReorder={handleReorderCampGeneric}
              visibleCols={visibleCols}
              isExpanded={true}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={expandedState.otherPast}
        onOpenChange={(v) => setExpandedState((prev) => ({ ...prev, otherPast: v }))}
      >
        <DialogContent className="max-w-[98vw] w-full h-[96vh] flex flex-col p-4 sm:p-6 gap-4">
          <DialogHeader className="flex flex-row items-center justify-between border-b pb-2">
            <DialogTitle className="text-xl">
              Visualização Completa - Outros Canais (Anterior)
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden min-h-0 -mx-2 sm:-mx-0">
            <OtherChannelsTable
              data={pastMergedOther}
              onUpdate={(ch, f, v) => handleUpdateOtherGeneric(ch, f, v, true)}
              onBulkUpdate={(chs, u) => handleBulkUpdateOtherGeneric(chs, u, true)}
              onDelete={(ch) => handleDeleteOtherGeneric(ch, true)}
              onBulkDelete={(chs) => handleBulkDeleteOtherGeneric(chs, true)}
              onReorder={handleReorderOtherGeneric}
              visibleCols={visibleOtherCols}
              isExpanded={true}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
