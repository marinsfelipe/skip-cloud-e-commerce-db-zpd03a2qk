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
import { Plus, Edit } from 'lucide-react'

export default function Promotions() {
  const [promotions] = useState(MOCK_PROMOTIONS)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif font-bold tracking-tight">Promoções</h2>
          <p className="text-muted-foreground">Configure campanhas e descontos sazonais.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Nova Campanha
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome da Campanha</TableHead>
              <TableHead>Desconto</TableHead>
              <TableHead>Início</TableHead>
              <TableHead>Término</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {promotions.map((promo) => (
              <TableRow key={promo.id}>
                <TableCell className="font-medium">{promo.name}</TableCell>
                <TableCell>{promo.discount}</TableCell>
                <TableCell>{formatDate(promo.start_date)}</TableCell>
                <TableCell>{formatDate(promo.end_date)}</TableCell>
                <TableCell>
                  {promo.is_active ? (
                    <Badge
                      variant="default"
                      className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    >
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
