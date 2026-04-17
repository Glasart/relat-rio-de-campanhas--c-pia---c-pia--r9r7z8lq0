import React, { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { TableHead } from '@/components/ui/table'
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/formatters'
import { CampaignRow } from '@/types'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format, parse } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function EditableDateCell({
  value,
  displayValue,
  onSave,
}: {
  value: string
  displayValue?: string
  onSave: (val: string) => void
}) {
  const [date, setDate] = useState<Date | undefined>(
    value ? parse(value, 'yyyy-MM-dd', new Date()) : undefined,
  )
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setDate(value ? parse(value, 'yyyy-MM-dd', new Date()) : undefined)
  }, [value])

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate)
      setOpen(false)
      onSave(format(selectedDate, 'yyyy-MM-dd'))
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          className="cursor-pointer hover:bg-blue-50/50 hover:ring-1 hover:ring-blue-200 px-2 py-1.5 rounded transition-all w-full text-left font-medium text-slate-500 flex items-center gap-2 min-w-[100px]"
          title="Clique para editar a data"
        >
          <span className="truncate whitespace-nowrap">
            {displayValue || (date ? format(date, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecione')}
          </span>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
          locale={ptBR}
        />
      </PopoverContent>
    </Popover>
  )
}

export function EditableCell({
  value,
  onSave,
  formatType = 'number',
  onBulkPaste,
}: {
  value: number
  onSave: (val: number) => void
  formatType?: 'number' | 'currency' | 'percent'
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
    if (!isNaN(parsed) && parsed !== value) onSave(parsed)
    else setLocalVal(value.toString())
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') inputRef.current?.blur()
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

  if (isEditing)
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
        className="h-8 w-full min-w-[70px] text-right px-2 py-1 text-xs font-mono bg-white border-blue-400 focus-visible:ring-1 focus-visible:ring-blue-400"
      />
    )

  let displayValue = value.toString()
  if (formatType === 'currency') displayValue = formatCurrency(value)
  else if (formatType === 'percent')
    displayValue = new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      maximumFractionDigits: 1,
    }).format(value)
  else displayValue = formatNumber(value)

  return (
    <div
      className="cursor-pointer hover:bg-blue-50/50 hover:ring-1 hover:ring-blue-200 px-2 py-1.5 rounded transition-all w-full text-right font-mono"
      onClick={() => setIsEditing(true)}
      title="Clique para editar ou Cole (Ctrl+V) múltiplos valores"
    >
      {displayValue}
    </div>
  )
}

export function SortableHead({
  field,
  label,
  currentSort,
  direction,
  onSort,
  align = 'left',
}: {
  field: keyof CampaignRow
  label: string
  currentSort: keyof CampaignRow | null
  direction: 'asc' | 'desc' | null
  onSort: (field: keyof CampaignRow) => void
  align?: 'left' | 'right'
}) {
  const isSorted = currentSort === field
  return (
    <TableHead
      onClick={() => onSort(field)}
      className={`cursor-pointer select-none hover:bg-slate-100 transition-colors ${align === 'right' ? 'text-right' : 'text-left'}`}
    >
      <div className={`flex items-center gap-1.5 ${align === 'right' ? 'justify-end' : ''}`}>
        {align === 'right' &&
          (isSorted ? (
            direction === 'asc' ? (
              <ArrowUp className="w-3.5 h-3.5" />
            ) : (
              <ArrowDown className="w-3.5 h-3.5" />
            )
          ) : (
            <ArrowUpDown className="w-3.5 h-3.5 opacity-30" />
          ))}
        <span>{label}</span>
        {align === 'left' &&
          (isSorted ? (
            direction === 'asc' ? (
              <ArrowUp className="w-3.5 h-3.5" />
            ) : (
              <ArrowDown className="w-3.5 h-3.5" />
            )
          ) : (
            <ArrowUpDown className="w-3.5 h-3.5 opacity-30" />
          ))}
      </div>
    </TableHead>
  )
}
