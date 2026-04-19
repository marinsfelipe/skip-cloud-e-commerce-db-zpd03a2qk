import { useState } from 'react'
import { MOCK_PRODUCTS } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, Edit, Trash2, RotateCcw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function Products() {
  const [products, setProducts] = useState(MOCK_PRODUCTS)
  const [search, setSearch] = useState('')
  const { toast } = useToast()

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  )

  const toggleSoftDelete = (id: string, currentState: boolean) => {
    setProducts(products.map((p) => (p.id === id ? { ...p, is_deleted: !currentState } : p)))
    toast({
      title: !currentState ? 'Produto arquivado' : 'Produto restaurado',
      description: 'A alteração foi salva no banco de dados (Soft Delete).',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif font-bold tracking-tight">Catálogo de Produtos</h2>
          <p className="text-muted-foreground">Gerencie o portfólio de alta costura da Vittorio.</p>
        </div>
        <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
          <Plus className="mr-2 h-4 w-4" /> Novo Produto
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou linha..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome do Produto</TableHead>
              <TableHead>Linha</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Estoque</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id} className={product.is_deleted ? 'opacity-50' : ''}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.line}</TableCell>
                <TableCell>{formatCurrency(product.price)}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>
                  {product.is_deleted ? (
                    <Badge variant="destructive">Arquivado</Badge>
                  ) : (
                    <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                      Ativo
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" disabled={product.is_deleted}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleSoftDelete(product.id, product.is_deleted)}
                  >
                    {product.is_deleted ? (
                      <RotateCcw className="h-4 w-4 text-primary" />
                    ) : (
                      <Trash2 className="h-4 w-4 text-destructive" />
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredProducts.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhum produto encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
