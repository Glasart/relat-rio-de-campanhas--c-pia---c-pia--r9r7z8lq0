import React, { useState, useRef, useEffect } from 'react'
import { TableHead } from '@/components/ui/table'
import { cn } from '@/lib/utils'

interface ResizableHeaderProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  id: string
  width: number
  minWidth?: number
  onResize: (id: string, width: number) => void
  onResizeEnd: (id: string, width: number) => void
}

export function ResizableHeader({
  id,
  width,
  minWidth = 50,
  onResize,
  onResizeEnd,
  className,
  children,
  ...props
}: ResizableHeaderProps) {
  const [isResizing, setIsResizing] = useState(false)
  const startX = useRef(0)
  const startWidth = useRef(0)
  const currentWidth = useRef(width)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    startX.current = e.pageX
    startWidth.current = width
    currentWidth.current = width
    setIsResizing(true)
  }

  useEffect(() => {
    if (!isResizing) return
    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.pageX - startX.current
      const newWidth = Math.max(minWidth, startWidth.current + delta)
      currentWidth.current = newWidth
      onResize(id, newWidth)
    }
    const handleMouseUp = () => {
      setIsResizing(false)
      onResizeEnd(id, currentWidth.current)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, id, minWidth, onResize, onResizeEnd])

  return (
    <TableHead className={cn('relative group align-middle bg-slate-50', className)} {...props}>
      <div className="w-full h-full flex items-center whitespace-normal break-words">
        {children}
      </div>
      <div
        onMouseDown={handleMouseDown}
        className={cn(
          'absolute right-0 top-0 h-full w-[6px] cursor-col-resize hover:bg-blue-400/50 z-20 touch-none transition-colors transform translate-x-1/2',
          isResizing ? 'bg-blue-400' : '',
        )}
        title="Arraste para redimensionar"
      />
    </TableHead>
  )
}
