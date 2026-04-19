import { MOCK_AUDIT_LOGS, MOCK_API_LOGS } from '@/lib/mock-data'
import { formatDate } from '@/lib/format'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default function Logs() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-serif font-bold tracking-tight">Logs de Sistema</h2>
        <p className="text-muted-foreground">
          Monitoramento de auditoria e tráfego da API Pública.
        </p>
      </div>

      <Tabs defaultValue="audit" className="w-full">
        <TabsList>
          <TabsTrigger value="audit">Auditoria (Ações de Usuários)</TabsTrigger>
          <TabsTrigger value="api">Requisições API Pública</TabsTrigger>
        </TabsList>

        <TabsContent value="audit" className="mt-6">
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Entidade</TableHead>
                  <TableHead className="text-right">Detalhes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_AUDIT_LOGS.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium whitespace-nowrap">
                      {formatDate(log.timestamp)}
                    </TableCell>
                    <TableCell>{log.user}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          log.action === 'SOFT_DELETE' ? 'text-destructive border-destructive' : ''
                        }
                      >
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>{log.entity}</TableCell>
                    <TableCell className="text-right">
                      <button className="text-secondary hover:underline text-sm font-medium">
                        Ver Diff
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="api" className="mt-6">
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Latência</TableHead>
                  <TableHead>IP Origem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_API_LOGS.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium whitespace-nowrap">
                      {formatDate(log.timestamp)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{log.method}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{log.endpoint}</TableCell>
                    <TableCell>
                      <Badge
                        variant={log.status === 200 ? 'default' : 'destructive'}
                        className={log.status === 200 ? 'bg-green-600' : ''}
                      >
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{log.latency}</TableCell>
                    <TableCell className="text-muted-foreground">{log.ip}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
