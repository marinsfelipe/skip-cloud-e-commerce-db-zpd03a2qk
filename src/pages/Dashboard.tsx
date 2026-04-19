import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Tag, FileText, Activity } from 'lucide-react'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { CHART_DATA, MOCK_AUDIT_LOGS } from '@/lib/mock-data'
import { formatDate } from '@/lib/format'

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-secondary">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Produtos Ativos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-serif">142</div>
            <p className="text-xs text-muted-foreground">+4 adicionados este mês</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Promoções Ativas</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-serif">3</div>
            <p className="text-xs text-muted-foreground">1 terminando em breve</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Posts Publicados</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-serif">24</div>
            <p className="text-xs text-muted-foreground">2 rascunhos pendentes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Req. API (24h)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-serif">8.4K</div>
            <p className="text-xs text-muted-foreground">Dentro do limite de taxa</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Tráfego da API Pública</CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            <ChartContainer
              config={{ requests: { label: 'Requisições', color: 'hsl(var(--secondary))' } }}
              className="h-[300px] w-full"
            >
              <LineChart data={CHART_DATA} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="requests"
                  stroke="var(--color-requests)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {MOCK_AUDIT_LOGS.map((log) => (
                <div key={log.id} className="flex items-center">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {log.user} realizou{' '}
                      <span className="font-bold text-secondary">{log.action}</span> em {log.entity}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(log.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
