import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search } from 'lucide-react'
import pb from '@/lib/pocketbase/client'

interface CopiarProdutoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (product: any) => void
}

/** Lista os produtos ativos já cadastrados para escolher um como modelo de cópia. */
export function CopiarProdutoDialog({ open, onOpenChange, onSelect }: CopiarProdutoDialogProps) {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!open) return
    setLoading(true)
    setError('')
    pb.collection('products')
      .getFullList({ filter: 'is_deleted=false', sort: 'name' })
      .then((records) => setProducts(records))
      .catch(() => setError('Não foi possível carregar os produtos cadastrados.'))
      .finally(() => setLoading(false))
  }, [open])

  const term = search.trim().toLowerCase()
  const filtered = products.filter(
    (p) =>
      !term ||
      String(p.name || '')
        .toLowerCase()
        .includes(term) ||
      String(p.code || '')
        .toLowerCase()
        .includes(term),
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif">Copiar de produto existente</DialogTitle>
          <DialogDescription>
            Escolha um produto. Os dados dele serão preenchidos no formulário; nome e código
            precisam ser ajustados.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou código..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="max-h-[55vh] overflow-y-auto rounded-md border divide-y">
          {loading && <p className="p-4 text-sm text-muted-foreground">Carregando produtos...</p>}
          {error && <p className="p-4 text-sm text-destructive">{error}</p>}
          {!loading && !error && filtered.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">Nenhum produto encontrado.</p>
          )}
          {!loading &&
            !error &&
            filtered.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelect(p)}
                className="w-full flex items-center justify-between gap-4 px-4 py-3 text-left hover:bg-muted/50 transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-medium truncate">{p.name}</p>
                  <p className="text-xs font-mono text-muted-foreground">{p.code}</p>
                </div>
                {p.line && <Badge variant="secondary">{p.line}</Badge>}
              </button>
            ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
