import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { FunnelChart, Funnel, LabelList } from 'recharts'

export function FunnelChartCard({ funnelData }: { funnelData: any[] }) {
  const funnelConfig = {
    Alcance: { label: 'Alcance', color: '#8b5cf6' },
    Impressões: { label: 'Impressões', color: '#3b82f6' },
    Cliques: { label: 'Cliques', color: '#0ea5e9' },
    Leads: { label: 'Leads', color: '#10b981' },
    Orçamento: { label: 'Orçamento', color: '#f59e0b' },
    Pedidos: { label: 'Pedidos', color: '#ef4444' },
  }

  return (
    <Card className="shadow-lg border-0 bg-white ring-1 ring-blue-100 w-full rounded-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 pb-5">
        <CardTitle className="text-2xl text-blue-900 text-center font-bold tracking-tight">
          Funil de Performance Global
        </CardTitle>
        <CardDescription className="text-center text-blue-700 font-medium">
          Visualização macro da jornada do usuário neste mês.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-8 h-[550px] flex items-center justify-center bg-white/50">
        <ChartContainer
          config={funnelConfig}
          className="w-full h-full max-w-5xl !aspect-auto min-h-[450px]"
        >
          <FunnelChart>
            <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: 'transparent' }} />
            <Funnel dataKey="value" data={funnelData} isAnimationActive>
              <LabelList
                position="right"
                fill="#1e293b"
                stroke="none"
                dataKey="name"
                fontSize={15}
                fontWeight={700}
              />
            </Funnel>
          </FunnelChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
