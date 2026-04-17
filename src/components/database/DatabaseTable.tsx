import React, { useRef, useState } from 'react'
import { DatabaseState } from '@/hooks/useDatabase'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Search, Pencil, Copy, CopyPlus, Trash2, GripVertical } from 'lucide-react'
import { DatePickerWithRange } from '@/components/DatePickerWithRange'
import { EditableCell, EditableDateCell, SortableHead } from './TableCells'
import { formatPercent } from '@/lib/formatters'
import { cn } from '@/lib/utils'
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
import { CampaignRow } from '@/types'

export function DatabaseTable({ state }: { state: DatabaseState }) {
  const {
    search,
    setSearch,
    dateFilter,
    setDateFilter,
    sortField,
    sortDirection,
    handleSort,
    processedData,
    selectedIds,
    handleSelectAll,
    handleSelectRow,
    handleUpdate,
    setEditingRow,
    handleDuplicate,
    handleBulkDuplicate,
    handleBulkCopy,
    handleDeleteRecords,
    handleReorder,
  } = state

  const isAllSelected = processedData.length > 0 && selectedIds.size === processedData.length

  const topScrollRef = useRef<HTMLDivElement>(null)
  const tableScrollRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  const [pasteConfig, setPasteConfig] = useState<{
    field: keyof CampaignRow
    fieldLabel: string
    startRowIndex: number
    values: number[]
  } | null>(null)

  const confirmPaste = () => {
    if (!pasteConfig) return
    const updates: { id: string; field: keyof CampaignRow; value: number }[] = []
    pasteConfig.values.forEach((val, idx) => {
      const targetRow = processedData[pasteConfig.startRowIndex + idx]
      if (targetRow) {
        updates.push({ id: targetRow.id, field: pasteConfig.field, value: val })
      }
    })

    if (state.handleBulkPaste && updates.length > 0) {
      state.handleBulkPaste(updates)
    } else {
      updates.forEach((u) => state.handleUpdate(u.id, u.field, u.value))
    }
    setPasteConfig(null)
  }

  const handleTopScroll = () => {
    if (tableScrollRef.current && topScrollRef.current) {
      tableScrollRef.current.scrollLeft = topScrollRef.current.scrollLeft
    }
  }

  const handleTableScroll = () => {
    if (topScrollRef.current && tableScrollRef.current) {
      topScrollRef.current.scrollLeft = tableScrollRef.current.scrollLeft
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!tableScrollRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - tableScrollRef.current.offsetLeft)
    setScrollLeft(tableScrollRef.current.scrollLeft)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !tableScrollRef.current) return
    e.preventDefault()
    const x = e.pageX - tableScrollRef.current.offsetLeft
    const walk = (x - startX) * 2
    tableScrollRef.current.scrollLeft = scrollLeft - walk
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
    if (draggedId && draggedId !== id && handleReorder) {
      handleReorder(draggedId, id)
    }
    setDraggedId(null)
    setDragOverId(null)
  }

  const onDragEndRow = () => {
    setDraggedId(null)
    setDragOverId(null)
  }

  return (
    <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col h-[700px]">
      <div className="flex flex-col sm:flex-row gap-3 mb-4 shrink-0 justify-between items-start sm:items-center">
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar campanha..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-slate-50"
            />
          </div>
          <DatePickerWithRange
            date={dateFilter}
            setDate={setDateFilter}
            className="w-full sm:w-auto"
          />
        </div>

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 bg-indigo-50 p-1.5 rounded-md border border-indigo-100 animate-in fade-in slide-in-from-top-2">
            <span className="text-xs font-semibold text-indigo-700 px-2">
              {selectedIds.size} itens
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBulkCopy}
              className="h-8 px-2"
              title="Copiar"
            >
              <Copy className="w-4 h-4 text-slate-600" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBulkDuplicate}
              className="h-8 px-2"
              title="Duplicar"
            >
              <CopyPlus className="w-4 h-4 text-blue-600" />
            </Button>
            <div className="w-px h-4 bg-indigo-200 mx-1"></div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-1" /> Excluir registros
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Atenção</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir esses dados?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDeleteRecords(selectedIds)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Confirmar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      <div
        ref={topScrollRef}
        onScroll={handleTopScroll}
        className="overflow-x-auto w-full custom-scrollbar pb-1 mb-1"
      >
        <div style={{ width: '2200px', height: '1px' }}></div>
      </div>

      <div
        ref={tableScrollRef}
        onScroll={handleTableScroll}
        onMouseDown={handleMouseDown}
        onMouseLeave={() => setIsDragging(false)}
        onMouseUp={() => setIsDragging(false)}
        onMouseMove={handleMouseMove}
        className={cn(
          'rounded-md border overflow-x-auto overflow-y-auto flex-1 relative custom-scrollbar pb-2 transition-colors',
          isDragging ? 'cursor-grabbing select-none bg-slate-50/30' : 'cursor-grab',
        )}
      >
        <Table className="text-sm min-w-[2200px]">
          <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm">
            <TableRow>
              <TableHead className="w-[30px] px-1 border-r bg-slate-50/95"></TableHead>
              <TableHead className="w-[40px] text-center px-2">
                <Checkbox checked={isAllSelected} onCheckedChange={handleSelectAll} />
              </TableHead>
              <SortableHead
                field="startDate"
                label="Data Inicial"
                currentSort={sortField}
                direction={sortDirection}
                onSort={handleSort}
              />
              <SortableHead
                field="endDate"
                label="Data Final"
                currentSort={sortField}
                direction={sortDirection}
                onSort={handleSort}
              />
              <SortableHead
                field="platform"
                label="Plataforma e Canal"
                currentSort={sortField}
                direction={sortDirection}
                onSort={handleSort}
              />
              <SortableHead
                field="campaign"
                label="Campanha"
                currentSort={sortField}
                direction={sortDirection}
                onSort={handleSort}
              />
              <SortableHead
                field="cost"
                label="Investimento (R$)"
                currentSort={sortField}
                direction={sortDirection}
                onSort={handleSort}
                align="right"
              />
              <SortableHead
                field="impressions"
                label="Impressões"
                currentSort={sortField}
                direction={sortDirection}
                onSort={handleSort}
                align="right"
              />
              <SortableHead
                field="reach"
                label="Alcance"
                currentSort={sortField}
                direction={sortDirection}
                onSort={handleSort}
                align="right"
              />
              <SortableHead
                field="clicksAds"
                label="Cliques"
                currentSort={sortField}
                direction={sortDirection}
                onSort={handleSort}
                align="right"
              />
              <SortableHead
                field="leadsRD"
                label="Leads"
                currentSort={sortField}
                direction={sortDirection}
                onSort={handleSort}
                align="right"
              />
              <SortableHead
                field="quoteQty"
                label="Orçamentos (Qtd)"
                currentSort={sortField}
                direction={sortDirection}
                onSort={handleSort}
                align="right"
              />
              <SortableHead
                field="quoteValue"
                label="Valor Orç. (R$)"
                currentSort={sortField}
                direction={sortDirection}
                onSort={handleSort}
                align="right"
              />
              <SortableHead
                field="orderQty"
                label="Pedidos (Qtd)"
                currentSort={sortField}
                direction={sortDirection}
                onSort={handleSort}
                align="right"
              />
              <SortableHead
                field="orderValue"
                label="Valor Ped. (R$)"
                currentSort={sortField}
                direction={sortDirection}
                onSort={handleSort}
                align="right"
              />
              <TableHead className="text-right">CTR</TableHead>
              <TableHead className="text-right">CVL</TableHead>
              <TableHead className="text-right min-w-[120px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {processedData.map((row, index) => {
              const ctr = row.impressions > 0 ? row.clicksAds / row.impressions : 0
              const cvl = row.clicksAds > 0 ? row.leadsRD / row.clicksAds : 0

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
                    'hover:bg-slate-50/50 transition-colors group',
                    draggedId === row.id && 'opacity-50 bg-indigo-50/50',
                    dragOverId === row.id &&
                      'border-t-2 border-t-indigo-500 shadow-[0_-2px_0_rgba(99,102,241,1)] z-10 relative',
                  )}
                  data-state={selectedIds.has(row.id) ? 'selected' : undefined}
                  onDragOver={(e) => onDragOverRow(e, row.id)}
                  onDrop={(e) => onDropRow(e, row.id)}
                >
                  <TableCell className="w-[30px] p-0 text-center align-middle border-r bg-white/50">
                    {!sortField ? (
                      <div
                        draggable
                        onDragStart={(e) => onDragStartRow(e, row.id)}
                        onDragEnd={onDragEndRow}
                        className="cursor-grab active:cursor-grabbing hover:bg-slate-200 p-1 rounded mx-auto inline-flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>
                    ) : (
                      <div
                        className="p-1 rounded mx-auto inline-flex items-center justify-center text-slate-200"
                        title="Reordenação manual desativada enquanto houver ordenação ativa nas colunas."
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-center w-[40px] px-2">
                    <Checkbox
                      checked={selectedIds.has(row.id)}
                      onCheckedChange={(c) => handleSelectRow(row.id, c as boolean)}
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <EditableDateCell
                      value={row.startDate}
                      onSave={(v) => handleUpdate(row.id, 'startDate', v)}
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <EditableDateCell
                      value={row.endDate}
                      onSave={(v) => handleUpdate(row.id, 'endDate', v)}
                    />
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        'font-normal border-0 whitespace-nowrap',
                        isGoogle
                          ? 'text-blue-700 bg-blue-50 hover:bg-blue-100'
                          : isMeta
                            ? 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100'
                            : isSystem
                              ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                              : 'text-slate-700 bg-slate-50 hover:bg-slate-100',
                      )}
                    >
                      {row.platform}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-800">{row.campaign}</span>
                    </div>
                  </TableCell>
                  <TableCell className="p-2">
                    <EditableCell
                      value={row.cost || 0}
                      formatType="currency"
                      onSave={(v) => handleUpdate(row.id, 'cost', v)}
                      onBulkPaste={(vals) =>
                        setPasteConfig({
                          field: 'cost',
                          fieldLabel: 'Investimento (R$)',
                          startRowIndex: index,
                          values: vals,
                        })
                      }
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <EditableCell
                      value={row.impressions}
                      onSave={(v) => handleUpdate(row.id, 'impressions', v)}
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
                  <TableCell className="p-2">
                    <EditableCell
                      value={row.reach}
                      onSave={(v) => handleUpdate(row.id, 'reach', v)}
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
                  <TableCell className="p-2">
                    <EditableCell
                      value={row.clicksAds}
                      onSave={(v) => handleUpdate(row.id, 'clicksAds', v)}
                      onBulkPaste={(vals) =>
                        setPasteConfig({
                          field: 'clicksAds',
                          fieldLabel: 'Cliques',
                          startRowIndex: index,
                          values: vals,
                        })
                      }
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <EditableCell
                      value={row.leadsRD}
                      onSave={(v) => handleUpdate(row.id, 'leadsRD', v)}
                      onBulkPaste={(vals) =>
                        setPasteConfig({
                          field: 'leadsRD',
                          fieldLabel: 'Leads',
                          startRowIndex: index,
                          values: vals,
                        })
                      }
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <EditableCell
                      value={row.quoteQty}
                      onSave={(v) => handleUpdate(row.id, 'quoteQty', v)}
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
                  <TableCell className="p-2">
                    <EditableCell
                      value={row.quoteValue}
                      formatType="currency"
                      onSave={(v) => handleUpdate(row.id, 'quoteValue', v)}
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
                  <TableCell className="p-2">
                    <EditableCell
                      value={row.orderQty}
                      onSave={(v) => handleUpdate(row.id, 'orderQty', v)}
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
                  <TableCell className="p-2">
                    <EditableCell
                      value={row.orderValue}
                      formatType="currency"
                      onSave={(v) => handleUpdate(row.id, 'orderValue', v)}
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
                  <TableCell className="text-right p-2 text-slate-500 font-mono">
                    {formatPercent(ctr)}
                  </TableCell>
                  <TableCell className="text-right p-2 text-slate-500 font-mono">
                    {formatPercent(cvl)}
                  </TableCell>
                  <TableCell className="text-right p-2">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDuplicate(row)}
                        className="h-8 w-8 text-indigo-600 hover:bg-indigo-50"
                        title="Nova Instância a partir desta"
                      >
                        <CopyPlus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingRow(row)}
                        className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                        title="Criar Nova Versão Histórica"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                            title="Excluir registros"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Atenção</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir esses dados?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteRecords(new Set([row.id]))}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Confirmar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!pasteConfig} onOpenChange={(open) => !open && setPasteConfig(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Colar Múltiplos Valores</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a colar {pasteConfig?.values.length} valores na coluna "
              {pasteConfig?.fieldLabel}". Os valores substituirão os dados atuais a partir da linha
              selecionada para baixo. Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmPaste}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
