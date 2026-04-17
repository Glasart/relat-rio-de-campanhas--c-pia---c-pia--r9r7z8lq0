import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { formatCurrency, formatNumber, formatPercent, getDiffColor } from '@/lib/formatters'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useAppContext } from '@/context/AppContext'
import { ResizableHeader } from './ResizableHeader'
import { Button } from '@/components/ui/button'
import { Settings2, Trash2, RotateCcw, GripVertical } from 'lucide-react'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
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

function EditableCell({
  value,
  onSave,
  format = 'number',
  onBulkPaste,
}: {
  value: number
  onSave: (val: number) => void
  format?: 'number' | 'currency' | 'percent'
  onBulkPaste?: (values: number[]) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [localVal, setLocalVal] = useState(value.toString())
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setLocalVal(value.toString())
  }, [value])

  const handleBlur = () => {
    setIsEditing(false)
    const parsed = parseFloat(localVal)
    if (!isNaN(parsed) && parsed !== value) {
      onSave(parsed)
    } else {
      setLocalVal(value.toString())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur()
    }
    if (e.key === 'Escape') {
      setLocalVal(value.toString())
      setIsEditing(false)
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (!onBulkPaste) return
    const text = e.clipboardData.getData('text')
    if (text.includes('\n') || text.includes('\r')) {
      e.preventDefault()
      const values = text
        .split(/\r?\n/)
        .map((v) => {
          if (!v.trim()) return NaN
          const cleaned = v
            .replace(/[R$\s%]/g, '')
            .replace(/\./g, '')
            .replace(',', '.')
          return parseFloat(cleaned)
        })
        .filter((v) => !isNaN(v))

      if (values.length > 0) {
        onBulkPaste(values)
        setIsEditing(false)
      }
    }
  }

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        type="number"
        value={localVal}
        onChange={(e) => setLocalVal(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        autoFocus
        className="h-7 w-full min-w-[30px] text-right px-1.5 py-1 text-[11px] font-mono bg-white border-blue-400 focus-visible:ring-1 focus-visible:ring-blue-400"
      />
    )
  }

  const displayValue =
    format === 'currency'
      ? formatCurrency(value)
      : format === 'percent'
        ? formatPercent(value)
        : formatNumber(value)

  return (
    <div
      className="cursor-pointer hover:bg-blue-50/50 hover:ring-1 hover:ring-blue-200 px-1.5 py-1 rounded transition-all w-full text-right font-mono"
      onClick={() => setIsEditing(true)}
      title="Clique para editar ou Cole (Ctrl+V) múltiplos valores"
    >
      {displayValue}
    </div>
  )
}

interface ComparisonTableProps {
  mergedData: any[]
  dateRange: any
  onUpdate: (id: string, field: string, value: number) => void
  onBulkUpdate?: (ids: string[], updates: Record<string, number>) => void
  onDelete?: (id: string) => void
  onBulkDelete?: (ids: string[]) => void
  onBulkPasteUpdate?: (updates: { id: string; field: string; value: number }[]) => void
  onReorder?: (draggedId: string, targetId: string) => void
  visibleCols?: Record<string, boolean>
  isExpanded?: boolean
}

const defaultW = {
  startDate: 70,
  endDate: 70,
  platform: 120,
  campaign: 160,
  audience: 120,
  cost: 90,
  impressions: 80,
  reach: 80,
  clicksRD: 80,
  clicksAds: 80,
  ctr: 70,
  diffClicks: 80,
  leadsSalesSheet: 80,
  leadsRD: 80,
  cvl: 70,
  quoteQty: 80,
  quoteValue: 90,
  orderQty: 80,
  orderValue: 90,
  leadsPerBudget: 80,
  budgetPerOrder: 90,
}

const BULK_EDIT_FIELDS = [
  { id: 'cost', label: 'Invest. (R$)' },
  { id: 'impressions', label: 'Impressões' },
  { id: 'reach', label: 'Alcance' },
  { id: 'clicksRD', label: 'Cliques (RD)' },
  { id: 'clicksAds', label: 'Cliques (Ads)' },
  { id: 'leadsSalesSheet', label: 'Leads (Plan)' },
  { id: 'leadsRD', label: 'Leads (RD)' },
  { id: 'quoteQty', label: 'Orçamentos (Qtd)' },
  { id: 'quoteValue', label: 'Valor Orç. (R$)' },
  { id: 'orderQty', label: 'Pedidos (Qtd)' },
  { id: 'orderValue', label: 'Valor Ped. (R$)' },
]

export function ComparisonTable({
  mergedData,
  dateRange,
  onUpdate,
  onBulkUpdate,
  onDelete,
  onBulkDelete,
  onBulkPasteUpdate,
  onReorder,
  visibleCols = { startDate: true, endDate: true, platform: true, campaign: true, audience: true },
  isExpanded = false,
}: ComparisonTableProps) {
  const startDateStr = dateRange?.from ? format(dateRange.from, 'dd/MM/yyyy') : '-'
  const endDateStr = dateRange?.to ? format(dateRange.to, 'dd/MM/yyyy') : startDateStr

  const identCols = (visibleCols.startDate ? 1 : 0) + (visibleCols.endDate ? 1 : 0)
  const campCols =
    (visibleCols.platform ? 1 : 0) + (visibleCols.campaign ? 1 : 0) + (visibleCols.audience ? 1 : 0)

  const { tableColumnWidths, setTableColumnWidths } = useAppContext()
  const [localWidths, setLocalWidths] = useState(tableColumnWidths)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isBulkOpen, setIsBulkOpen] = useState(false)
  const [bulkFields, setBulkFields] = useState<Record<string, boolean>>({})
  const [bulkValue, setBulkValue] = useState<string>('0')

  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  const [pasteConfig, setPasteConfig] = useState<{
    field: string
    fieldLabel: string
    startRowIndex: number
    values: number[]
  } | null>(null)

  useEffect(() => {
    setLocalWidths(tableColumnWidths)
  }, [tableColumnWidths])

  const handleResize = useCallback((id: string, width: number) => {
    setLocalWidths((prev) => ({ ...prev, [id]: width }))
  }, [])

  const handleResizeEnd = useCallback(
    (id: string, width: number) => {
      setTableColumnWidths((prev) => ({ ...prev, [id]: width }))
    },
    [setTableColumnWidths],
  )

  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedIds(new Set(mergedData.map((r) => r.id)))
    else setSelectedIds(new Set())
  }

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSet = new Set(selectedIds)
    if (checked) newSet.add(id)
    else newSet.delete(id)
    setSelectedIds(newSet)
  }

  const handleBulkSave = () => {
    const val = parseFloat(bulkValue)
    if (isNaN(val)) return

    const updates: Record<string, number> = {}
    Object.entries(bulkFields).forEach(([field, isSelected]) => {
      if (isSelected) updates[field] = val
    })

    if (Object.keys(updates).length > 0) {
      if (onBulkUpdate) {
        onBulkUpdate(Array.from(selectedIds), updates)
      } else {
        selectedIds.forEach((id) => {
          Object.keys(updates).forEach((field) => {
            onUpdate(id, field, val)
          })
        })
      }
    }

    setIsBulkOpen(false)
    setSelectedIds(new Set())
    setBulkFields({})
    setBulkValue('0')
  }

  const handleBulkZero = () => {
    const updates: Record<string, number> = {}
    BULK_EDIT_FIELDS.forEach((f) => {
      updates[f.id] = 0
    })

    if (onBulkUpdate) {
      onBulkUpdate(Array.from(selectedIds), updates)
    } else {
      selectedIds.forEach((id) => {
        Object.keys(updates).forEach((field) => {
          onUpdate(id, field, 0)
        })
      })
    }
    setSelectedIds(new Set())
  }

  const confirmPaste = () => {
    if (!pasteConfig) return
    const updates: { id: string; field: string; value: number }[] = []
    pasteConfig.values.forEach((val, idx) => {
      const targetRow = mergedData[pasteConfig.startRowIndex + idx]
      if (targetRow) {
        updates.push({ id: targetRow.id, field: pasteConfig.field, value: val })
      }
    })

    if (onBulkPasteUpdate && updates.length > 0) {
      onBulkPasteUpdate(updates)
    } else {
      updates.forEach((u) => onUpdate(u.id, u.field, u.value))
    }
    setPasteConfig(null)
  }

  const onDragStartRow = (e: React.DragEvent, id: string) => {
    setDraggedId(id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const onDragOverRow = (e: React.DragEvent, id: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (draggedId !== id) {
      setDragOverId(id)
    }
  }

  const onDropRow = (e: React.DragEvent, id: string) => {
    e.preventDefault()
    if (draggedId && draggedId !== id && onReorder) {
      onReorder(draggedId, id)
    }
    setDraggedId(null)
    setDragOverId(null)
  }

  const onDragEndRow = () => {
    setDraggedId(null)
    setDragOverId(null)
  }

  const getW = (key: keyof typeof defaultW) => localWidths[key] ?? defaultW[key]

  const actionsW = onDelete ? 40 : 0
  const dragW = onReorder ? 30 : 0
  const tableWidth =
    dragW +
    40 +
    [
      visibleCols.startDate ? getW('startDate') : 0,
      visibleCols.endDate ? getW('endDate') : 0,
      visibleCols.platform ? getW('platform') : 0,
      visibleCols.campaign ? getW('campaign') : 0,
      visibleCols.audience ? getW('audience') : 0,
      getW('cost'),
      getW('impressions'),
      getW('reach'),
      getW('clicksRD'),
      getW('clicksAds'),
      getW('ctr'),
      getW('diffClicks'),
      getW('leadsSalesSheet'),
      getW('leadsRD'),
      getW('cvl'),
      getW('quoteQty'),
      getW('quoteValue'),
      getW('orderQty'),
      getW('orderValue'),
      getW('leadsPerBudget'),
      getW('budgetPerOrder'),
    ].reduce((a, b) => a + b, 0) +
    actionsW

  const isAllSelected = mergedData.length > 0 && selectedIds.size === mergedData.length

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={cn(
          'rounded-xl border bg-white shadow-sm overflow-hidden relative print:border-none print:shadow-none flex flex-col',
          isExpanded ? 'h-full' : 'h-[500px] lg:h-[600px]',
        )}
      >
        <div className="overflow-auto flex-1 w-full min-h-0 print:overflow-visible relative pb-16">
          <Table
            className="table-fixed border-collapse text-[11px] print:min-w-full"
            style={{ width: Math.max(tableWidth, 100), minWidth: tableWidth, maxWidth: tableWidth }}
          >
            <colgroup>
              {onReorder && <col style={{ width: 30 }} />}
              <col style={{ width: 40 }} />
              {visibleCols.startDate && <col style={{ width: getW('startDate') }} />}
              {visibleCols.endDate && <col style={{ width: getW('endDate') }} />}
              {visibleCols.platform && <col style={{ width: getW('platform') }} />}
              {visibleCols.campaign && <col style={{ width: getW('campaign') }} />}
              {visibleCols.audience && <col style={{ width: getW('audience') }} />}
              <col style={{ width: getW('cost') }} />
              <col style={{ width: getW('impressions') }} />
              <col style={{ width: getW('reach') }} />
              <col style={{ width: getW('clicksRD') }} />
              <col style={{ width: getW('clicksAds') }} />
              <col style={{ width: getW('ctr') }} />
              <col style={{ width: getW('diffClicks') }} />
              <col style={{ width: getW('leadsSalesSheet') }} />
              <col style={{ width: getW('leadsRD') }} />
              <col style={{ width: getW('cvl') }} />
              <col style={{ width: getW('quoteQty') }} />
              <col style={{ width: getW('quoteValue') }} />
              <col style={{ width: getW('orderQty') }} />
              <col style={{ width: getW('orderValue') }} />
              <col style={{ width: getW('leadsPerBudget') }} />
              <col style={{ width: getW('budgetPerOrder') }} />
              {onDelete && <col style={{ width: 40 }} />}
            </colgroup>
            <TableHeader className="sticky top-0 z-20 print:static bg-background shadow-sm">
              <TableRow className="hover:bg-transparent">
                {identCols + 1 + (onReorder ? 1 : 0) > 0 && (
                  <TableHead
                    colSpan={identCols + 1 + (onReorder ? 1 : 0)}
                    className="border-r border-b text-center font-bold bg-slate-50 py-2 text-xs text-slate-800 overflow-hidden"
                  >
                    Identificação
                  </TableHead>
                )}
                {campCols > 0 && (
                  <TableHead
                    colSpan={campCols}
                    className="border-r border-b text-center font-bold bg-slate-50 py-2 text-xs text-slate-800 overflow-hidden"
                  >
                    Dados de Campanha / Canal
                  </TableHead>
                )}
                <TableHead
                  colSpan={5}
                  className="border-r border-b text-center font-bold bg-slate-50 py-2 text-xs text-slate-800 overflow-hidden"
                >
                  Métricas de Tráfego
                </TableHead>
                <TableHead
                  colSpan={2}
                  className="border-r border-b text-center font-bold bg-slate-50 py-2 text-xs text-slate-800 overflow-hidden"
                >
                  Performance
                </TableHead>
                <TableHead
                  colSpan={3}
                  className="border-r border-b text-center font-bold bg-slate-50 py-2 text-xs text-slate-800 overflow-hidden"
                >
                  Conversão
                </TableHead>
                <TableHead
                  colSpan={2}
                  className="border-r border-b text-center font-bold bg-slate-50 py-2 text-xs text-slate-800 overflow-hidden"
                >
                  Orçamento
                </TableHead>
                <TableHead
                  colSpan={2}
                  className="border-r border-b text-center font-bold bg-slate-50 py-2 text-xs text-slate-800 overflow-hidden"
                >
                  Vendas
                </TableHead>
                <TableHead
                  colSpan={2}
                  className="border-b text-center font-bold bg-slate-50 py-2 text-xs text-slate-800 overflow-hidden"
                >
                  Relações Finais
                </TableHead>
                {onDelete && (
                  <TableHead
                    colSpan={1}
                    className="border-l border-b text-center font-bold bg-slate-50 py-2 text-xs text-slate-800 overflow-hidden"
                  >
                    Ações
                  </TableHead>
                )}
              </TableRow>
              <TableRow className="hover:bg-transparent shadow-sm">
                {onReorder && (
                  <TableHead className="w-[30px] border-b border-r px-1 text-center bg-white"></TableHead>
                )}
                <TableHead className="w-[40px] border-b border-r px-2 py-2 text-center bg-white">
                  <Checkbox checked={isAllSelected} onCheckedChange={handleSelectAll} />
                </TableHead>
                {visibleCols.startDate && (
                  <ResizableHeader
                    id="startDate"
                    width={getW('startDate')}
                    onResize={handleResize}
                    onResizeEnd={handleResizeEnd}
                    className="border-b px-2 py-2"
                  >
                    Data Início
                  </ResizableHeader>
                )}
                {visibleCols.endDate && (
                  <ResizableHeader
                    id="endDate"
                    width={getW('endDate')}
                    onResize={handleResize}
                    onResizeEnd={handleResizeEnd}
                    className="border-b border-r px-2 py-2"
                  >
                    Data Fim
                  </ResizableHeader>
                )}

                {visibleCols.platform && (
                  <ResizableHeader
                    id="platform"
                    width={getW('platform')}
                    onResize={handleResize}
                    onResizeEnd={handleResizeEnd}
                    className="border-b px-2 py-2"
                  >
                    Plataforma e Canal
                  </ResizableHeader>
                )}
                {visibleCols.campaign && (
                  <ResizableHeader
                    id="campaign"
                    width={getW('campaign')}
                    onResize={handleResize}
                    onResizeEnd={handleResizeEnd}
                    className="border-b px-2 py-2"
                  >
                    Nome da Campanha
                  </ResizableHeader>
                )}
                {visibleCols.audience && (
                  <ResizableHeader
                    id="audience"
                    width={getW('audience')}
                    onResize={handleResize}
                    onResizeEnd={handleResizeEnd}
                    className="border-b border-r px-2 py-2"
                  >
                    Público
                  </ResizableHeader>
                )}

                <ResizableHeader
                  id="cost"
                  width={getW('cost')}
                  onResize={handleResize}
                  onResizeEnd={handleResizeEnd}
                  className="bg-white text-right border-b px-2 py-2"
                >
                  Invest. (R$)
                </ResizableHeader>
                <ResizableHeader
                  id="impressions"
                  width={getW('impressions')}
                  onResize={handleResize}
                  onResizeEnd={handleResizeEnd}
                  className="bg-white text-right border-b px-2 py-2"
                >
                  Impressões
                </ResizableHeader>
                <ResizableHeader
                  id="reach"
                  width={getW('reach')}
                  onResize={handleResize}
                  onResizeEnd={handleResizeEnd}
                  className="bg-white text-right border-b px-2 py-2"
                >
                  Alcance
                </ResizableHeader>
                <ResizableHeader
                  id="clicksRD"
                  width={getW('clicksRD')}
                  onResize={handleResize}
                  onResizeEnd={handleResizeEnd}
                  className="bg-white text-right border-b px-2 py-2"
                >
                  Cliques (RD)
                </ResizableHeader>
                <ResizableHeader
                  id="clicksAds"
                  width={getW('clicksAds')}
                  onResize={handleResize}
                  onResizeEnd={handleResizeEnd}
                  className="bg-white text-right border-b border-r px-2 py-2"
                >
                  Cliques (Ads)
                </ResizableHeader>

                <ResizableHeader
                  id="ctr"
                  width={getW('ctr')}
                  onResize={handleResize}
                  onResizeEnd={handleResizeEnd}
                  className="bg-white text-right border-b px-2 py-2"
                >
                  CTR (%)
                </ResizableHeader>
                <ResizableHeader
                  id="diffClicks"
                  width={getW('diffClicks')}
                  onResize={handleResize}
                  onResizeEnd={handleResizeEnd}
                  className="bg-white text-right border-b border-r px-2 py-2"
                >
                  Dif. Cliques
                </ResizableHeader>

                <ResizableHeader
                  id="leadsSalesSheet"
                  width={getW('leadsSalesSheet')}
                  onResize={handleResize}
                  onResizeEnd={handleResizeEnd}
                  className="bg-white text-right border-b px-2 py-2"
                >
                  Leads (Plan)
                </ResizableHeader>
                <ResizableHeader
                  id="leadsRD"
                  width={getW('leadsRD')}
                  onResize={handleResize}
                  onResizeEnd={handleResizeEnd}
                  className="bg-white text-right border-b px-2 py-2"
                >
                  Leads (RD)
                </ResizableHeader>
                <ResizableHeader
                  id="cvl"
                  width={getW('cvl')}
                  onResize={handleResize}
                  onResizeEnd={handleResizeEnd}
                  className="bg-white text-right border-b border-r px-2 py-2"
                >
                  CVL
                </ResizableHeader>

                <ResizableHeader
                  id="quoteQty"
                  width={getW('quoteQty')}
                  onResize={handleResize}
                  onResizeEnd={handleResizeEnd}
                  className="bg-white text-right border-b px-2 py-2"
                >
                  Orçamentos (Qtd)
                </ResizableHeader>
                <ResizableHeader
                  id="quoteValue"
                  width={getW('quoteValue')}
                  onResize={handleResize}
                  onResizeEnd={handleResizeEnd}
                  className="bg-white text-right border-b border-r px-2 py-2"
                >
                  Valor Orç. (R$)
                </ResizableHeader>

                <ResizableHeader
                  id="orderQty"
                  width={getW('orderQty')}
                  onResize={handleResize}
                  onResizeEnd={handleResizeEnd}
                  className="bg-white text-right border-b px-2 py-2"
                >
                  Pedidos (Qtd)
                </ResizableHeader>
                <ResizableHeader
                  id="orderValue"
                  width={getW('orderValue')}
                  onResize={handleResize}
                  onResizeEnd={handleResizeEnd}
                  className="bg-white text-right border-b border-r px-2 py-2"
                >
                  Valor Ped. (R$)
                </ResizableHeader>

                <ResizableHeader
                  id="leadsPerBudget"
                  width={getW('leadsPerBudget')}
                  onResize={handleResize}
                  onResizeEnd={handleResizeEnd}
                  className="bg-white text-right border-b px-2 py-2"
                >
                  Leads/Orç
                </ResizableHeader>
                <ResizableHeader
                  id="budgetPerOrder"
                  width={getW('budgetPerOrder')}
                  onResize={handleResize}
                  onResizeEnd={handleResizeEnd}
                  className="bg-white text-right border-b px-2 py-2"
                >
                  Orç/Ped
                </ResizableHeader>
                {onDelete && (
                  <TableHead className="w-[40px] border-b border-l px-2 py-2 text-center bg-white"></TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {mergedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={24} className="text-center h-32 text-muted-foreground">
                    Nenhum dado encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                mergedData.map((row, index) => {
                  const ctr = row.impressions > 0 ? row.clicksAds / row.impressions : 0
                  const diffClicks = row.clicksRD - (row.pastClicksRD || 0)
                  const cvl = row.clicksRD > 0 ? row.leadsRD / row.clicksRD : 0
                  const leadsPerBudget = row.quoteValue > 0 ? row.leadsRD / row.quoteValue : 0
                  const budgetPerOrder = row.orderQty > 0 ? row.quoteValue / row.orderQty : 0

                  const platLow = row.platform?.toLowerCase() || ''
                  const isGoogle = platLow.includes('google')
                  const isMeta = platLow.includes('facebook') || platLow.includes('instagram')
                  const isSystem =
                    platLow.includes('assistente') ||
                    platLow.includes('whatsapp') ||
                    platLow.includes('representante') ||
                    platLow.includes('direto')

                  return (
                    <TableRow
                      key={row.id}
                      className={cn(
                        'even:bg-slate-50/50 hover:bg-slate-100/50 transition-colors group',
                        draggedId === row.id && 'opacity-50 bg-indigo-50/50',
                        dragOverId === row.id &&
                          'border-t-2 border-t-indigo-500 shadow-[0_-2px_0_rgba(99,102,241,1)] z-10 relative',
                      )}
                      data-state={selectedIds.has(row.id) ? 'selected' : undefined}
                      onDragOver={onReorder ? (e) => onDragOverRow(e, row.id) : undefined}
                      onDrop={onReorder ? (e) => onDropRow(e, row.id) : undefined}
                    >
                      {onReorder && (
                        <TableCell className="w-[30px] p-0 text-center align-middle border-r bg-white/50">
                          <div
                            draggable
                            onDragStart={(e) => onDragStartRow(e, row.id)}
                            onDragEnd={onDragEndRow}
                            className="cursor-grab active:cursor-grabbing hover:bg-slate-200 p-1 rounded mx-auto inline-flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            <GripVertical className="w-4 h-4" />
                          </div>
                        </TableCell>
                      )}
                      <TableCell className="border-r py-1.5 px-2 text-center w-[40px]">
                        <Checkbox
                          checked={selectedIds.has(row.id)}
                          onCheckedChange={(c) => handleSelectRow(row.id, !!c)}
                        />
                      </TableCell>
                      {visibleCols.startDate && (
                        <TableCell className="break-words whitespace-normal overflow-hidden font-medium text-slate-600 py-1.5 px-2">
                          {startDateStr}
                        </TableCell>
                      )}
                      {visibleCols.endDate && (
                        <TableCell className="break-words whitespace-normal overflow-hidden font-medium text-slate-600 border-r py-1.5 px-2">
                          {endDateStr}
                        </TableCell>
                      )}

                      {visibleCols.platform && (
                        <TableCell className="py-1.5 px-2 overflow-hidden">
                          <Badge
                            variant="outline"
                            className={cn(
                              'px-1.5 py-0 h-5 text-[10px] whitespace-nowrap',
                              isGoogle
                                ? 'border-blue-300 text-blue-700 bg-blue-50'
                                : isMeta
                                  ? 'border-indigo-300 text-indigo-700 bg-indigo-50'
                                  : isSystem
                                    ? 'border-emerald-300 text-emerald-700 bg-emerald-50'
                                    : 'border-slate-300 text-slate-700 bg-slate-50',
                            )}
                          >
                            {row.platform}
                          </Badge>
                        </TableCell>
                      )}
                      {visibleCols.campaign && (
                        <TableCell className="py-1.5 px-2 overflow-hidden break-words whitespace-normal">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="block line-clamp-3 font-medium text-slate-800 cursor-default">
                                {row.campaign}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-[300px] text-xs z-50">
                              {row.campaign}
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                      )}
                      {visibleCols.audience && (
                        <TableCell className="border-r py-1.5 px-2 overflow-hidden break-words whitespace-normal">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="block line-clamp-3 cursor-default text-slate-600">
                                {row.audience}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-[300px] text-xs z-50">
                              {row.audience}
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                      )}

                      <TableCell className="py-1 px-1 align-middle overflow-hidden">
                        <EditableCell
                          value={row.cost || 0}
                          format="currency"
                          onSave={(v) => onUpdate(row.id, 'cost', v)}
                          onBulkPaste={(vals) =>
                            setPasteConfig({
                              field: 'cost',
                              fieldLabel: 'Invest. (R$)',
                              startRowIndex: index,
                              values: vals,
                            })
                          }
                        />
                      </TableCell>
                      <TableCell className="py-1 px-1 align-middle overflow-hidden">
                        <EditableCell
                          value={row.impressions}
                          onSave={(v) => onUpdate(row.id, 'impressions', v)}
                          onBulkPaste={(vals) =>
                            setPasteConfig({
                              field: 'impressions',
                              fieldLabel: 'Impressões',
                              startRowIndex: index,
                              values: vals,
                            })
                          }
                        />
                      </TableCell>
                      <TableCell className="py-1 px-1 align-middle overflow-hidden">
                        <EditableCell
                          value={row.reach}
                          onSave={(v) => onUpdate(row.id, 'reach', v)}
                          onBulkPaste={(vals) =>
                            setPasteConfig({
                              field: 'reach',
                              fieldLabel: 'Alcance',
                              startRowIndex: index,
                              values: vals,
                            })
                          }
                        />
                      </TableCell>
                      <TableCell className="py-1 px-1 align-middle overflow-hidden">
                        <EditableCell
                          value={row.clicksRD}
                          onSave={(v) => onUpdate(row.id, 'clicksRD', v)}
                          onBulkPaste={(vals) =>
                            setPasteConfig({
                              field: 'clicksRD',
                              fieldLabel: 'Cliques (RD)',
                              startRowIndex: index,
                              values: vals,
                            })
                          }
                        />
                      </TableCell>
                      <TableCell className="border-r py-1 px-1 align-middle overflow-hidden">
                        <EditableCell
                          value={row.clicksAds}
                          onSave={(v) => onUpdate(row.id, 'clicksAds', v)}
                          onBulkPaste={(vals) =>
                            setPasteConfig({
                              field: 'clicksAds',
                              fieldLabel: 'Cliques (Ads)',
                              startRowIndex: index,
                              values: vals,
                            })
                          }
                        />
                      </TableCell>

                      <TableCell className="text-right font-mono font-medium py-1.5 px-2 align-middle bg-slate-50/30 overflow-hidden break-words">
                        {formatPercent(ctr)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          'text-right font-mono border-r py-1.5 px-2 align-middle bg-slate-50/30 overflow-hidden break-words',
                          getDiffColor(diffClicks, false),
                        )}
                      >
                        {diffClicks > 0 ? `+${formatNumber(diffClicks)}` : formatNumber(diffClicks)}
                      </TableCell>

                      <TableCell className="py-1 px-1 align-middle overflow-hidden">
                        <EditableCell
                          value={row.leadsSalesSheet}
                          onSave={(v) => onUpdate(row.id, 'leadsSalesSheet', v)}
                          onBulkPaste={(vals) =>
                            setPasteConfig({
                              field: 'leadsSalesSheet',
                              fieldLabel: 'Leads (Plan)',
                              startRowIndex: index,
                              values: vals,
                            })
                          }
                        />
                      </TableCell>
                      <TableCell className="py-1 px-1 align-middle overflow-hidden">
                        <EditableCell
                          value={row.leadsRD}
                          onSave={(v) => onUpdate(row.id, 'leadsRD', v)}
                          onBulkPaste={(vals) =>
                            setPasteConfig({
                              field: 'leadsRD',
                              fieldLabel: 'Leads (RD)',
                              startRowIndex: index,
                              values: vals,
                            })
                          }
                        />
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium border-r py-1.5 px-2 align-middle bg-slate-50/30 overflow-hidden break-words">
                        {formatPercent(cvl)}
                      </TableCell>

                      <TableCell className="py-1 px-1 align-middle overflow-hidden">
                        <EditableCell
                          value={row.quoteQty}
                          onSave={(v) => onUpdate(row.id, 'quoteQty', v)}
                          onBulkPaste={(vals) =>
                            setPasteConfig({
                              field: 'quoteQty',
                              fieldLabel: 'Orçamentos (Qtd)',
                              startRowIndex: index,
                              values: vals,
                            })
                          }
                        />
                      </TableCell>
                      <TableCell className="border-r py-1 px-1 align-middle overflow-hidden">
                        <EditableCell
                          value={row.quoteValue}
                          format="currency"
                          onSave={(v) => onUpdate(row.id, 'quoteValue', v)}
                          onBulkPaste={(vals) =>
                            setPasteConfig({
                              field: 'quoteValue',
                              fieldLabel: 'Valor Orç. (R$)',
                              startRowIndex: index,
                              values: vals,
                            })
                          }
                        />
                      </TableCell>

                      <TableCell className="py-1 px-1 align-middle overflow-hidden">
                        <EditableCell
                          value={row.orderQty}
                          onSave={(v) => onUpdate(row.id, 'orderQty', v)}
                          onBulkPaste={(vals) =>
                            setPasteConfig({
                              field: 'orderQty',
                              fieldLabel: 'Pedidos (Qtd)',
                              startRowIndex: index,
                              values: vals,
                            })
                          }
                        />
                      </TableCell>
                      <TableCell className="border-r py-1 px-1 align-middle overflow-hidden">
                        <EditableCell
                          value={row.orderValue}
                          format="currency"
                          onSave={(v) => onUpdate(row.id, 'orderValue', v)}
                          onBulkPaste={(vals) =>
                            setPasteConfig({
                              field: 'orderValue',
                              fieldLabel: 'Valor Ped. (R$)',
                              startRowIndex: index,
                              values: vals,
                            })
                          }
                        />
                      </TableCell>

                      <TableCell className="text-right font-mono font-medium text-indigo-700 py-1.5 px-2 align-middle bg-slate-50/30 overflow-hidden break-words">
                        {formatNumber(leadsPerBudget)}
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium text-indigo-700 py-1.5 px-2 align-middle bg-slate-50/30 overflow-hidden break-words">
                        {formatCurrency(budgetPerOrder)}
                      </TableCell>

                      {onDelete && (
                        <TableCell className="border-l py-1.5 px-2 text-center w-[40px]">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-red-400 hover:text-red-600 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation()
                              onDelete(row.id)
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
        {selectedIds.size > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-sm text-white px-4 py-3 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] flex items-center gap-4 z-50 border border-slate-800 animate-in slide-in-from-bottom-8">
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="bg-slate-800 text-white hover:bg-slate-700 border-none"
              >
                {selectedIds.size} selecionados
              </Badge>
            </div>
            <div className="w-px h-4 bg-slate-700 mx-1"></div>

            <Dialog open={isBulkOpen} onOpenChange={setIsBulkOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-slate-200 hover:text-white hover:bg-slate-800 gap-2"
                >
                  <Settings2 className="w-4 h-4" />
                  Editar em Massa
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edição em Massa</DialogTitle>
                  <DialogDescription>
                    Selecione os campos e defina o novo valor para os {selectedIds.size} registros
                    selecionados.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Valor a ser aplicado</Label>
                    <Input
                      type="number"
                      value={bulkValue}
                      onChange={(e) => setBulkValue(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Campos para atualizar</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {BULK_EDIT_FIELDS.map((f) => (
                        <div key={f.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`bulk-${f.id}`}
                            checked={!!bulkFields[f.id]}
                            onCheckedChange={(c) =>
                              setBulkFields((prev) => ({ ...prev, [f.id]: !!c }))
                            }
                          />
                          <Label
                            htmlFor={`bulk-${f.id}`}
                            className="text-xs font-normal cursor-pointer"
                          >
                            {f.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsBulkOpen(false)}>
                    Cancelar
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button disabled={Object.values(bulkFields).filter(Boolean).length === 0}>
                        Aplicar
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Atenção</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja editar esses dados em massa? Essa ação afetará{' '}
                          {selectedIds.size} registros.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleBulkSave}
                          className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          Confirmar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DialogFooter>
              </DialogContent>
            </Dialog>

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
                    Tem certeza que deseja zerar todas as métricas dos {selectedIds.size} registros
                    selecionados?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleBulkZero}>Confirmar</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {onBulkDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-red-400 hover:text-red-300 hover:bg-slate-800 gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Excluir Selecionados
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir Registros</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir os {selectedIds.size} registros selecionados?
                      Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        onBulkDelete(Array.from(selectedIds))
                        setSelectedIds(new Set())
                      }}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Confirmar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        )}

        <AlertDialog open={!!pasteConfig} onOpenChange={(open) => !open && setPasteConfig(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Colar Múltiplos Valores</AlertDialogTitle>
              <AlertDialogDescription>
                Você está prestes a colar {pasteConfig?.values.length} valores na coluna "
                {pasteConfig?.fieldLabel}". Os valores substituirão os dados atuais a partir da
                linha selecionada para baixo. Deseja continuar?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmPaste}>Confirmar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  )
}
