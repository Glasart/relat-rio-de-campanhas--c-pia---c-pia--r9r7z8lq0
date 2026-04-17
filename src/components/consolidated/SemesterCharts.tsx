import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

export function SemesterCharts({ semesterData }: { semesterData: any[] }) {
  const chartConfig = {
    meta: { label: 'Ecossistema Meta', color: '#3b82f6' }, // Vibrant Blue
    google: { label: 'Ecossistema Google', color: '#10b981' }, // Vibrant Emerald
    other: { label: 'Demais Canais', color: '#f59e0b' }, // Vibrant Amber
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-sm border-0 ring-1 ring-slate-200">
          <CardHeader className="pb-2 bg-slate-50/50">
            <CardTitle className="text-sm font-bold text-center text-slate-700 uppercase tracking-wider">
              CTR (%) - Taxa de Clique
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[280px] pt-4">
            <ChartContainer config={chartConfig} className="w-full h-full !aspect-auto">
              <BarChart data={semesterData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={11}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
                <ChartTooltip
                  cursor={{ fill: '#f1f5f9' }}
                  content={<ChartTooltipContent indicator="dashed" />}
                />
                <Bar dataKey="metaCTR" fill="var(--color-meta)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="googleCTR" fill="var(--color-google)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="otherCTR" fill="var(--color-other)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-0 ring-1 ring-slate-200">
          <CardHeader className="pb-2 bg-slate-50/50">
            <CardTitle className="text-sm font-bold text-center text-slate-700 uppercase tracking-wider">
              CVL (%) - Conversão de Lead
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[280px] pt-4">
            <ChartContainer config={chartConfig} className="w-full h-full !aspect-auto">
              <BarChart data={semesterData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={11}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
                <ChartTooltip
                  cursor={{ fill: '#f1f5f9' }}
                  content={<ChartTooltipContent indicator="dashed" />}
                />
                <Bar dataKey="metaCVL" fill="var(--color-meta)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="googleCVL" fill="var(--color-google)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="otherCVL" fill="var(--color-other)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-0 ring-1 ring-slate-200">
          <CardHeader className="pb-2 bg-slate-50/50">
            <CardTitle className="text-sm font-bold text-center text-slate-700 uppercase tracking-wider">
              CPA (R$) - Custo por Pedido
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[280px] pt-4">
            <ChartContainer config={chartConfig} className="w-full h-full !aspect-auto">
              <BarChart data={semesterData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={11}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
                <ChartTooltip
                  cursor={{ fill: '#f1f5f9' }}
                  content={<ChartTooltipContent indicator="dashed" />}
                />
                <Bar dataKey="metaCPO" fill="var(--color-meta)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="googleCPO" fill="var(--color-google)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="otherCPO" fill="var(--color-other)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center pb-8">
        <ChartContainer
          config={chartConfig}
          className="w-full max-w-lg flex justify-center !aspect-auto h-8"
        >
          <ChartLegend content={<ChartLegendContent />} />
        </ChartContainer>
      </div>
    </div>
  )
}
