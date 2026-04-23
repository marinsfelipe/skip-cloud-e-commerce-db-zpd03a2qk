import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import pb from '@/lib/pocketbase/client'
import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Download, Trash, Archive, Eye, MailOpen } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function Leads() {
  const [leads, setLeads] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [filterRead, setFilterRead] = useState('all')
  const [selectedLead, setSelectedLead] = useState<any | null>(null)
  const { toast } = useToast()

  const loadLeads = async () => {
    try {
      let filter = 'is_archived=false'
      if (filterRead === 'read') filter += ' && is_read=true'
      if (filterRead === 'unread') filter += ' && is_read=false'

      if (search) {
        filter += ` && (name~'${search}' || email~'${search}' || subject~'${search}')`
      }

      const records = await pb.collection('contact_messages').getFullList({
        filter,
        sort: '-created',
      })
      setLeads(records)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadLeads()
  }, [search, filterRead])

  const handleAction = async (id: string, action: 'read' | 'archive' | 'delete') => {
    try {
      if (action === 'delete') {
        if (!confirm('Deseja realmente excluir?')) return
        await pb.collection('contact_messages').delete(id)
      } else if (action === 'archive') {
        await pb.collection('contact_messages').update(id, { is_archived: true })
      } else if (action === 'read') {
        await pb.collection('contact_messages').update(id, { is_read: true })
      }
      toast({ title: 'Ação realizada com sucesso' })
      loadLeads()
    } catch (e) {
      toast({ variant: 'destructive', title: 'Erro ao executar ação' })
    }
  }

  const handleExport = () => {
    const headers = [
      'Nome',
      'Email',
      'Telefone',
      'Assunto',
      'Mensagem',
      'Data',
      'Lida',
      'Arquivada',
    ]
    const csvContent = [
      headers.join(','),
      ...leads.map(
        (l) =>
          `"${l.name}","${l.email}","${l.phone}","${l.subject}","${l.message.replace(/"/g, '""')}","${l.created}","${l.is_read}","${l.is_archived}"`,
      ),
    ].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'leads.csv'
    link.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold">Mensagens / Leads</h2>
        <Button onClick={handleExport} variant="outline">
          <Download className="w-4 h-4 mr-2" /> Exportar CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtrar Mensagens</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou assunto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={filterRead} onValueChange={setFilterRead}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="unread">Não Lidas</SelectItem>
                <SelectItem value="read">Lidas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Assunto</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Nenhuma mensagem encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                leads.map((l) => (
                  <TableRow key={l.id} className={l.is_read ? 'opacity-75' : 'font-medium'}>
                    <TableCell>{format(new Date(l.created), 'dd/MM/yyyy HH:mm')}</TableCell>
                    <TableCell>{l.name}</TableCell>
                    <TableCell>{l.subject}</TableCell>
                    <TableCell>
                      <Badge variant={l.is_read ? 'secondary' : 'default'}>
                        {l.is_read ? 'Lida' : 'Nova'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedLead(l)
                          if (!l.is_read) handleAction(l.id, 'read')
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {!l.is_read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleAction(l.id, 'read')}
                        >
                          <MailOpen className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleAction(l.id, 'archive')}
                      >
                        <Archive className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleAction(l.id, 'delete')}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Mensagem de {selectedLead?.name}</DialogTitle>
            <DialogDescription>
              Enviada em{' '}
              {selectedLead && format(new Date(selectedLead.created), 'dd/MM/yyyy HH:mm')}
            </DialogDescription>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-muted-foreground">Email:</span>
                  <p>{selectedLead.email}</p>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground">Telefone:</span>
                  <p>{selectedLead.phone}</p>
                </div>
              </div>
              <div>
                <span className="font-semibold text-muted-foreground text-sm">Assunto:</span>
                <p className="font-medium">{selectedLead.subject}</p>
              </div>
              <div>
                <span className="font-semibold text-muted-foreground text-sm">Mensagem:</span>
                <div className="bg-muted p-4 rounded-md mt-1 whitespace-pre-wrap">
                  {selectedLead.message}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
