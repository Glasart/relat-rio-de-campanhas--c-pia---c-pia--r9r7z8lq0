import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  Image as ImageIcon,
  BookOpen,
  Layers,
  Target,
  Database,
  FileSpreadsheet,
  Globe,
  ExternalLink,
  Settings2,
  Upload,
} from 'lucide-react'
import { useAppContext } from '@/context/AppContext'
import { ManualSectionConfig } from '@/types'

const MANUAL_SECTIONS = [
  {
    id: 'facebook',
    title: 'Campanha Facebook',
    icon: Layers,
    mainSource: 'Meta Ads',
    complementarySources: 'RD Station e Planilha de vendas',
    description: 'Métricas originadas dos anúncios no Facebook e Instagram (Meta).',
    table: [
      { field: 'Alcance (Ads)', origin: 'Meta Ads' },
      { field: 'Cliques base Ads (Ads)', origin: 'Meta Ads' },
      { field: 'CTR (Ads)', origin: 'Meta Ads' },
      { field: 'Cliques base RD (RD Station)', origin: 'RD Station' },
      { field: 'Leads base planilha (Planilha de vendas)', origin: 'Planilha de vendas' },
      { field: 'Leads base RD (RD Station)', origin: 'RD Station' },
      { field: 'Orçamentos qtd + valor (Planilha de vendas)', origin: 'Planilha de vendas' },
      { field: 'Pedidos qtd + valor (Planilha de vendas)', origin: 'Planilha de vendas' },
    ],
  },
  {
    id: 'google',
    title: 'Campanha Google',
    icon: Target,
    mainSource: 'Google Ads',
    complementarySources: 'RD Station e Planilha de vendas',
    description: 'Métricas originadas das campanhas de pesquisa e display no Google.',
    table: [
      { field: 'Alcance (Ads)', origin: 'Google Ads' },
      { field: 'Cliques base Ads (Ads)', origin: 'Google Ads' },
      { field: 'CTR (Ads)', origin: 'Google Ads' },
      { field: 'Cliques base RD (RD Station)', origin: 'RD Station' },
      { field: 'Leads base planilha (Planilha de vendas)', origin: 'Planilha de vendas' },
      { field: 'Leads base RD (RD Station)', origin: 'RD Station' },
      { field: 'Orçamentos qtd + valor (Planilha de vendas)', origin: 'Planilha de vendas' },
      { field: 'Pedidos qtd + valor (Planilha de vendas)', origin: 'Planilha de vendas' },
    ],
  },
  {
    id: 'rdstation',
    title: 'RD Station',
    icon: Database,
    mainSource: 'RD Station',
    complementarySources: null,
    description: 'Dados extraídos diretamente da ferramenta de automação de marketing RD Station.',
    table: [
      { field: 'Cliques base RD', origin: 'RD Station' },
      { field: 'Leads base RD', origin: 'RD Station' },
      { field: 'CVL', origin: 'Calculado automaticamente' },
    ],
  },
  {
    id: 'planilha',
    title: 'Planilha de Vendas',
    icon: FileSpreadsheet,
    mainSource: 'Planilha de vendas',
    complementarySources: null,
    description: 'Dados qualitativos preenchidos pela equipe comercial na planilha de controle.',
    table: [
      { field: 'Leads', origin: 'Planilha de vendas' },
      { field: 'Orçamentos (qtd/valor)', origin: 'Planilha de vendas' },
      { field: 'Pedidos (qtd/valor)', origin: 'Planilha de vendas' },
    ],
  },
  {
    id: 'site',
    title: 'Acessos ao Site',
    icon: Globe,
    mainSource: 'Google Analytics',
    complementarySources: null,
    description: 'Volume de sessões e tráfego orgânico/pago medido no site institucional.',
    table: [{ field: 'Acessos ao site', origin: 'Google Analytics' }],
  },
]

function Highlight({ text, search }: { text: string; search: string }) {
  if (!search.trim()) return <>{text}</>
  const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = text.split(new RegExp(`(${escapedSearch})`, 'gi'))
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === search.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200 text-yellow-900 rounded-sm px-0.5 font-medium">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  )
}

export default function UserManual() {
  const { manualConfig, setManualConfig } = useAppContext()
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedTerm, setDebouncedTerm] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<ManualSectionConfig | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedTerm(searchTerm), 400)
    return () => clearTimeout(t)
  }, [searchTerm])

  const filteredSections = MANUAL_SECTIONS.filter((section) => {
    const term = debouncedTerm.toLowerCase()
    const matchesTitle = section.title.toLowerCase().includes(term)
    const matchesDescription = section.description.toLowerCase().includes(term)
    const matchesSource = section.mainSource.toLowerCase().includes(term)
    const matchesTable = section.table.some(
      (row) => row.field.toLowerCase().includes(term) || row.origin.toLowerCase().includes(term),
    )
    return matchesTitle || matchesDescription || matchesSource || matchesTable
  })

  useEffect(() => {
    if (debouncedTerm.trim().length > 1 && filteredSections.length > 0) {
      const firstId = filteredSections[0].id
      document.getElementById(firstId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [debouncedTerm, filteredSections.length])

  const handleOpenEdit = (id: string) => {
    setEditId(id)
    setEditForm(manualConfig[id])
  }

  const handleSaveEdit = () => {
    if (editId && editForm) {
      setManualConfig((prev) => ({ ...prev, [editId]: editForm }))
      setEditId(null)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      let type: 'image' | 'video' | 'pdf' = 'image'
      if (file.type.startsWith('video/')) type = 'video'
      else if (file.type === 'application/pdf') type = 'pdf'
      setEditForm((prev) => (prev ? { ...prev, mediaUrl: url, mediaType: type } : null))
    }
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-in-up pb-12">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start md:items-center sticky top-0 z-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" />
            Manual do Usuário
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Guia interativo sobre a origem e estrutura dos dados apresentados nos relatórios.
          </p>
        </div>
        <div className="relative w-full md:w-96 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Pesquisar por leads, Google, RD..."
            className="pl-9 h-11 bg-slate-50 border-slate-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-8">
        {filteredSections.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
            <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900">Nenhum resultado encontrado</h3>
            <p className="text-slate-500 text-sm mt-1">
              Tente buscar por termos diferentes ou verifique a ortografia.
            </p>
          </div>
        ) : (
          filteredSections.map((section) => {
            const config = manualConfig[section.id]
            return (
              <Card
                key={section.id}
                className="overflow-hidden border-slate-200 shadow-sm scroll-mt-24"
                id={section.id}
              >
                <CardHeader className="bg-slate-50/80 border-b pb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                      <section.icon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-slate-800">
                        <Highlight text={section.title} search={debouncedTerm} />
                      </CardTitle>
                      <CardDescription className="text-sm mt-1 font-medium text-slate-600">
                        Fonte Principal:{' '}
                        <span className="text-indigo-700">
                          <Highlight text={section.mainSource} search={debouncedTerm} />
                        </span>
                        {section.complementarySources && (
                          <span className="font-normal text-slate-500">
                            {' | Fontes Complementares: '}
                            <Highlight text={section.complementarySources} search={debouncedTerm} />
                          </span>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-slate-600 text-sm mb-5">
                    <Highlight text={section.description} search={debouncedTerm} />
                  </p>

                  <div className="flex gap-3 mb-8">
                    {config?.link && (
                      <Button asChild variant="default" className="gap-2 bg-indigo-600">
                        <a href={config.link} target="_blank" rel="noreferrer">
                          <ExternalLink className="w-4 h-4" /> Acessar Plataforma
                        </a>
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => handleOpenEdit(section.id)}
                      className="gap-2"
                    >
                      <Settings2 className="w-4 h-4" /> Configurar Seção
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-semibold text-slate-800 mb-3 text-sm flex items-center gap-2">
                        <Database className="w-4 h-4 text-slate-400" />
                        Mapeamento de Dados (Campo → Origem)
                      </h4>
                      <div className="border rounded-lg overflow-hidden bg-white">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-slate-50 hover:bg-slate-50">
                              <TableHead className="font-semibold text-slate-700">
                                Campo no Relatório
                              </TableHead>
                              <TableHead className="font-semibold text-slate-700">
                                Origem do Dado
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {section.table.map((row, idx) => (
                              <TableRow key={idx}>
                                <TableCell className="font-medium text-slate-700">
                                  <Highlight text={row.field} search={debouncedTerm} />
                                </TableCell>
                                <TableCell className="text-slate-600">
                                  <Highlight text={row.origin} search={debouncedTerm} />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <h4 className="font-semibold text-slate-800 mb-3 text-sm flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-slate-400" />
                        Mídia de Apoio
                      </h4>
                      <div className="flex-1 rounded-lg bg-slate-50/50 flex flex-col items-center justify-center text-slate-500 overflow-hidden relative group">
                        {!config?.mediaType || config.mediaType === 'none' || !config?.mediaUrl ? (
                          <div className="border-2 border-dashed border-slate-300 rounded-lg w-full h-full min-h-[200px] flex flex-col items-center justify-center hover:bg-slate-100 transition-colors">
                            <ImageIcon className="w-10 h-10 mb-3 text-slate-300" />
                            <span className="text-sm font-medium">Nenhuma mídia configurada</span>
                          </div>
                        ) : config.mediaType === 'image' ? (
                          <img
                            src={config.mediaUrl}
                            className="max-h-[400px] w-full object-contain rounded-lg border border-slate-200 bg-white"
                            alt="Mídia"
                          />
                        ) : config.mediaType === 'video' ? (
                          <video
                            src={config.mediaUrl}
                            controls
                            className="max-h-[400px] w-full rounded-lg border border-slate-200 bg-black"
                          />
                        ) : config.mediaType === 'pdf' ? (
                          <iframe
                            src={config.mediaUrl}
                            className="w-full h-[400px] rounded-lg border border-slate-200 bg-white"
                            title="PDF Viewer"
                          />
                        ) : null}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      <Dialog open={!!editId} onOpenChange={(open) => !open && setEditId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar Seção</DialogTitle>
          </DialogHeader>
          {editForm && (
            <div className="space-y-5 pt-4">
              <div className="space-y-2">
                <Label>Link de Acesso à Plataforma</Label>
                <Input
                  value={editForm.link}
                  onChange={(e) => setEditForm({ ...editForm, link: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo de Mídia de Apoio</Label>
                <Select
                  value={editForm.mediaType}
                  onValueChange={(val: any) => setEditForm({ ...editForm, mediaType: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">Imagem</SelectItem>
                    <SelectItem value="video">Vídeo</SelectItem>
                    <SelectItem value="pdf">Documento PDF</SelectItem>
                    <SelectItem value="none">Nenhum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {editForm.mediaType && editForm.mediaType !== 'none' && (
                <div className="space-y-2">
                  <Label>URL da Mídia (ou faça upload do arquivo)</Label>
                  <div className="flex gap-2">
                    <Input
                      value={editForm.mediaUrl}
                      onChange={(e) => setEditForm({ ...editForm, mediaUrl: e.target.value })}
                      placeholder="Cole um link externo..."
                    />
                    <Label className="cursor-pointer bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md px-4 flex items-center justify-center transition-colors">
                      <Upload className="w-4 h-4" />
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleFileUpload}
                        accept={
                          editForm.mediaType === 'image'
                            ? 'image/*'
                            : editForm.mediaType === 'video'
                              ? 'video/*'
                              : 'application/pdf'
                        }
                      />
                    </Label>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="mt-4">
            <Button onClick={handleSaveEdit}>Salvar Configurações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
