import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Tag, FileText, Activity, ImageIcon, MousePointerClick, Eye } from 'lucide-react'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Line, LineChart, Bar, BarChart, XAxis, YAxis, CartesianGrid } from 'recharts'
import { CHART_DATA, MOCK_AUDIT_LOGS } from '@/lib/mock-data'
import { formatDate } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import pb from '@/lib/pocketbase/client'

export default function Dashboard() {
  const [stats, setStats] = useState({
    products: 0,
    promotions: 0,
    posts: 0,
    images: 0,
    catalog: 'Carregando',
  })

  const [analytics, setAnalytics] = useState<{
    totalViews: number
    totalClicks: number
    topPages: { path: string; count: number }[]
    topElements: { label: string; count: number }[]
    chartData: { date: string; views: number; clicks: number }[]
    loading: boolean
  }>({
    totalViews: 0,
    totalClicks: 0,
    topPages: [],
    topElements: [],
    chartData: [],
    loading: true,
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setStats({
        products: 142,
        promotions: 3,
        posts: 24,
        images: 850,
        catalog: 'V2 (24.5MB)',
      })
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [viewsRes, clicksRes, recentRecords] = await Promise.all([
          pb.collection('site_analytics').getList(1, 1, { filter: "event_type='page_view'" }),
          pb.collection('site_analytics').getList(1, 1, { filter: "event_type='click'" }),
          pb.collection('site_analytics').getList(1, 1000, { sort: '-created' }),
        ])

        const items = recentRecords.items

        const pagesMap = new Map<string, number>()
        const elementsMap = new Map<string, number>()
        const dateMap = new Map<string, { views: number; clicks: number }>()

        for (let i = 6; i >= 0; i--) {
          const d = new Date()
          d.setDate(d.getDate() - i)
          const dateStr = d.toISOString().split('T')[0]
          dateMap.set(dateStr, { views: 0, clicks: 0 })
        }

        items.forEach((item) => {
          const dateStr = item.created.split(' ')[0]
          if (dateMap.has(dateStr)) {
            const current = dateMap.get(dateStr)!
            if (item.event_type === 'page_view') current.views++
            if (item.event_type === 'click') current.clicks++
          }

          if (item.event_type === 'page_view' && item.path) {
            pagesMap.set(item.path, (pagesMap.get(item.path) || 0) + 1)
          }
          if (item.event_type === 'click' && item.element_label) {
            elementsMap.set(item.element_label, (elementsMap.get(item.element_label) || 0) + 1)
          }
        })

        const topPages = Array.from(pagesMap.entries())
          .map(([path, count]) => ({ path, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10)

        const topElements = Array.from(elementsMap.entries())
          .map(([label, count]) => ({ label, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10)

        const chartData = Array.from(dateMap.entries())
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([date, st]) => ({
            date: date.split('-').slice(1).join('/'),
            views: st.views,
            clicks: st.clicks,
          }))

        setAnalytics({
          totalViews: viewsRes.totalItems,
          totalClicks: clicksRes.totalItems,
          topPages,
          topElements,
          chartData,
          loading: false,
        })
      } catch (err) {
        console.error('Failed to fetch analytics', err)
        setAnalytics((prev) => ({ ...prev, loading: false }))
      }
    }

    fetchAnalytics()
  }, [])

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <Button asChild>
          <Link to="/cms/linhas">
            <ImageIcon className="mr-2 h-4 w-4" />
            Gerenciar CMS Linhas
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card className="border-l-4 border-l-secondary">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Produtos Ativos</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-serif">{stats.products}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Promoções</CardTitle>
                <Tag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-serif">{stats.promotions}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Posts Blog</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-serif">{stats.posts}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Imagens</CardTitle>
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-serif">{stats.images}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Catálogo PDF</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-serif">{stats.catalog}</div>
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
                    <ChartTooltip
                      content={(() => {
                        const C = ChartTooltipContent as any
                        return <C />
                      })()}
                    />
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
                          <span className="font-bold text-secondary">{log.action}</span> em{' '}
                          {log.entity}
                        </p>
                        <p className="text-xs text-muted-foreground">{formatDate(log.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-8 animate-in fade-in-50">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Visualizações de Página</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-serif">
                  {analytics.loading ? '-' : analytics.totalViews.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Total de page views rastreados</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Interações (Cliques)</CardTitle>
                <MousePointerClick className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-serif">
                  {analytics.loading ? '-' : analytics.totalClicks.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total de cliques em elementos interativos
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tráfego e Interações (Últimos 7 dias)</CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.loading ? (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Carregando dados...
                </div>
              ) : (
                <ChartContainer
                  config={{
                    views: { label: 'Visualizações', color: 'hsl(var(--primary))' },
                    clicks: { label: 'Cliques', color: 'hsl(var(--secondary))' },
                  }}
                  className="h-[300px] w-full"
                >
                  <BarChart
                    data={analytics.chartData}
                    margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <ChartTooltip
                      content={(() => {
                        const C = ChartTooltipContent as any
                        return <C />
                      })()}
                    />
                    <Bar dataKey="views" fill="var(--color-views)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="clicks" fill="var(--color-clicks)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Páginas Mais Populares</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.loading ? (
                  <div className="py-8 text-center text-muted-foreground">Carregando...</div>
                ) : analytics.topPages.length > 0 ? (
                  <div className="space-y-4">
                    {analytics.topPages.map((page, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span
                          className="text-sm truncate pr-4 max-w-[250px] font-medium"
                          title={page.path}
                        >
                          {page.path}
                        </span>
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {page.count} {page.count === 1 ? 'view' : 'views'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    Sem dados suficientes.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Elementos Mais Clicados</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.loading ? (
                  <div className="py-8 text-center text-muted-foreground">Carregando...</div>
                ) : analytics.topElements.length > 0 ? (
                  <div className="space-y-4">
                    {analytics.topElements.map((el, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span
                          className="text-sm truncate pr-4 max-w-[250px] font-medium"
                          title={el.label}
                        >
                          {el.label}
                        </span>
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {el.count} {el.count === 1 ? 'clique' : 'cliques'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    Sem dados suficientes.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
