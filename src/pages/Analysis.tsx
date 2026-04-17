import React, { useState } from 'react'
import { useAppContext } from '@/context/AppContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { BrainCircuit, History } from 'lucide-react'

export default function Analysis() {
  const { user, setAnalyses, logAction } = useAppContext()
  const { toast } = useToast()
  const [form, setForm] = useState({ dateRangeStr: '', improved: '', worsened: '', decisions: '' })

  const handleSave = () => {
    const newAnalysis = {
      ...form,
      id: crypto.randomUUID(),
      author: user || undefined,
      platforms: ['Todas'],
    }

    // Always create a new entry instead of overwriting, ensuring data persistence and historical record
    setAnalyses((prev) => [newAnalysis, ...prev])

    logAction('ADD_ANALYSIS', `Criou nova análise executiva: ${form.dateRangeStr}`, {
      row: newAnalysis,
    })

    toast({
      title: 'Análise Salva',
      description: 'O relatório foi adicionado ao histórico permanentemente.',
    })

    setForm({ dateRangeStr: '', improved: '', worsened: '', decisions: '' })
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in-up pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Análise Semanal</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Registre conclusões estratégicas e gere relatórios versionados.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <History className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-semibold text-blue-900">Geração Histórica</h3>
          <p className="text-xs text-blue-700 mt-1">
            Análises geradas nunca são sobrescritas. Cada salvamento cria um novo registro histórico
            imutável, consolidando as decisões de negócio ao longo do tempo.
          </p>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50/50 border-b">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BrainCircuit className="w-5 h-5 text-primary" /> Nova Análise Executiva
          </CardTitle>
          <CardDescription>
            Preencha os campos abaixo com os insights extraídos dos dados consolidados.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Período de Referência</label>
            <Input
              placeholder="ex: 01/10/2023 - 07/10/2023"
              value={form.dateRangeStr}
              onChange={(e) => setForm({ ...form, dateRangeStr: e.target.value })}
              className="bg-slate-50 focus:bg-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-emerald-700">O que melhorou?</label>
            <Textarea
              placeholder="Descreva os indicadores que apresentaram melhora..."
              value={form.improved}
              onChange={(e) => setForm({ ...form, improved: e.target.value })}
              className="min-h-[100px] border-emerald-200 focus-visible:ring-emerald-500 bg-emerald-50/30"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-red-700">O que piorou?</label>
            <Textarea
              placeholder="Identifique gargalos ou métricas em queda..."
              value={form.worsened}
              onChange={(e) => setForm({ ...form, worsened: e.target.value })}
              className="min-h-[100px] border-red-200 focus-visible:ring-red-500 bg-red-50/30"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-blue-700">Decisões Tomadas</label>
            <Textarea
              placeholder="Plano de ação e próximos passos..."
              value={form.decisions}
              onChange={(e) => setForm({ ...form, decisions: e.target.value })}
              className="min-h-[100px] border-blue-200 focus-visible:ring-blue-500 bg-blue-50/30"
            />
          </div>

          <div className="pt-2">
            <Button
              onClick={handleSave}
              disabled={!form.dateRangeStr}
              className="w-full sm:w-auto h-11 px-8 text-base"
            >
              Salvar e Historiar Análise
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
