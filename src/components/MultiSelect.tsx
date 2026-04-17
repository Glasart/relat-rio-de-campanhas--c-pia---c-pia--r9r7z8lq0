import React, { useState, useRef, useEffect } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface MultiSelectProps {
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder: string
}

export function MultiSelect({ options, selected, onChange, placeholder }: MultiSelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleOption = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((x) => x !== opt))
    } else {
      onChange([...selected, opt])
    }
  }

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="outline"
        onClick={() => setOpen(!open)}
        className="w-[200px] justify-between h-10 bg-white"
      >
        <span className="truncate">
          {selected.length === 0 ? placeholder : `${selected.length} selecionados`}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </Button>

      {open && (
        <div className="absolute z-50 top-full mt-1 w-[200px] bg-white border rounded-md shadow-md py-1 max-h-60 overflow-auto animate-in fade-in-0 zoom-in-95">
          {options.length === 0 && (
            <div className="p-2 text-sm text-muted-foreground">Nenhuma opção</div>
          )}
          {options.map((opt) => (
            <div
              key={opt}
              onClick={() => toggleOption(opt)}
              className="flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-muted"
            >
              <div
                className={cn(
                  'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                  selected.includes(opt)
                    ? 'bg-primary text-primary-foreground'
                    : 'opacity-50 [&_svg]:invisible',
                )}
              >
                <Check className="h-3 w-3" />
              </div>
              <span>{opt}</span>
            </div>
          ))}
          {selected.length > 0 && (
            <div className="p-2 border-t mt-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-8 text-xs"
                onClick={(e) => {
                  e.stopPropagation()
                  onChange([])
                }}
              >
                Limpar
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
