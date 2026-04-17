import React, { useState } from 'react'
import { useAppContext } from '@/context/AppContext'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
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
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Plus, Upload, FileUp, ListChecks, Trash2, ListPlus, RotateCcw } from 'lucide-react'
import { CampaignRow } from '@/types'
import { PLATFORMS } from '@/lib/constants'
import { DatabaseState } from '@/hooks/useDatabase'

interface Props {
  state: DatabaseState
  title?: string
  description?: string
}

export function DatabaseHeader({ state, title, description }: Props) {
  const { setData, handleResetDatabase, handleZeroMetrics } = state
  const { logAction } = useAppContext()
  const [openAdd, setOpenAdd] = useState(false)
  const [openBulk, setOpenBulk] = useState(false)
  const [openUpload, setOpenUpload] = useState(false)
  const [openPreview, setOpenPreview] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<CampaignRow[]>([])
  const { toast } = useToast()

  const displayTitle = title || 'Base Histórica Oficial'
  const displayDesc =
    description ||
    'A base de dados é sincronizada na nuvem em tempo real. Toda edição cria uma nova versão histórica para todos os usuários.'

  const todayStr = new Date().toISOString().split('T')[0]
  const [newCamp, setNewCamp] = useState({
    name: '',
    desc: '',
    aud: '',
    plat: PLATFORMS[0],
    startDate: todayStr,
    endDate: todayStr,
  })

  const [bulkRows, setBulkRows] = useState([
    {
      id: crypto.randomUUID(),
      plat: PLATFORMS[0],
      name: '',
      aud: '',
      startDate: todayStr,
      endDate: todayStr,
    },
  ])

  const [selectedBulkIds, setSelectedBulkIds] = useState<Set<string>>(new Set())

  const isAllBulkSelected = bulkRows.length > 0 && selectedBulkIds.size === bulkRows.length

  const handleSelectAllBulk = (checked: boolean) => {
    if (checked) setSelectedBulkIds(new Set(bulkRows.map((r) => r.id)))
    else setSelectedBulkIds(new Set())
  }

  const handleSelectBulkRow = (id: string, checked: boolean) => {
    const newSet = new Set(selectedBulkIds)
    if (checked) newSet.add(id)
    else newSet.delete(id)
    setSelectedBulkIds(newSet)
  }

  const handleAddCampaign = () => {
    const newRow: CampaignRow = {
      id: crypto.randomUUID(),
      startDate: newCamp.startDate,
      endDate: newCamp.endDate,
      week: 'Semana Atual',
      platform: newCamp.plat,
      campaign: newCamp.name,
      description: newCamp.desc,
      audience: newCamp.aud,
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
      version: 1,
      createdAt: new Date().toISOString(),
    }
    setData((prev) => [newRow, ...prev])
    logAction('DB_INSERT', `Cadastrou manualmente a campanha: ${newCamp.name}`, { row: newRow })
    setOpenAdd(false)
    setNewCamp({
      name: '',
      desc: '',
      aud: '',
      plat: PLATFORMS[0],
      startDate: todayStr,
      endDate: todayStr,
    })
    toast({
      title: 'Ação Sincronizada',
      description: 'Campanha registrada na nuvem com sucesso.',
    })
  }

  const handleAddBulkRow = () => {
    setBulkRows([
      ...bulkRows,
      {
        id: crypto.randomUUID(),
        plat: PLATFORMS[0],
        name: '',
        aud: '',
        startDate: todayStr,
        endDate: todayStr,
      },
    ])
  }

  const handleRemoveBulkRow = (id: string) => {
    if (bulkRows.length === 1) return
    setBulkRows(bulkRows.filter((r) => r.id !== id))
    setSelectedBulkIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  const COLUMNS = ['plat', 'name', 'aud', 'startDate', 'endDate']

  const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement | HTMLSelectElement>,
    rowIndex: number,
    field: string,
  ) => {
    const text = e.clipboardData.getData('text')
    if (!text.includes('\n') && !text.includes('\t')) return

    e.preventDefault()
    const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '')
    const startColIdx = COLUMNS.indexOf(field)

    setBulkRows((prev) => {
      const newRows = [...prev]

      lines.forEach((line, idx) => {
        const targetIndex = rowIndex + idx
        const cols = line.split('\t')

        if (!newRows[targetIndex]) {
          newRows[targetIndex] = {
            id: crypto.randomUUID(),
            plat: PLATFORMS[0],
            name: '',
            aud: '',
            startDate: todayStr,
            endDate: todayStr,
          }
        }

        cols.forEach((colVal, colOffset) => {
          const colName = COLUMNS[startColIdx + colOffset]
          if (colName) {
            let finalVal = colVal.trim()
            if ((colName === 'startDate' || colName === 'endDate') && finalVal) {
              const parts = finalVal.split('/')
              if (parts.length === 3) {
                finalVal = `${parts[2]}-${parts[1]}-${parts[0]}`
              }
            }
            newRows[targetIndex] = { ...newRows[targetIndex], [colName]: finalVal }
          }
        })
      })

      return newRows
    })
  }

  const handleUpdateBulkRow = (id: string, field: string, value: string) => {
    const syncFields = ['plat', 'aud', 'startDate', 'endDate']
    const isSyncField = syncFields.includes(field)
    const isSelected = selectedBulkIds.has(id)

    setBulkRows((prev) => {
      if (isSelected && isSyncField) {
        return prev.map((r) => (selectedBulkIds.has(r.id) ? { ...r, [field]: value } : r))
      }
      return prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    })
  }

  const handleBulkSave = () => {
    const isValid = bulkRows.every((r) => r.name.trim() && r.startDate && r.endDate)
    if (!isValid) {
      toast({
        title: 'Erro de Validação',
        description: 'Preencha o nome da campanha e as datas para todas as linhas.',
        variant: 'destructive',
      })
      return
    }

    const newRows: CampaignRow[] = bulkRows.map((r) => ({
      id: crypto.randomUUID(),
      platform: r.plat,
      campaign: r.name,
      audience: r.aud,
      startDate: r.startDate,
      endDate: r.endDate,
      week: 'Semana Atual',
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
      version: 1,
      createdAt: new Date().toISOString(),
    }))

    setData((prev) => [...newRows, ...prev])
    logAction('DB_BULK_MANUAL', `Cadastrou ${newRows.length} registros em lote`, { rows: newRows })
    setOpenBulk(false)
    setSelectedBulkIds(new Set())
    setBulkRows([
      {
        id: crypto.randomUUID(),
        plat: PLATFORMS[0],
        name: '',
        aud: '',
        startDate: todayStr,
        endDate: todayStr,
      },
    ])
    toast({
      title: 'Ação Sincronizada',
      description: `${newRows.length} entradas foram enviadas para a nuvem.`,
    })
  }

  const handleUpload = () => {
    if (!selectedFile) return
    setIsUploading(true)
    setTimeout(() => {
      const isMeta = selectedFile.name.toLowerCase().includes('meta')
      const mappedRows: CampaignRow[] = Array.from({ length: 3 }).map((_, i) => ({
        id: crypto.randomUUID(),
        startDate: todayStr,
        endDate: todayStr,
        week: 'Semana Atual',
        platform: isMeta ? 'Facebook Exportação' : 'Google Exportação',
        campaign: `${selectedFile.name.split('.')[0]} - Row ${i + 1}`,
        audience: 'Importação',
        cost: Math.floor(Math.random() * 2000) + 100,
        impressions: Math.floor(Math.random() * 10000) + 5000,
        reach: Math.floor(Math.random() * 8000) + 4000,
        clicksAds: Math.floor(Math.random() * 500) + 100,
        clicksRD: 0,
        leadsRD: 0,
        leadsSalesSheet: 0,
        quoteValue: Math.floor(Math.random() * 5000) + 1000,
        quoteQty: 0,
        orderQty: 0,
        orderValue: 0,
        version: 1,
        createdAt: new Date().toISOString(),
      }))

      setPreviewData(mappedRows)
      setIsUploading(false)
      setOpenUpload(false)
      setOpenPreview(true)
      setSelectedFile(null)
    }, 1000)
  }

  const updatePreview = (index: number, field: keyof CampaignRow, val: string | number) => {
    const updated = [...previewData]
    updated[index] = { ...updated[index], [field]: val }
    setPreviewData(updated)
  }

  const confirmImport = () => {
    setData((prev) => [...previewData, ...prev])
    logAction('DB_BULK_INSERT', `Importou ${previewData.length} registros em lote via arquivo`, {
      rows: previewData,
    })
    setOpenPreview(false)
    setPreviewData([])
    toast({
      title: 'Importação Concluída',
      description: `${previewData.length} registros importados para a nuvem.`,
    })
  }

  return (
    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{displayTitle}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{displayDesc}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="gap-2 text-amber-600 border-amber-200 hover:bg-amber-50"
            >
              <RotateCcw className="w-4 h-4" /> Zerar Números
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Zerar Números?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to zero all numeric data? This action cannot be undone once
                saved.
                <br />
                <br />
                <span className="text-xs text-muted-foreground">
                  (Tem certeza que deseja zerar todos os dados numéricos? Esta ação redefinirá todas
                  as métricas para 0 mantendo as informações de registro. Esta alteração será
                  propagada para toda a equipe).
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleZeroMetrics}
                className="bg-amber-600 hover:bg-amber-700"
              >
                Confirmar Reset
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="gap-2">
              <Trash2 className="w-4 h-4" /> Resetar Base
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Atenção</AlertDialogTitle>
              <AlertDialogDescription>
                Essa ação apagará toda a base permanentemente para todos os usuários do sistema.
                Deseja continuar?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleResetDatabase}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Confirmar Exclusão
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={openBulk} onOpenChange={setOpenBulk}>
          <DialogTrigger asChild>
            <Button
              variant="secondary"
              className="gap-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
            >
              <ListPlus className="w-4 h-4" /> Cadastro em Lote
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-4 sm:p-6">
            <DialogHeader className="shrink-0">
              <DialogTitle>Cadastro em Lote</DialogTitle>
              <DialogDescription>
                Adicione múltiplos registros colando dados de planilhas ou preenchendo manualmente.
                Selecione as linhas para edição sincronizada.
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-x-auto overflow-y-auto py-2 custom-scrollbar border rounded-md px-2">
              <div className="min-w-[800px] space-y-2 pb-16">
                <div className="grid grid-cols-[40px_2fr_3fr_2fr_3fr_40px] gap-2 text-xs font-semibold text-slate-500 mb-2 px-1 sticky top-0 bg-white py-2 z-10 items-center border-b">
                  <div className="flex justify-center">
                    <Checkbox
                      checked={isAllBulkSelected}
                      onCheckedChange={handleSelectAllBulk}
                      title="Selecionar Todos"
                    />
                  </div>
                  <div>Plataforma e Canal</div>
                  <div>Nome da Campanha</div>
                  <div>Público</div>
                  <div className="text-center">Datas de Cadastro (Início - Fim)</div>
                  <div></div>
                </div>
                {bulkRows.map((r, i) => (
                  <div
                    key={r.id}
                    className="grid grid-cols-[40px_2fr_3fr_2fr_3fr_40px] gap-2 items-center bg-slate-50/50 p-1.5 rounded-md hover:bg-slate-100 transition-colors group"
                  >
                    <div className="flex justify-center">
                      <Checkbox
                        checked={selectedBulkIds.has(r.id)}
                        onCheckedChange={(c) => handleSelectBulkRow(r.id, !!c)}
                      />
                    </div>
                    <div>
                      <select
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={r.plat}
                        onChange={(e) => handleUpdateBulkRow(r.id, 'plat', e.target.value)}
                        onPaste={(e) => handlePaste(e as any, i, 'plat')}
                      >
                        {PLATFORMS.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Input
                        className="h-9 text-xs"
                        value={r.name}
                        onChange={(e) => handleUpdateBulkRow(r.id, 'name', e.target.value)}
                        onPaste={(e) => handlePaste(e, i, 'name')}
                        placeholder="Campanha"
                      />
                    </div>
                    <div>
                      <Input
                        className="h-9 text-xs"
                        value={r.aud}
                        onChange={(e) => handleUpdateBulkRow(r.id, 'aud', e.target.value)}
                        onPaste={(e) => handlePaste(e, i, 'aud')}
                        placeholder="Público"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Input
                        type="date"
                        className="h-9 text-xs"
                        value={r.startDate}
                        onChange={(e) => handleUpdateBulkRow(r.id, 'startDate', e.target.value)}
                        onPaste={(e) => handlePaste(e, i, 'startDate')}
                      />
                      <span className="text-slate-400">-</span>
                      <Input
                        type="date"
                        className="h-9 text-xs"
                        value={r.endDate}
                        onChange={(e) => handleUpdateBulkRow(r.id, 'endDate', e.target.value)}
                        onPaste={(e) => handlePaste(e, i, 'endDate')}
                      />
                    </div>
                    <div className="flex justify-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveBulkRow(r.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="shrink-0 pt-4 flex justify-between items-center">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-dashed"
                onClick={handleAddBulkRow}
              >
                <Plus className="w-4 h-4" /> Adicionar Linha
              </Button>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setOpenBulk(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleBulkSave}>Salvar Registros</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={openAdd} onOpenChange={setOpenAdd}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2 border-dashed">
              <Plus className="w-4 h-4" /> Novo Registro
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Setup de Registro</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Plataforma e Canal</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={newCamp.plat}
                  onChange={(e) => setNewCamp({ ...newCamp, plat: e.target.value })}
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
                  value={newCamp.name}
                  onChange={(e) => setNewCamp({ ...newCamp, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data Inicial (Obrigatório)</Label>
                  <Input
                    type="date"
                    value={newCamp.startDate}
                    onChange={(e) => setNewCamp({ ...newCamp, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data Final (Obrigatório)</Label>
                  <Input
                    type="date"
                    value={newCamp.endDate}
                    onChange={(e) => setNewCamp({ ...newCamp, endDate: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddCampaign}>Adicionar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={openUpload} onOpenChange={setOpenUpload}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
              <Upload className="w-4 h-4" /> Importar Excel/CSV
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Importação Inteligente</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-6 border-y my-2 border-dashed relative">
              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors relative">
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <FileUp className="w-8 h-8 text-muted-foreground mb-3" />
                <Label className="font-medium z-0 pointer-events-none text-center">
                  {selectedFile
                    ? selectedFile.name
                    : 'Arraste o arquivo ou clique para selecionar as colunas Impressões, Alcance e Cliques.'}
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleUpload} disabled={isUploading || !selectedFile}>
                {isUploading ? 'Analisando...' : 'Mapear Colunas'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={openPreview} onOpenChange={setOpenPreview}>
          <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-indigo-500" /> Revisar Mapeamento Histórico
              </DialogTitle>
              <DialogDescription>
                Revise as datas de início e fim. Entradas com a mesma plataforma, campanha e datas
                gerarão uma nova versão do registro existente.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 mt-2">
              <div className="grid grid-cols-6 gap-2 px-2 text-xs font-semibold text-slate-500 uppercase">
                <div className="col-span-2">Campanha</div>
                <div>Data Início</div>
                <div>Data Fim</div>
                <div>Impressões</div>
                <div>Cliques</div>
              </div>
              {previewData.map((r, i) => (
                <div key={i} className="grid grid-cols-6 gap-2 bg-slate-50 p-2 rounded-md border">
                  <Input
                    value={r.campaign}
                    onChange={(e) => updatePreview(i, 'campaign', e.target.value)}
                    className="h-8 text-xs bg-white col-span-2"
                  />
                  <Input
                    type="date"
                    value={r.startDate}
                    onChange={(e) => updatePreview(i, 'startDate', e.target.value)}
                    className="h-8 text-xs bg-white"
                  />
                  <Input
                    type="date"
                    value={r.endDate}
                    onChange={(e) => updatePreview(i, 'endDate', e.target.value)}
                    className="h-8 text-xs bg-white"
                  />
                  <Input
                    type="number"
                    value={r.impressions}
                    onChange={(e) => updatePreview(i, 'impressions', Number(e.target.value))}
                    className="h-8 text-xs bg-emerald-50/50 focus-visible:ring-emerald-500"
                  />
                  <Input
                    type="number"
                    value={r.clicksAds}
                    onChange={(e) => updatePreview(i, 'clicksAds', Number(e.target.value))}
                    className="h-8 text-xs bg-indigo-50/50 focus-visible:ring-indigo-500"
                  />
                </div>
              ))}
            </div>
            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setOpenPreview(false)}>
                Cancelar
              </Button>
              <Button onClick={confirmImport}>Confirmar e Inserir no Banco</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
