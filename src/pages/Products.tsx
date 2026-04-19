import { useState, useEffect } from 'react'
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
import { Search, Plus, Trash2, RotateCcw, X } from 'lucide-react'
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
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'

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
  const [products, setProducts] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [lineFilter, setLineFilter] = useState('Todas')
  const [isAdding, setIsAdding] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<{ id: string; file: File; url: string }[]>([])
  const { toast } = useToast()

  const loadProducts = async () => {
    try {
      const records = await pb.collection('products').getFullList({ sort: '-created' })
      setProducts(records)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])
  useRealtime('products', loadProducts)

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase())
    const matchesLine = lineFilter === 'Todas' || p.line === lineFilter
    return matchesSearch && matchesLine
  })

  const toggleSoftDelete = async (id: string, currentState: boolean) => {
    if (!currentState && !confirm('Tem certeza que deseja arquivar este produto?')) return
    await pb.collection('products').update(id, { is_deleted: !currentState })
    toast({
      title: !currentState ? 'Produto arquivado' : 'Produto restaurado',
    })
  }

  const handleInlineEdit = async (id: string, field: 'price' | 'stock', value: string) => {
    const numValue = Number(value)
    if (isNaN(numValue)) return
    await pb.collection('products').update(id, { [field]: numValue })
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((f) => ({
        id: Math.random().toString(36).substring(7),
        file: f,
        url: URL.createObjectURL(f),
      }))
      setSelectedFiles((prev) => [...prev, ...newFiles])
    }
  }

  const handleRemoveFile = (id: string) => {
    setSelectedFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    try {
      const pData = {
        name: formData.get('name') as string,
        code: formData.get('code') as string,
        line: formData.get('line') as string,
        price: Number(formData.get('price')),
        stock: Number(formData.get('stock')),
        specifications: formData.get('specifications')
          ? JSON.parse(formData.get('specifications') as string)
          : {},
        is_deleted: false,
      }

      const record = await pb.collection('products').create(pData)

      for (let i = 0; i < selectedFiles.length; i++) {
        const fData = new FormData()
        fData.append('product', record.id)
        fData.append('image', selectedFiles[i].file)
        fData.append('sort_order', i.toString())
        await pb.collection('product_images').create(fData)
      }

      toast({ title: 'Produto cadastrado' })
      setIsAdding(false)
      setSelectedFiles([])
      form.reset()
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erro ao salvar' })
    }
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
                  <Input name="name" required placeholder="Forno Inox Pro" />
                </div>
                <div className="space-y-2">
                  <Label>Código</Label>
                  <Input name="code" required placeholder="VD.EX.001" />
                </div>
                <div className="space-y-2">
                  <Label>Linha</Label>
                  <Select required name="line" defaultValue="Speciale">
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
                  <Input name="price" type="number" required placeholder="15000" />
                </div>
                <div className="space-y-2">
                  <Label>Estoque</Label>
                  <Input name="stock" type="number" required placeholder="10" />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Especificações (JSON Opcional)</Label>
                  <Textarea
                    name="specifications"
                    className="font-mono text-xs"
                    placeholder='{"voltagem": "220V", "material": "Inox"}'
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Imagens do Produto (Ordem de Seleção)</Label>
                  <div className="border-2 border-dashed border-border rounded-md p-4 bg-muted/30">
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg, image/png, image/webp"
                      onChange={handleFileSelect}
                      className="mb-4 block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    />
                    {selectedFiles.length > 0 && (
                      <div className="flex gap-2 flex-wrap mt-4">
                        {selectedFiles.map((f) => (
                          <div
                            key={f.id}
                            className="relative w-20 h-20 rounded border bg-background"
                          >
                            <img
                              src={f.url}
                              className="w-full h-full object-cover rounded"
                              alt="preview"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute -top-2 -right-2 h-5 w-5 rounded-full"
                              onClick={() => handleRemoveFile(f.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
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
