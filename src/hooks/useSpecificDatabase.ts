import { useState, useMemo } from 'react'
import { useAppContext } from '@/context/AppContext'
import { CampaignRow } from '@/types'
import { DateRange } from 'react-day-picker'
import { format } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { DatabaseState } from '@/hooks/useDatabase'

export function useSpecificDatabase(): DatabaseState {
  const { data, setData, logAction } = useAppContext()
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState<DateRange | undefined>()
  const [sortField, setSortField] = useState<keyof CampaignRow | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null)
  const [editingRow, setEditingRow] = useState<CampaignRow | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  const processedData = useMemo(() => {
    const latestRecords = new Map<string, CampaignRow>()
    data.forEach((r) => {
      const key = `${r.campaign.trim().toLowerCase()}|${r.platform}|${r.startDate}|${r.endDate}`
      const existing = latestRecords.get(key)
      if (!existing || (r.version || 1) > (existing.version || 1)) {
        latestRecords.set(key, r)
      }
    })

    let result = Array.from(latestRecords.values())

    if (search) {
      result = result.filter(
        (d) =>
          d.campaign.toLowerCase().includes(search.toLowerCase()) ||
          d.platform.toLowerCase().includes(search.toLowerCase()),
      )
    }

    if (dateFilter?.from) {
      const fromStr = format(dateFilter.from, 'yyyy-MM-dd')
      const toStr = dateFilter.to ? format(dateFilter.to, 'yyyy-MM-dd') : fromStr
      result = result.filter((d) => d.startDate <= toStr && d.endDate >= fromStr)
    }

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
        const newRow = {
          ...oldRow,
          [field]: value,
          id: crypto.randomUUID(),
          version: (oldRow.version || 1) + 1,
          createdAt: new Date().toISOString(),
          originalId: oldRow.originalId || oldRow.id,
        }
        logAction('SPECIFIC_DB_EDIT', `Editou campo '${field}' na campanha ${oldRow.campaign}`, {
          id: newRow.id,
          prev: oldRow,
          next: newRow,
        })
        return [newRow, ...prev]
      }
      return prev
    })
    toast({
      title: 'Alteração Pendente',
      description: 'Salve as alterações para sincronizar com a nuvem.',
      duration: 2500,
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
        logAction('SPECIFIC_DB_BULK_PASTE', `Colou ${newRows.length} valores em massa`, { updates })
        return [...newRows, ...newData]
      }
      return newData
    })
    toast({
      title: 'Colagem Pendente',
      description: `${updates.length} registros atualizados. Lembre-se de salvar.`,
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
        logAction(
          'SPECIFIC_DB_EDIT',
          `Atualizou metadados/métricas da campanha ${oldRow?.campaign}`,
          {
            id: newRow.id,
            prev: oldRow,
            next: newRow,
          },
        )
        return [newRow, ...prev]
      })
      setEditingRow(null)
      toast({
        title: 'Alteração Pendente',
        description: 'Os dados foram atualizados localmente. Salve para persistir.',
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

    logAction('SPECIFIC_DB_REORDER', `Reordenou a campanha ${draggedRow.campaign}`, {
      draggedId,
      targetId,
    })
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
    logAction('SPECIFIC_DB_DUPLICATE', `Duplicou a campanha ${row.campaign}`, {
      newId: newRow.id,
      row: newRow,
    })
    toast({
      title: 'Registro Duplicado',
      description: 'Uma cópia foi criada. Salve as alterações.',
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
    logAction('SPECIFIC_DB_BULK_DUPLICATE', `Duplicou ${newRows.length} campanhas em lote`, {
      newIds: newRows.map((r) => r.id),
      rows: newRows,
    })
    toast({
      title: 'Duplicação Pendente',
      description: `${newRows.length} campanhas duplicadas. Salve para confirmar.`,
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
    logAction('SPECIFIC_DB_RESET', 'Apagou toda a base de dados central', {})
    toast({
      title: 'Ação Pendente',
      description: 'Todos os registros foram apagados localmente. Salve as alterações.',
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
    logAction('SPECIFIC_DB_ZERO_METRICS', 'Zerou todos os dados numéricos locais', {})
    toast({
      title: 'Métricas Zeradas Localmente',
      description: 'Todos os valores numéricos foram redefinidos para 0. Salve as alterações.',
    })
  }

  const handleDeleteRecords = (idsToDelete: Set<string>) => {
    setData((prev) => prev.filter((r) => !idsToDelete.has(r.id)))
    setSelectedIds((prev) => new Set([...prev].filter((id) => !idsToDelete.has(id))))
    logAction('SPECIFIC_DB_DELETE', `Excluiu ${idsToDelete.size} registro(s) específicos`, {
      ids: Array.from(idsToDelete),
    })
    toast({
      title: 'Exclusão Pendente',
      description: `${idsToDelete.size} registro(s) excluído(s) localmente. Salve para confirmar.`,
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
