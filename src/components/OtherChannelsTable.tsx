import React, { useState, useRef, useEffect } from 'react'
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
import { formatCurrency, formatNumber, formatPercent } from '@/lib/formatters'
import { cn } from '@/lib/utils'
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
  disabled = false,
}: {
  value: number | undefined
  onSave: (val: number) => void
  format?: 'number' | 'currency' | 'percent'
  disabled?: boolean
}) {
  const safeValue = value || 0
  const [isEditing, setIsEditing] = useState(false)
  const [localVal, setLocalVal] = useState(safeValue.toString())
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setLocalVal(safeValue.toString())
  }, [safeValue])

  if (disabled) {
    return <div className="text-center text-muted-foreground min-w-[60px] ml-auto">-</div>
  }

  const handleBlur = () => {
    setIsEditing(false)
    const parsed = parseFloat(localVal)
    if (!isNaN(parsed) && parsed !== safeValue) {
      onSave(parsed)
    } else {
      setLocalVal(safeValue.toString())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur()
    }
    if (e.key === 'Escape') {
      setLocalVal(safeValue.toString())
      setIsEditing(false)
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
        autoFocus
        className="h-8 w-24 text-right px-2 py-1 text-xs font-mono bg-white border-blue-400 focus-visible:ring-1 focus-visible:ring-blue-400 ml-auto"
      />
    )
  }

  const displayValue =
    format === 'currency'
      ? formatCurrency(safeValue)
      : format === 'percent'
        ? formatPercent(safeValue)
        : formatNumber(safeValue)

  return (
    <div
      className="cursor-pointer hover:bg-blue-50/50 hover:ring-1 hover:ring-blue-200 px-2 py-1.5 rounded transition-all min-w-[60px] text-right font-mono ml-auto"
      onClick={() => setIsEditing(true)}
      title="Clique para editar"
    >
      {displayValue}
    </div>
  )
}

interface OtherChannelsTableProps {
  data: any[]
  onUpdate: (channel: string, field: string, value: number) => void
  onBulkUpdate?: (channels: string[], updates: Record<string, number>) => void
  onDelete?: (channel: string) => void
  onBulkDelete?: (channels: string[]) => void
  onReorder?: (draggedId: string, targetId: string) => void
  visibleCols?: Record<string, boolean>
  isExpanded?: boolean
}

const BULK_EDIT_FIELDS_OTHER = [
  { id: 'accesses', label: 'Acessos' },
  { id: 'clicks', label: 'Cliques' },
  { id: 'conversations', label: 'Conversas' },
  { id: 'leads', label: 'Leads' },
  { id: 'quotesQty', label: 'Orç. (Qtd)' },
  { id: 'quotesValue', label: 'Orç. (R$)' },
  { id: 'ordersQty', label: 'Ped. (Qtd)' },
  { id: 'ordersValue', label: 'Ped. (R$)' },
]

export function OtherChannelsTable({
  data,
  onUpdate,
  onBulkUpdate,
  onDelete,
  onBulkDelete,
  onReorder,
  visibleCols = {
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
  },
  isExpanded = false,
}: OtherChannelsTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isBulkOpen, setIsBulkOpen] = useState(false)
  const [bulkFields, setBulkFields] = useState<Record<string, boolean>>({})
  const [bulkValue, setBulkValue] = useState<string>('0')

  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedIds(new Set(data.map((r) => r.channel)))
    else setSelectedIds(new Set())
  }

  const handleSelectRow = (channel: string, checked: boolean) => {
    const newSet = new Set(selectedIds)
    if (checked) newSet.add(channel)
    else newSet.delete(channel)
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
        selectedIds.forEach((channel) => {
          Object.keys(updates).forEach((field) => {
            onUpdate(channel, field, val)
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
    BULK_EDIT_FIELDS_OTHER.forEach((f) => {
      updates[f.id] = 0
    })

    if (onBulkUpdate) {
      onBulkUpdate(Array.from(selectedIds), updates)
    } else {
      selectedIds.forEach((channel) => {
        Object.keys(updates).forEach((field) => {
          onUpdate(channel, field, 0)
        })
      })
    }
    setSelectedIds(new Set())
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

  const isAllSelected = data.length > 0 && selectedIds.size === data.length

  return (
    <div
      className={cn(
        'rounded-xl border bg-white shadow-sm overflow-hidden relative print:border-none print:shadow-none flex flex-col',
        isExpanded ? 'h-full' : '',
      )}
    >
      <div className="overflow-auto flex-1 w-full min-h-0 print:overflow-visible pb-16">
        <Table className="min-w-[1400px] print:min-w-full border-collapse text-xs">
          <TableHeader className="bg-slate-50 sticky top-0 z-20 print:static shadow-sm">
            <TableRow>
              {onReorder && (
                <TableHead className="w-[30px] border-r px-1 text-center bg-white"></TableHead>
              )}
              <TableHead className="w-[40px] text-center border-r px-2 bg-white">
                <Checkbox checked={isAllSelected} onCheckedChange={handleSelectAll} />
              </TableHead>
              {visibleCols.channel && (
                <TableHead className="font-bold border-r whitespace-nowrap">Canal</TableHead>
              )}
              {visibleCols.accesses && <TableHead className="text-right">Acessos</TableHead>}
              {visibleCols.clicks && <TableHead className="text-right">Cliques</TableHead>}
              {visibleCols.conversations && (
                <TableHead className="text-right border-r">Conversas</TableHead>
              )}
              {visibleCols.leads && <TableHead className="text-right">Leads</TableHead>}
              {visibleCols.quotesQty && (
                <TableHead className="text-right">Orçamentos (Qtd)</TableHead>
              )}
              {visibleCols.quotesValue && (
                <TableHead className="text-right border-r">Orçamentos (R$)</TableHead>
              )}
              {visibleCols.ordersQty && <TableHead className="text-right">Pedidos (Qtd)</TableHead>}
              {visibleCols.ordersValue && (
                <TableHead className="text-right border-r">Pedidos (R$)</TableHead>
              )}
              {visibleCols.convLeadQuote && (
                <TableHead className="text-right whitespace-nowrap">% Lead → Orç.</TableHead>
              )}
              {visibleCols.convQuoteOrder && (
                <TableHead className="text-right border-r whitespace-nowrap">
                  % Orç. → Ped.
                </TableHead>
              )}
              {visibleCols.userName && (
                <TableHead className="text-center">Usuário Responsável</TableHead>
              )}
              {onDelete && (
                <TableHead className="text-center border-l whitespace-nowrap w-[40px]">
                  Ações
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={17} className="text-center h-32 text-muted-foreground">
                  Nenhum dado encontrado.
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => {
                const isGabi = row.channel === 'Assistente virtual - Gabi'
                const isAcesso = row.channel === 'Acessos ao site'

                const leadToQuote = row.leads > 0 ? row.quotesQty / row.leads : 0
                const quoteToOrder = row.quotesQty > 0 ? row.ordersQty / row.quotesQty : 0

                return (
                  <TableRow
                    key={row.channel}
                    className={cn(
                      'hover:bg-slate-50/50 group',
                      draggedId === row.channel && 'opacity-50 bg-indigo-50/50',
                      dragOverId === row.channel &&
                        'border-t-2 border-t-indigo-500 shadow-[0_-2px_0_rgba(99,102,241,1)] z-10 relative',
                    )}
                    data-state={selectedIds.has(row.channel) ? 'selected' : undefined}
                    onDragOver={onReorder ? (e) => onDragOverRow(e, row.channel) : undefined}
                    onDrop={onReorder ? (e) => onDropRow(e, row.channel) : undefined}
                  >
                    {onReorder && (
                      <TableCell className="w-[30px] p-0 text-center align-middle border-r bg-white/50">
                        <div
                          draggable
                          onDragStart={(e) => onDragStartRow(e, row.channel)}
                          onDragEnd={onDragEndRow}
                          className="cursor-grab active:cursor-grabbing hover:bg-slate-200 p-1 rounded mx-auto inline-flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          <GripVertical className="w-4 h-4" />
                        </div>
                      </TableCell>
                    )}
                    <TableCell className="border-r py-2 px-2 text-center w-[40px]">
                      <Checkbox
                        checked={selectedIds.has(row.channel)}
                        onCheckedChange={(c) => handleSelectRow(row.channel, !!c)}
                      />
                    </TableCell>
                    {visibleCols.channel && (
                      <TableCell className="font-medium border-r bg-slate-50/30 whitespace-nowrap">
                        {row.channel}
                      </TableCell>
                    )}
                    {visibleCols.accesses && (
                      <TableCell className="py-2 px-2">
                        <EditableCell
                          value={row.accesses}
                          disabled={!isGabi && !isAcesso}
                          onSave={(v) => onUpdate(row.channel, 'accesses', v)}
                        />
                      </TableCell>
                    )}
                    {visibleCols.clicks && (
                      <TableCell className="py-2 px-2">
                        <EditableCell
                          value={row.clicks}
                          disabled={!isGabi}
                          onSave={(v) => onUpdate(row.channel, 'clicks', v)}
                        />
                      </TableCell>
                    )}
                    {visibleCols.conversations && (
                      <TableCell className="py-2 px-2 border-r">
                        <EditableCell
                          value={row.conversations}
                          disabled={!isGabi}
                          onSave={(v) => onUpdate(row.channel, 'conversations', v)}
                        />
                      </TableCell>
                    )}
                    {visibleCols.leads && (
                      <TableCell className="py-2 px-2">
                        <EditableCell
                          value={row.leads}
                          onSave={(v) => onUpdate(row.channel, 'leads', v)}
                        />
                      </TableCell>
                    )}
                    {visibleCols.quotesQty && (
                      <TableCell className="py-2 px-2">
                        <EditableCell
                          value={row.quotesQty}
                          onSave={(v) => onUpdate(row.channel, 'quotesQty', v)}
                        />
                      </TableCell>
                    )}
                    {visibleCols.quotesValue && (
                      <TableCell className="py-2 px-2 border-r">
                        <EditableCell
                          value={row.quotesValue}
                          format="currency"
                          onSave={(v) => onUpdate(row.channel, 'quotesValue', v)}
                        />
                      </TableCell>
                    )}
                    {visibleCols.ordersQty && (
                      <TableCell className="py-2 px-2">
                        <EditableCell
                          value={row.ordersQty}
                          onSave={(v) => onUpdate(row.channel, 'ordersQty', v)}
                        />
                      </TableCell>
                    )}
                    {visibleCols.ordersValue && (
                      <TableCell className="py-2 px-2 border-r">
                        <EditableCell
                          value={row.ordersValue}
                          format="currency"
                          onSave={(v) => onUpdate(row.channel, 'ordersValue', v)}
                        />
                      </TableCell>
                    )}
                    {visibleCols.convLeadQuote && (
                      <TableCell className="text-right font-mono font-medium py-3 px-4 bg-slate-50/30">
                        {formatPercent(leadToQuote)}
                      </TableCell>
                    )}
                    {visibleCols.convQuoteOrder && (
                      <TableCell className="text-right font-mono font-medium border-r py-3 px-4 bg-slate-50/30">
                        {formatPercent(quoteToOrder)}
                      </TableCell>
                    )}
                    {visibleCols.userName && (
                      <TableCell className="text-center py-2 px-2 min-w-[140px]">
                        {row.userName ? (
                          <Badge
                            variant="outline"
                            style={{
                              borderColor: row.userColor,
                              color: row.userColor,
                              backgroundColor: `${row.userColor}15`,
                            }}
                          >
                            {row.userName}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    )}
                    {onDelete && (
                      <TableCell className="border-l py-2 px-2 text-center w-[40px]">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-red-400 hover:text-red-600 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation()
                            onDelete(row.channel)
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
                  Selecione os campos e defina o novo valor para os {selectedIds.size} canais
                  selecionadas.
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
                    {BULK_EDIT_FIELDS_OTHER.map((f) => (
                      <div key={f.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`bulk-other-${f.id}`}
                          checked={!!bulkFields[f.id]}
                          onCheckedChange={(c) =>
                            setBulkFields((prev) => ({ ...prev, [f.id]: !!c }))
                          }
                        />
                        <Label
                          htmlFor={`bulk-other-${f.id}`}
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
                  Tem certeza que deseja zerar todas as métricas dos {selectedIds.size} canais
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
                    Tem certeza que deseja excluir os {selectedIds.size} canais selecionados? Esta
                    ação não pode ser desfeita.
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
    </div>
  )
}
