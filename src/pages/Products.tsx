import { useState } from 'react'
import { MOCK_PRODUCTS } from '@/lib/mock-data'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Plus, Trash2, RotateCcw, Upload } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const LINES = [
  'Todas',
  'Strongest',
  'Speciale',
  'Aprezzo',
  'Fredda',
  'Cucinare',
  'Visione',
  'Perfecto Gusto',
  'Ideale',
  'Progetto',
]

export default function Products() {
  const [products, setProducts] = useState(MOCK_PRODUCTS)
  const [search, setSearch] = useState('')
  const [lineFilter, setLineFilter] = useState('Todas')
  const [isAdding, setIsAdding] = useState(false)
  const { toast } = useToast()

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase())
    const matchesLine = lineFilter === 'Todas' || p.line === lineFilter
    return matchesSearch && matchesLine
  })

  const toggleSoftDelete = (id: string, currentState: boolean) => {
    if (!currentState && !confirm('Tem certeza que deseja arquivar este produto?')) return
    setProducts(products.map((p) => (p.id === id ? { ...p, is_deleted: !currentState } : p)))
    toast({
      title: !currentState ? 'Produto arquivado' : 'Produto restaurado',
      description: 'A alteração foi salva no banco de dados (Soft Delete).',
    })
  }

  const handleInlineEdit = (id: string, field: 'price' | 'stock', value: string) => {
    const numValue = Number(value)
    if (isNaN(numValue)) return
    setProducts(products.map((p) => (p.id === id ? { ...p, [field]: numValue } : p)))
  }

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault()
    setIsAdding(false)
    toast({
      title: 'Produto cadastrado',
      description: 'Código gerado automaticamente: VD.EX.VTR.004.00',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif font-bold tracking-tight">Catálogo de Produtos</h2>
          <p className="text-muted-foreground">Gerencie o portfólio de alta costura da Vittorio.</p>
        </div>
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
              <Plus className="mr-2 h-4 w-4" /> Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Produto</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome do Produto</Label>
                  <Input required placeholder="Forno Inox Pro" />
                </div>
                <div className="space-y-2">
                  <Label>Linha</Label>
                  <Select required defaultValue="Speciale">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LINES.filter((l) => l !== 'Todas').map((l) => (
                        <SelectItem key={l} value={l}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Preço (R$)</Label>
                  <Input type="number" required placeholder="15000" />
                </div>
                <div className="space-y-2">
                  <Label>Estoque</Label>
                  <Input type="number" required placeholder="10" />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Especificações (JSON)</Label>
                  <Textarea
                    className="font-mono text-xs"
                    placeholder='{"voltagem": "220V", "material": "Inox"}'
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Imagens (Arraste para reordenar)</Label>
                  <div className="border-2 border-dashed border-border rounded-md p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors flex flex-col items-center">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm font-medium">Solte as imagens aqui</span>
                    <span className="text-xs text-muted-foreground">
                      Múltiplos arquivos suportados
                    </span>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Cadastrar Produto</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou código..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={lineFilter} onValueChange={setLineFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por Linha" />
          </SelectTrigger>
          <SelectContent>
            {LINES.map((line) => (
              <SelectItem key={line} value={line}>
                {line}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Linha</TableHead>
              <TableHead className="w-[120px]">Preço</TableHead>
              <TableHead className="w-[100px]">Estoque</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id} className={product.is_deleted ? 'opacity-50' : ''}>
                <TableCell className="font-mono text-xs font-semibold">{product.code}</TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.line}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    className="h-8 text-xs w-24 bg-transparent border-transparent hover:border-border focus:border-border"
                    defaultValue={product.price}
                    onBlur={(e) => handleInlineEdit(product.id, 'price', e.target.value)}
                    disabled={product.is_deleted}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    className="h-8 text-xs w-20 bg-transparent border-transparent hover:border-border focus:border-border"
                    defaultValue={product.stock}
                    onBlur={(e) => handleInlineEdit(product.id, 'stock', e.target.value)}
                    disabled={product.is_deleted}
                  />
                </TableCell>
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
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
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
