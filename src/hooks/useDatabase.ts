import { useState, useMemo } from 'react'
import { useAppContext } from '@/context/AppContext'
import { CampaignRow } from '@/types'
import { DateRange } from 'react-day-picker'
import { format } from 'date-fns'
import { useToast } from '@/hooks/use-toast'

export function useDatabase() {
  const { data, setData, logAction } = useAppContext()
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState<DateRange | undefined>()
  const [sortField, setSortField] = useState<keyof CampaignRow | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null)
  const [editingRow, setEditingRow] = useState<CampaignRow | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  const processedData = useMemo(() => {
    // 1. Enforce unique composite key & get latest version
    const latestRecords = new Map<string, CampaignRow>()
    data.forEach((r) => {
      const key = `${r.campaign.trim().toLowerCase()}|${r.platform}|${r.startDate}|${r.endDate}`
      const existing = latestRecords.get(key)
      if (!existing || (r.version || 1) > (existing.version || 1)) {
        latestRecords.set(key, r)
      }
    })

    let result = Array.from(latestRecords.values())

    // 2. Search
    if (search) {
      result = result.filter(
        (d) =>
          d.campaign.toLowerCase().includes(search.toLowerCase()) ||
          d.platform.toLowerCase().includes(search.toLowerCase()),
      )
    }

    // 3. Date Overlap
    if (dateFilter?.from) {
      const fromStr = format(dateFilter.from, 'yyyy-MM-dd')
      const toStr = dateFilter.to ? format(dateFilter.to, 'yyyy-MM-dd') : fromStr
      result = result.filter((d) => d.startDate <= toStr && d.endDate >= fromStr)
    }

    // 4. Sort
    if (sortField && sortDirection) {
      result.sort((a, b) => {
        let aVal = a[sortField]
        let bVal = b[sortField]
        if (aVal === undefined || bVal === undefined) return 0
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          aVal = aVal.toLowerCase()
          bVal = bVal.toLowerCase()
        }
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
        return 0
      })
    }
    return result
  }, [data, search, dateFilter, sortField, sortDirection])

  const handleUpdate = <K extends keyof CampaignRow>(
    id: string,
    field: K,
    value: CampaignRow[K],
  ) => {
    setData((prev) => {
      const oldRow = prev.find((r) => r.id === id)
      if (oldRow) {
        // Append a new version instead of overwriting
        const newRow = {
          ...oldRow,
          [field]: value,
          id: crypto.randomUUID(),
          version: (oldRow.version || 1) + 1,
          createdAt: new Date().toISOString(),
          originalId: oldRow.originalId || oldRow.id,
        }
        logAction('DB_EDIT', `Editou campo '${field}' na campanha ${oldRow.campaign}`, {
          id: newRow.id,
          prev: oldRow,
          next: newRow,
        })
        return [newRow, ...prev]
      }
      return prev
    })
    toast({
      title: 'Ação Sincronizada',
      description: 'Alteração salva na nuvem.',
      duration: 2000,
    })
  }

  const handleBulkPaste = (updates: { id: string; field: keyof CampaignRow; value: number }[]) => {
    setData((prev) => {
      const newData = [...prev]
      const newRows: CampaignRow[] = []

      updates.forEach(({ id, field, value }) => {
        const oldRow = newData.find((r) => r.id === id)
        if (oldRow) {
          const newRow = {
            ...oldRow,
            [field]: value,
            id: crypto.randomUUID(),
            version: (oldRow.version || 1) + 1,
            createdAt: new Date().toISOString(),
            originalId: oldRow.originalId || oldRow.id,
          }
          newRows.push(newRow)
        }
      })

      if (newRows.length > 0) {
        logAction('DB_BULK_PASTE', `Colou ${newRows.length} valores em massa`, { updates })
        return [...newRows, ...newData]
      }
      return newData
    })
    toast({
      title: 'Colagem Múltipla',
      description: `${updates.length} registros atualizados em tempo real.`,
    })
  }

  const handleSaveEdit = () => {
    if (editingRow) {
      setData((prev) => {
        const oldRow = prev.find((r) => r.id === editingRow.id)
        const newRow = {
          ...editingRow,
          id: crypto.randomUUID(),
          version: (editingRow.version || 1) + 1,
          createdAt: new Date().toISOString(),
          originalId: editingRow.originalId || editingRow.id,
        }
        logAction('DB_EDIT', `Atualizou metadados/métricas da campanha ${oldRow?.campaign}`, {
          id: newRow.id,
          prev: oldRow,
          next: newRow,
        })
        return [newRow, ...prev]
      })
      setEditingRow(null)
      toast({
        title: 'Ação Sincronizada',
        description: 'Os dados foram atualizados no banco central.',
      })
    }
  }

  const handleReorder = (draggedId: string, targetId: string) => {
    const draggedRow = processedData.find((r) => r.id === draggedId)
    const targetRow = processedData.find((r) => r.id === targetId)
    if (!draggedRow || !targetRow) return

    const getCompositeKey = (r: CampaignRow) =>
      `${r.campaign.trim().toLowerCase()}|${r.platform}|${r.startDate}|${r.endDate}`

    const draggedKey = getCompositeKey(draggedRow)
    const targetKey = getCompositeKey(targetRow)

    setData((prev) => {
      const draggedRows = prev.filter((r) => getCompositeKey(r) === draggedKey)
      const otherRows = prev.filter((r) => getCompositeKey(r) !== draggedKey)

      const targetIndex = otherRows.findIndex((r) => getCompositeKey(r) === targetKey)
      if (targetIndex === -1) return prev

      return [...otherRows.slice(0, targetIndex), ...draggedRows, ...otherRows.slice(targetIndex)]
    })

    logAction('DB_REORDER', `Reordenou a campanha ${draggedRow.campaign}`, { draggedId, targetId })
  }

  const handleSort = (field: keyof CampaignRow) => {
    if (sortField === field) {
      if (sortDirection === 'asc') setSortDirection('desc')
      else {
        setSortField(null)
        setSortDirection(null)
      }
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleDuplicate = (row: CampaignRow) => {
    const newRow = {
      ...row,
      id: crypto.randomUUID(),
      campaign: `${row.campaign} (Cópia)`,
      version: 1,
      createdAt: new Date().toISOString(),
      originalId: undefined,
    }
    setData((prev) => [newRow, ...prev])
    logAction('DB_DUPLICATE', `Duplicou a campanha ${row.campaign}`, {
      newId: newRow.id,
      row: newRow,
    })
    toast({
      title: 'Ação Sincronizada',
      description: 'Uma cópia foi criada e sincronizada.',
    })
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedIds(new Set(processedData.map((r) => r.id)))
    else setSelectedIds(new Set())
  }

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSet = new Set(selectedIds)
    if (checked) newSet.add(id)
    else newSet.delete(id)
    setSelectedIds(newSet)
  }

  const handleBulkDuplicate = () => {
    const toDuplicate = data.filter((r) => selectedIds.has(r.id))
    const newRows = toDuplicate.map((r) => ({
      ...r,
      id: crypto.randomUUID(),
      campaign: `${r.campaign} (Cópia)`,
      version: 1,
      createdAt: new Date().toISOString(),
      originalId: undefined,
    }))
    setData((prev) => [...newRows, ...prev])
    logAction('DB_BULK_DUPLICATE', `Duplicou ${newRows.length} campanhas em lote`, {
      newIds: newRows.map((r) => r.id),
      rows: newRows,
    })
    toast({
      title: 'Ação Sincronizada',
      description: `${newRows.length} campanhas duplicadas na nuvem.`,
    })
  }

  const handleBulkCopy = () => {
    const toCopy = data.filter((r) => selectedIds.has(r.id))
    navigator.clipboard.writeText(JSON.stringify(toCopy, null, 2))
    toast({
      title: 'Cópia em Lote',
      description: `${toCopy.length} campanhas copiadas para a área de transferência.`,
    })
  }

  const handleResetDatabase = () => {
    setData([])
    setSelectedIds(new Set())
    logAction('DB_RESET', 'Apagou toda a base de dados', {})
    toast({
      title: 'Ação Sincronizada',
      description: 'Todos os registros foram apagados para a equipe.',
    })
  }

  const handleZeroMetrics = () => {
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
    logAction('DB_ZERO_METRICS', 'Zerou todos os dados numéricos', {})
    toast({
      title: 'Ação Sincronizada',
      description: 'Todos os valores numéricos foram redefinidos para 0 para todos.',
    })
  }

  const handleDeleteRecords = (idsToDelete: Set<string>) => {
    setData((prev) => prev.filter((r) => !idsToDelete.has(r.id)))
    setSelectedIds((prev) => new Set([...prev].filter((id) => !idsToDelete.has(id))))
    logAction('DB_DELETE', `Excluiu ${idsToDelete.size} registro(s)`, {
      ids: Array.from(idsToDelete),
    })
    toast({
      title: 'Ação Sincronizada',
      description: `${idsToDelete.size} registro(s) excluído(s) da nuvem.`,
    })
  }

  return {
    search,
    setSearch,
    dateFilter,
    setDateFilter,
    sortField,
    sortDirection,
    handleSort,
    editingRow,
    setEditingRow,
    handleSaveEdit,
    handleReorder,
    selectedIds,
    handleSelectAll,
    handleSelectRow,
    processedData,
    handleUpdate,
    handleBulkPaste,
    handleDuplicate,
    handleBulkDuplicate,
    handleBulkCopy,
    handleResetDatabase,
    handleZeroMetrics,
    handleDeleteRecords,
    data,
    setData,
  }
}

export type DatabaseState = ReturnType<typeof useDatabase>
