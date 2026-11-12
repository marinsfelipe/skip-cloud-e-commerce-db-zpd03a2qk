import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useSeo } from '@/hooks/use-seo'
import pb from '@/lib/pocketbase/client'
import { extractMainLengthMm } from '@/lib/measure-sort'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowDownAZ, ArrowUpAZ, ArrowDownUp, Search, X } from 'lucide-react'

// mesmas linhas exibidas na página /linhas
const LINES = [
  'Strongest',
  'Cucinare',
  'Fredda',
  'Aprezzo',
  'Speciale',
  'Visione',
  'Perfecto Gusto',
  'Ideale',
  'Progetto',
]

type SortOption = 'code-asc' | 'code-desc' | 'measure-asc' | 'measure-desc'

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'code-asc', label: 'Código (A → Z)' },
  { value: 'code-desc', label: 'Código (Z → A)' },
  { value: 'measure-asc', label: 'Medida (menor → maior)' },
  { value: 'measure-desc', label: 'Medida (maior → menor)' },
]

export default function Produtos() {
  useSeo(
    'Produtos',
    'Visualize o catálogo completo de equipamentos da Vittorio Design.',
    'catálogo vittorio design, equipamentos inox, produtos',
  )

  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState<any[]>([])
  const [selectedLine, setSelectedLine] = useState<string>(searchParams.get('linha') || '')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOption, setSortOption] = useState<SortOption>('code-asc')

  useEffect(() => {
    setSelectedLine(searchParams.get('linha') || '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  useEffect(() => {
    pb.collection('products')
      .getFullList({ filter: 'is_deleted=false', sort: '-created' })
      .then(async (res) => {
        const productsWithImages = await Promise.all(
          res.map(async (p) => {
            try {
              const images = await pb
                .collection('product_images')
                .getList(1, 1, { filter: `product="${p.id}"`, sort: 'sort_order' })
              if (images.items.length > 0) {
                p.firstImage = pb.files.getURL(images.items[0], images.items[0].image)
              }
            } catch {
              // fallback
            }
            return p
          }),
        )
        setProducts(productsWithImages)
      })
      .catch(console.error)
  }, [])

  const selectedLineIsValid = selectedLine && LINES.includes(selectedLine)

  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase()
    const filtered = products.filter((p) => {
      if (selectedLineIsValid && p.line !== selectedLine) return false
      if (term) {
        return p.name?.toLowerCase().includes(term) || p.code?.toLowerCase().includes(term)
      }
      return true
    })

    // comprimento principal em mm, calculado uma vez por produto (null = sem medida)
    const measureById = new Map<string, number | null>()
    for (const p of filtered) {
      measureById.set(p.id, extractMainLengthMm(p.details, p.specifications))
    }
    const byCode = (a: any, b: any) =>
      String(a.code ?? '').localeCompare(String(b.code ?? ''), 'pt-BR')

    const sorted = [...filtered]
    switch (sortOption) {
      case 'code-asc':
        sorted.sort(byCode)
        break
      case 'code-desc':
        sorted.sort((a, b) => byCode(b, a))
        break
      case 'measure-asc':
        // numérico pelo comprimento principal; produtos sem medida vão para o fim
        sorted.sort((a, b) => {
          const ma = measureById.get(a.id) ?? null
          const mb = measureById.get(b.id) ?? null
          if (ma == null && mb == null) return byCode(a, b)
          if (ma == null) return 1
          if (mb == null) return -1
          return ma - mb || byCode(a, b)
        })
        break
      case 'measure-desc':
        sorted.sort((a, b) => {
          const ma = measureById.get(a.id) ?? null
          const mb = measureById.get(b.id) ?? null
          if (ma == null && mb == null) return byCode(a, b)
          if (ma == null) return 1
          if (mb == null) return -1
          return mb - ma || byCode(a, b)
        })
        break
    }
    return sorted
  }, [products, selectedLineIsValid, selectedLine, searchTerm, sortOption])

  const handleSelectLine = (line: string) => {
    setSelectedLine(line)
    const next = new URLSearchParams(searchParams)
    if (line) {
      next.set('linha', line)
    } else {
      next.delete('linha')
    }
    setSearchParams(next, { replace: true })
  }

  const handleClearFilters = () => {
    setSelectedLine('')
    setSearchTerm('')
    setSearchParams({}, { replace: true })
  }

  const hasActiveFilters = Boolean(selectedLine || searchTerm)

  return (
    <div className="py-12 bg-background min-h-[calc(100vh-160px)] flex flex-col">
      <div className="container px-4 flex-1 flex flex-col">
        <div className="mb-10">
          <h1 className="text-4xl font-serif font-bold text-foreground">Nossos Produtos</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Explore nossa linha de equipamentos com especificações técnicas detalhadas.
          </p>
        </div>

        {/* Filtros: busca + linha */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou código..."
                className="pl-10 bg-card border-border"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              onClick={handleClearFilters}
              disabled={!hasActiveFilters}
              className="border-border text-foreground hover:bg-muted w-fit"
            >
              <X className="h-4 w-4 mr-2" />
              Limpar filtros
            </Button>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
              Filtrar por linha
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleSelectLine('')}
                className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
                  !selectedLine
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-muted-foreground border-border hover:border-primary/50'
                }`}
              >
                Todas as linhas
              </button>
              {LINES.map((line) => (
                <button
                  type="button"
                  key={line}
                  onClick={() => handleSelectLine(line)}
                  className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
                    selectedLine === line
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card text-muted-foreground border-border hover:border-primary/50'
                  }`}
                >
                  {line}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Ordenação */}
        <div className="mb-6 flex items-center gap-3">
          <span className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <ArrowDownUp className="h-3.5 w-3.5" />
            Ordenar por
          </span>
          <Select value={sortOption} onValueChange={(v) => setSortOption(v as SortOption)}>
            <SelectTrigger className="w-[220px] h-9 bg-card border-border text-foreground">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-sm text-foreground">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {products.length === 0 ? (
          <div className="flex-1 border border-border/50 rounded-2xl overflow-hidden bg-card/30 relative flex flex-col items-center justify-center p-8 min-h-[400px]">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
              <span className="font-serif text-3xl text-primary font-bold">V</span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-foreground mb-3 text-center">
              Carregando portfólio
            </h2>
            <p className="text-muted-foreground max-w-md text-center">
              Estamos preparando nosso material. Em breve todos os produtos estarão disponíveis.
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
            <h3 className="text-xl font-serif font-bold mb-2">Nenhum produto encontrado</h3>
            <p className="text-muted-foreground">
              {selectedLineIsValid
                ? `Nenhum produto na linha "${selectedLine}"${searchTerm ? ` para a busca "${searchTerm}"` : ''}.`
                : `Sua busca por "${searchTerm}" não retornou resultados.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-12">
            {filteredProducts.map((p) => (
              <Link key={p.id} to={`/produtos/${p.id}`} className="group h-full">
                <Card className="overflow-hidden hover:shadow-xl hover:border-primary/50 transition-all duration-300 h-full flex flex-col border-border/60 bg-card/50">
                  <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                    {p.firstImage ? (
                      <img
                        src={p.firstImage}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs uppercase tracking-widest bg-muted/50">
                        Sem imagem
                      </div>
                    )}
                  </div>
                  <CardHeader className="flex-1 p-5">
                    <Badge
                      variant="secondary"
                      className="w-fit mb-2 bg-background/80 backdrop-blur-md shadow-sm border-0 text-xs"
                    >
                      {p.line || 'Geral'}
                    </Badge>
                    <CardTitle className="text-lg font-serif mb-1 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                      {p.name}
                    </CardTitle>
                    <div className="text-sm font-mono text-muted-foreground/70 mt-auto pt-2 border-t border-border/50">
                      CÓD: {p.code}
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
