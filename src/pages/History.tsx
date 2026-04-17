import { useAppContext } from '@/context/AppContext'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, FileSpreadsheet, Calendar, Tag, HardDrive } from 'lucide-react'

export default function History() {
  const { analyses } = useAppContext()

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in-up pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Histórico de Relatórios
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Acesse a base permanente e imutável de análises e decisões passadas.
        </p>
      </div>

      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex items-start gap-3">
        <HardDrive className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-semibold text-indigo-900">Base Histórica Protegida</h3>
          <p className="text-xs text-indigo-700 mt-1">
            Os relatórios desta seção não podem ser apagados ou modificados. Eles compõem a base
            oficial de conhecimento da empresa, garantindo a integridade e rastreabilidade total das
            decisões ao longo do tempo.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {analyses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
            <p className="text-slate-500 text-sm">Nenhum relatório salvo no histórico.</p>
          </div>
        ) : (
          analyses.map((a) => (
            <Card
              key={a.id}
              className="hover:shadow-md transition-shadow border-slate-200 overflow-hidden relative"
            >
              {/* Indicator of permanent record */}
              <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold py-1 px-8 transform translate-x-6 translate-y-3 rotate-45 shadow-sm uppercase tracking-wider">
                  Auditado
                </div>
              </div>

              <CardHeader className="pb-3 border-b bg-slate-50/80">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                      <Calendar className="w-5 h-5 text-primary" />
                      Análise: {a.dateRangeStr}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-3 mt-2 text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5" />
                        Plataformas: {a.platforms?.join(', ') || 'Todas'}
                      </span>
                      {a.author && (
                        <span className="flex items-center gap-1.5 border-l pl-3 border-slate-300">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: a.author.color }}
                          ></span>
                          {a.author.name}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2 relative z-10">
                    {a.pdfUrl && a.pdfUrl !== '#' && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="gap-2 border-red-200 hover:bg-red-50 hover:text-red-700"
                      >
                        <a
                          href={a.pdfUrl}
                          download={`Analise_${a.dateRangeStr.replace(/\//g, '-')}.pdf`}
                        >
                          <FileText className="w-4 h-4 text-red-500" /> PDF
                        </a>
                      </Button>
                    )}
                    {a.excelUrl && a.excelUrl !== '#' && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="gap-2 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        <a
                          href={a.excelUrl}
                          download={`Analise_${a.dateRangeStr.replace(/\//g, '-')}.xlsx`}
                        >
                          <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> Excel
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-5 text-sm text-slate-600">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-emerald-50/40 p-3.5 rounded-lg border border-emerald-100">
                    <strong className="text-emerald-800 block mb-1.5 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> O que
                      melhorou
                    </strong>
                    <p className="line-clamp-4 text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {a.improved || 'Não preenchido.'}
                    </p>
                  </div>
                  <div className="bg-red-50/40 p-3.5 rounded-lg border border-red-100">
                    <strong className="text-red-800 block mb-1.5 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> O que piorou
                    </strong>
                    <p className="line-clamp-4 text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {a.worsened || 'Não preenchido.'}
                    </p>
                  </div>
                  <div className="bg-blue-50/40 p-3.5 rounded-lg border border-blue-100">
                    <strong className="text-blue-800 block mb-1.5 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Decisões
                      Tomadas
                    </strong>
                    <p className="line-clamp-4 text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {a.decisions || 'Não preenchido.'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
