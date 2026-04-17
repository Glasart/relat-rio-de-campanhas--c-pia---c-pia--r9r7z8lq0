import { useAppContext } from '@/context/AppContext'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Undo2, Clock, Globe } from 'lucide-react'

export default function ActivityLog() {
  const { activityLog, undoAction } = useAppContext()

  const grouped = activityLog.reduce(
    (acc, entry) => {
      const uName = entry.userName || 'Sistema'
      if (!acc[uName]) {
        acc[uName] = { color: entry.userColor || '#cbd5e1', entries: [] }
      }
      acc[uName].entries.push(entry)
      return acc
    },
    {} as Record<string, { color: string; entries: typeof activityLog }>,
  )

  const renderPayloadDetails = (payload: any) => {
    if (!payload) return null

    // Before vs After for edits/updates
    if (payload.prev && payload.next) {
      const prevDiff: any = {}
      const nextDiff: any = {}
      let hasChanges = false

      Object.keys(payload.next).forEach((k) => {
        if (k !== 'id' && JSON.stringify(payload.prev[k]) !== JSON.stringify(payload.next[k])) {
          prevDiff[k] = payload.prev[k]
          nextDiff[k] = payload.next[k]
          hasChanges = true
        }
      })

      if (!hasChanges) return null

      return (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
          <div className="bg-rose-50/50 p-3.5 rounded-lg border border-rose-100 shadow-sm">
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Antes (Versão Antiga)
            </span>
            <div className="space-y-2">
              {Object.entries(prevDiff).map(([k, v]) => (
                <div key={k} className="flex flex-col text-xs bg-white/50 p-1.5 rounded">
                  <span className="text-rose-900/60 font-semibold uppercase text-[10px] tracking-wide">
                    {k}:
                  </span>
                  <span className="text-rose-900 font-mono mt-0.5 break-all">
                    {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-emerald-50/50 p-3.5 rounded-lg border border-emerald-100 shadow-sm">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Depois (Nova Versão)
            </span>
            <div className="space-y-2">
              {Object.entries(nextDiff).map(([k, v]) => (
                <div key={k} className="flex flex-col text-xs bg-white/50 p-1.5 rounded">
                  <span className="text-emerald-900/60 font-semibold uppercase text-[10px] tracking-wide">
                    {k}:
                  </span>
                  <span className="text-emerald-900 font-mono font-medium mt-0.5 break-all">
                    {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    }

    // Insertions / Single Row affected
    if (payload.row || payload.newId) {
      const rowData = payload.row || { id: payload.newId }
      return (
        <div className="mt-4 bg-slate-50 p-3.5 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">
            Dados Inseridos/Afetados
          </span>
          <pre className="text-[11px] text-slate-700 font-mono overflow-auto max-h-40 bg-white p-2 rounded border border-slate-100">
            {JSON.stringify(rowData, null, 2)}
          </pre>
        </div>
      )
    }

    // Bulk actions
    if (payload.rows) {
      return (
        <div className="mt-4 bg-slate-50 p-3.5 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Itens Afetados</span>
            <span className="bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded text-[10px]">
              Total: {payload.rows.length}
            </span>
          </span>
          <div className="text-xs text-slate-700 max-h-32 overflow-auto space-y-1 bg-white p-2 rounded border border-slate-100">
            {payload.rows.map((r: any, i: number) => (
              <div
                key={i}
                className="py-1 border-b border-slate-50 last:border-0 truncate font-mono text-[11px]"
              >
                {r.campaign || r.name || r.id || r}
              </div>
            ))}
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in-up pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Log de Atividades</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Auditoria global: histórico sincronizado de todas as ações dos usuários no sistema.
          </p>
        </div>
        <div className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-full flex items-center gap-2 text-sm font-medium shadow-sm">
          <Globe className="w-4 h-4" />
          <span>Sincronizado em tempo real</span>
        </div>
      </div>

      <div className="space-y-8">
        {Object.entries(grouped).map(([userName, data]) => (
          <Card key={userName} className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b py-3 px-4 flex flex-row items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm"
                style={{ backgroundColor: data.color }}
              >
                {userName.charAt(0).toUpperCase()}
              </div>
              <CardTitle className="text-lg text-slate-800">{userName}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {data.entries.map((entry) => (
                  <div
                    key={entry.id}
                    className={`p-5 flex flex-col gap-4 transition-colors hover:bg-slate-50/30 ${entry.reverted ? 'bg-slate-50 opacity-60' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-4 w-full">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-1 flex-shrink-0 text-slate-400 bg-slate-100 p-1.5 rounded-full">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 uppercase tracking-wider">
                              {entry.type.replace(/_/g, ' ')}
                            </span>
                            <p
                              className={`text-sm font-medium ${entry.reverted ? 'text-slate-500 line-through' : 'text-slate-900'}`}
                            >
                              {entry.description}
                            </p>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1.5 font-medium">
                            {format(
                              new Date(entry.timestamp),
                              "dd 'de' MMMM 'de' yyyy, 'às' HH:mm:ss",
                              {
                                locale: ptBR,
                              },
                            )}
                          </p>

                          {!entry.reverted && renderPayloadDetails(entry.payload)}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {entry.type !== 'UNDO' &&
                          entry.type !== 'LOGIN' &&
                          entry.type !== 'LOGOUT' &&
                          entry.type !== 'CLOUD_SYNC' &&
                          !entry.reverted && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => undoAction(entry.id)}
                              className="gap-2 text-slate-600 hover:text-slate-900"
                            >
                              <Undo2 className="w-3.5 h-3.5" />
                              Desfazer Ação
                            </Button>
                          )}
                        {entry.reverted && (
                          <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded border border-amber-200">
                            Ação Desfeita
                          </span>
                        )}
                        {entry.type === 'UNDO' && (
                          <span className="text-xs font-bold text-slate-600 bg-slate-200 px-2.5 py-1 rounded border border-slate-300">
                            Reversão de Histórico
                          </span>
                        )}
                        {entry.type === 'CLOUD_SYNC' && (
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded border border-emerald-200 flex items-center gap-1">
                            <Globe className="w-3 h-3" /> Nuvem
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
        {activityLog.length === 0 && (
          <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-slate-500 text-sm">Nenhuma atividade registrada no momento.</p>
          </div>
        )}
      </div>
    </div>
  )
}
