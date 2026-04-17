import React from 'react'
import { useAppContext } from '@/context/AppContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ExternalLink, Plug, ShieldCheck } from 'lucide-react'

export default function Integrations() {
  const { manualConfig, updateManualConfig } = useAppContext()

  const handleUpdate = (key: string, link: string) => {
    const current = manualConfig[key]
    if (current && current.link !== link) {
      updateManualConfig(key, { ...current, link })
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in-up pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Integrações e Links</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Gerencie e versione as configurações de acesso e integrações ativas no sistema.
        </p>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-semibold text-emerald-900">Configurações Auditadas</h3>
          <p className="text-xs text-emerald-700 mt-1">
            Qualquer alteração realizada nas chaves de integração ou links é automaticamente
            registrada no Log de Atividades com versões "Antes" e "Depois".
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50/50 border-b">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plug className="w-5 h-5 text-primary" /> Links de Acesso Rápido
            </CardTitle>
            <CardDescription>
              Insira as URLs utilizadas para direcionamento nos painéis. Ao modificar, não esqueça
              de clicar fora do campo para salvar a versão histórica.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-5">
            {Object.entries(manualConfig).map(([key, conf]) => (
              <div key={key} className="space-y-2">
                <Label className="capitalize text-slate-700 font-semibold flex items-center gap-2">
                  {key === 'rdstation' ? 'RD Station' : key}
                </Label>
                <div className="flex gap-3">
                  <Input
                    defaultValue={conf.link}
                    onBlur={(e) => handleUpdate(key, e.target.value)}
                    className="flex-1 font-mono text-sm bg-slate-50 focus:bg-white transition-colors"
                    placeholder="https://"
                  />
                  <Button
                    variant="outline"
                    className="shrink-0 gap-2 w-32"
                    onClick={() => window.open(conf.link, '_blank')}
                    disabled={!conf.link}
                  >
                    <ExternalLink className="w-4 h-4" /> Acessar
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
