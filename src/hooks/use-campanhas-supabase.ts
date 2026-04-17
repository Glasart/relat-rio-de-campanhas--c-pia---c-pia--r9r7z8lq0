import { useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAppContext } from '@/context/AppContext'
import { CampaignRow } from '@/types'
import { useToast } from '@/hooks/use-toast'

export const mapToCampaignRow = (row: any): CampaignRow => ({
  id: row.id,
  startDate: row.data_inicio || '',
  endDate: row.data_fim || '',
  platform: row.plataforma_canal || '',
  campaign: row.nome_campanha || '',
  audience: row.publico || '',
  cost: Number(row.investimento) || 0,
  impressions: Number(row.impressoes) || 0,
  reach: Number(row.alcance) || 0,
  clicksAds: Number(row.cliques_ads) || 0,
  clicksRD: Number(row.cliques_rd) || 0,
  leadsSalesSheet: Number(row.leads_planilha) || 0,
  leadsRD: Number(row.leads_rd) || 0,
  quoteQty: Number(row.orcamentos_qtd) || 0,
  quoteValue: Number(row.orcamentos_valor) || 0,
  orderQty: Number(row.pedidos_qtd) || 0,
  orderValue: Number(row.pedidos_valor) || 0,
  ordem: row.ordem || 0,
})

export const mapToSupabaseRow = (row: Partial<CampaignRow>) => {
  const res: any = {}
  if (row.startDate !== undefined) res.data_inicio = row.startDate
  if (row.endDate !== undefined) res.data_fim = row.endDate
  if (row.platform !== undefined) res.plataforma_canal = row.platform
  if (row.campaign !== undefined) res.nome_campanha = row.campaign
  if (row.audience !== undefined) res.publico = row.audience
  if (row.cost !== undefined) res.investimento = row.cost
  if (row.impressions !== undefined) res.impressoes = row.impressions
  if (row.reach !== undefined) res.alcance = row.reach
  if (row.clicksAds !== undefined) res.cliques_ads = row.clicksAds
  if (row.clicksRD !== undefined) res.cliques_rd = row.clicksRD
  if (row.leadsSalesSheet !== undefined) res.leads_planilha = row.leadsSalesSheet
  if (row.leadsRD !== undefined) res.leads_rd = row.leadsRD
  if (row.quoteQty !== undefined) res.orcamentos_qtd = row.quoteQty
  if (row.quoteValue !== undefined) res.orcamentos_valor = row.quoteValue
  if (row.orderQty !== undefined) res.pedidos_qtd = row.orderQty
  if (row.orderValue !== undefined) res.pedidos_valor = row.orderValue
  if (row.ordem !== undefined) res.ordem = row.ordem
  return res
}

export function useCampanhasSupabase() {
  const { setData } = useAppContext()
  const { toast } = useToast()

  const pendingUpdates = useRef<Record<string, Partial<CampaignRow>>>({})
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const fetchCampanhas = useCallback(async () => {
    const { data: rows } = await supabase
      .from('performance_campanhas')
      .select('*')
      .order('ordem', { ascending: true })

    if (rows) {
      setData(rows.map(mapToCampaignRow))
    }
  }, [setData])

  useEffect(() => {
    fetchCampanhas()

    const channel = supabase
      .channel('performance_campanhas_sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'performance_campanhas' },
        () => {
          fetchCampanhas()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchCampanhas])

  const flushUpdates = useCallback(async () => {
    const updates = pendingUpdates.current
    pendingUpdates.current = {}

    for (const [id, update] of Object.entries(updates)) {
      const mapped = mapToSupabaseRow(update)
      await supabase.from('performance_campanhas').update(mapped).eq('id', id)
    }
  }, [])

  const triggerDebounce = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      flushUpdates()
    }, 300)
  }, [flushUpdates])

  const updateCampanha = useCallback(
    (id: string, field: string, value: any) => {
      setData((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)))
      pendingUpdates.current[id] = { ...pendingUpdates.current[id], [field]: value }
      triggerDebounce()
    },
    [setData, triggerDebounce],
  )

  const bulkUpdateCampanhas = useCallback(
    (ids: string[], updates: Record<string, number>) => {
      setData((prev) => prev.map((r) => (ids.includes(r.id) ? { ...r, ...updates } : r)))
      ids.forEach((id) => {
        pendingUpdates.current[id] = { ...pendingUpdates.current[id], ...updates }
      })
      triggerDebounce()
    },
    [setData, triggerDebounce],
  )

  const bulkPasteCampanhas = useCallback(
    (updates: { id: string; field: string; value: number }[]) => {
      setData((prev) => {
        const copy = [...prev]
        updates.forEach(({ id, field, value }) => {
          const idx = copy.findIndex((r) => r.id === id)
          if (idx !== -1) {
            copy[idx] = { ...copy[idx], [field]: value }
          }
        })
        return copy
      })
      updates.forEach(({ id, field, value }) => {
        pendingUpdates.current[id] = { ...pendingUpdates.current[id], [field]: value }
      })
      triggerDebounce()
    },
    [setData, triggerDebounce],
  )

  const deleteCampanha = useCallback(
    async (id: string) => {
      setData((prev) => prev.filter((r) => r.id !== id))
      await supabase.from('performance_campanhas').delete().eq('id', id)
      toast({ title: 'Ação Sincronizada', description: 'Registro excluído do banco central.' })
    },
    [setData, toast],
  )

  const bulkDeleteCampanhas = useCallback(
    async (ids: string[]) => {
      setData((prev) => prev.filter((r) => !ids.includes(r.id)))
      await supabase.from('performance_campanhas').delete().in('id', ids)
      toast({ title: 'Ação Sincronizada', description: 'Exclusão em lote confirmada.' })
    },
    [setData, toast],
  )

  const reorderCampanhas = useCallback(
    (draggedId: string, targetId: string) => {
      setData((prev) => {
        const draggedIndex = prev.findIndex((r) => r.id === draggedId)
        const targetIndex = prev.findIndex((r) => r.id === targetId)
        if (draggedIndex === -1 || targetIndex === -1) return prev

        const copy = [...prev]
        const [draggedItem] = copy.splice(draggedIndex, 1)
        copy.splice(targetIndex, 0, draggedItem)

        copy.forEach((item, index) => {
          item.ordem = index
          pendingUpdates.current[item.id] = { ...pendingUpdates.current[item.id], ordem: index }
        })
        triggerDebounce()
        return copy
      })
    },
    [setData, triggerDebounce],
  )

  const addCampanha = useCallback(
    async (newRowData: Partial<CampaignRow>) => {
      const mapped = mapToSupabaseRow(newRowData)
      const { data: inserted, error } = await supabase
        .from('performance_campanhas')
        .insert(mapped)
        .select()
        .single()
      if (inserted) {
        setData((prev) => [...prev, mapToCampaignRow(inserted)])
        toast({ title: 'Ação Sincronizada', description: 'Nova campanha criada.' })
      } else if (error) {
        toast({ title: 'Erro', description: error.message, variant: 'destructive' })
      }
    },
    [setData, toast],
  )

  return {
    updateCampanha,
    bulkUpdateCampanhas,
    bulkPasteCampanhas,
    deleteCampanha,
    bulkDeleteCampanhas,
    reorderCampanhas,
    addCampanha,
  }
}
