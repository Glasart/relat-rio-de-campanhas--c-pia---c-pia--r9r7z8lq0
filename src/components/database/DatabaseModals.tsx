import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { DatabaseState } from '@/hooks/useDatabase'
import { PLATFORMS } from '@/lib/constants'
import { Sparkles } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { CampaignRow } from '@/types'

export function DatabaseModals({ state }: { state: DatabaseState }) {
  const { editingRow, setEditingRow, handleSaveEdit } = state
  const { toast } = useToast()

  const handleAiSuggest = (field: keyof CampaignRow) => {
    if (!editingRow) return
    const suggestions: Partial<Record<keyof CampaignRow, number>> = {
      cost: Math.floor(Math.random() * 2000) + 100,
      impressions: Math.floor(Math.random() * 20000) + 5000,
      reach: Math.floor(Math.random() * 15000) + 3000,
      clicksAds: Math.floor(Math.random() * 1000) + 100,
      quoteQty: Math.floor(Math.random() * 50) + 5,
      quoteValue: Math.floor(Math.random() * 3000) + 500,
      leadsRD: Math.floor(Math.random() * 100) + 10,
      orderQty: Math.floor(Math.random() * 20) + 1,
      orderValue: Math.floor(Math.random() * 2000) + 200,
    }
    setEditingRow({ ...editingRow, [field]: suggestions[field] || editingRow[field] })
    toast({
      title: 'Assistente IA',
      description: `Valor sugerido para o campo preenchido.`,
      duration: 1500,
    })
  }

  const AiButton = ({ field }: { field: keyof CampaignRow }) => (
    <button
      type="button"
      onClick={() => handleAiSuggest(field)}
      className="text-indigo-400 hover:text-indigo-600 transition-colors bg-indigo-50 p-1 rounded-md ml-2 inline-flex items-center"
      title="Sugerir valor com IA"
    >
      <Sparkles className="w-3 h-3" />
    </button>
  )

  return (
    <Dialog open={!!editingRow} onOpenChange={(open) => !open && setEditingRow(null)}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Versão Histórica</DialogTitle>
          <DialogDescription>
            Salvar as alterações não exclui a versão original. Uma nova entrada será registrada e
            identificada como a versão mais recente deste período.
          </DialogDescription>
        </DialogHeader>

        {editingRow && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Plataforma e Canal</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={editingRow.platform}
                onChange={(e) => setEditingRow({ ...editingRow, platform: e.target.value })}
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Nome da Campanha</Label>
              <Input
                value={editingRow.campaign}
                onChange={(e) => setEditingRow({ ...editingRow, campaign: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Público</Label>
              <Input
                value={editingRow.audience}
                onChange={(e) => setEditingRow({ ...editingRow, audience: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 col-span-1 sm:col-span-2">
              <div className="space-y-2">
                <Label>Data Inicial</Label>
                <Input
                  type="date"
                  value={editingRow.startDate}
                  onChange={(e) => setEditingRow({ ...editingRow, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Data Final</Label>
                <Input
                  type="date"
                  value={editingRow.endDate}
                  onChange={(e) => setEditingRow({ ...editingRow, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="col-span-1 sm:col-span-2 mt-4 pt-4 border-t grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-slate-600">Investimento (R$)</Label>
                  <AiButton field="cost" />
                </div>
                <Input
                  type="number"
                  value={editingRow.cost || 0}
                  onChange={(e) => setEditingRow({ ...editingRow, cost: Number(e.target.value) })}
                  className="font-mono bg-white"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-slate-600">Impressões</Label>
                  <AiButton field="impressions" />
                </div>
                <Input
                  type="number"
                  value={editingRow.impressions}
                  onChange={(e) =>
                    setEditingRow({ ...editingRow, impressions: Number(e.target.value) })
                  }
                  className="font-mono bg-white"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-slate-600">Alcance</Label>
                  <AiButton field="reach" />
                </div>
                <Input
                  type="number"
                  value={editingRow.reach}
                  onChange={(e) => setEditingRow({ ...editingRow, reach: Number(e.target.value) })}
                  className="font-mono bg-white"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-slate-600">Cliques</Label>
                  <AiButton field="clicksAds" />
                </div>
                <Input
                  type="number"
                  value={editingRow.clicksAds}
                  onChange={(e) =>
                    setEditingRow({ ...editingRow, clicksAds: Number(e.target.value) })
                  }
                  className="font-mono bg-white"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-slate-600">Leads</Label>
                  <AiButton field="leadsRD" />
                </div>
                <Input
                  type="number"
                  value={editingRow.leadsRD}
                  onChange={(e) =>
                    setEditingRow({ ...editingRow, leadsRD: Number(e.target.value) })
                  }
                  className="font-mono bg-white"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-slate-600">Orçamentos (Qtd)</Label>
                  <AiButton field="quoteQty" />
                </div>
                <Input
                  type="number"
                  value={editingRow.quoteQty}
                  onChange={(e) =>
                    setEditingRow({ ...editingRow, quoteQty: Number(e.target.value) })
                  }
                  className="font-mono bg-white"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-slate-600">Valor Orç. (R$)</Label>
                  <AiButton field="quoteValue" />
                </div>
                <Input
                  type="number"
                  value={editingRow.quoteValue}
                  onChange={(e) =>
                    setEditingRow({ ...editingRow, quoteValue: Number(e.target.value) })
                  }
                  className="font-mono bg-white"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-slate-600">Pedidos (Qtd)</Label>
                  <AiButton field="orderQty" />
                </div>
                <Input
                  type="number"
                  value={editingRow.orderQty}
                  onChange={(e) =>
                    setEditingRow({ ...editingRow, orderQty: Number(e.target.value) })
                  }
                  className="font-mono bg-white"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-slate-600">Valor Ped. (R$)</Label>
                  <AiButton field="orderValue" />
                </div>
                <Input
                  type="number"
                  value={editingRow.orderValue}
                  onChange={(e) =>
                    setEditingRow({ ...editingRow, orderValue: Number(e.target.value) })
                  }
                  className="font-mono bg-white"
                />
              </div>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setEditingRow(null)}>
            Cancelar
          </Button>
          <Button onClick={handleSaveEdit}>Salvar Nova Versão</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
