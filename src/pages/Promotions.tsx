import { useState } from 'react'
import { MOCK_PROMOTIONS } from '@/lib/mock-data'
import { formatDate } from '@/lib/format'
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
import { Plus, Edit, Trash2, Upload } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

export default function Promotions() {
  const [promotions, setPromotions] = useState(MOCK_PROMOTIONS)
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja arquivar esta promoção?')) {
      setPromotions(promotions.map((p) => (p.id === id ? { ...p, is_deleted: true } : p)))
      toast({ title: 'Promoção arquivada', description: 'Ação registrada no audit log.' })
    }
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setIsOpen(false)
    toast({ title: 'Promoção salva', description: 'A campanha foi configurada com sucesso.' })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif font-bold tracking-tight">Promoções</h2>
          <p className="text-muted-foreground">Configure campanhas e descontos sazonais.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nova Campanha
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Configurar Promoção</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label>Nome da Campanha</Label>
                  <Input required placeholder="Ex: Black Friday VIP" />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Descrição</Label>
                  <Textarea placeholder="Detalhes da campanha..." />
                </div>
                <div className="space-y-2">
                  <Label>Desconto (%)</Label>
                  <Input type="number" min="0" max="100" required placeholder="20" />
                </div>
                <div className="space-y-2">
                  <Label>Imagem (Drag & Drop)</Label>
                  <div className="border-2 border-dashed border-border rounded-md p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                    <Upload className="mx-auto h-6 w-6 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">
                      Arraste a imagem ou clique
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Data de Início</Label>
                  <Input type="date" required />
                </div>
                <div className="space-y-2">
                  <Label>Data de Término</Label>
                  <Input type="date" required />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Salvar Campanha</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Desconto</TableHead>
              <TableHead>Início</TableHead>
              <TableHead>Término</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {promotions
              .filter((p) => !p.is_deleted)
              .map((promo) => (
                <TableRow key={promo.id}>
                  <TableCell className="font-medium">{promo.name}</TableCell>
                  <TableCell>{promo.discount}%</TableCell>
                  <TableCell>{formatDate(promo.start_date)}</TableCell>
                  <TableCell>{formatDate(promo.end_date)}</TableCell>
                  <TableCell>
                    {promo.is_active ? (
                      <Badge variant="default" className="bg-secondary text-secondary-foreground">
                        Em Andamento
                      </Badge>
                    ) : (
                      <Badge variant="outline">Programada / Encerrada</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(promo.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
