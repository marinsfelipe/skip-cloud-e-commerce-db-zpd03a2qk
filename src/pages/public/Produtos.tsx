import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSeo } from '@/hooks/use-seo'
import pb from '@/lib/pocketbase/client'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export default function Produtos() {
  useSeo(
    'Produtos',
    'Visualize o catálogo completo de equipamentos da Vittorio Design.',
    'catálogo vittorio design, equipamentos inox, produtos',
  )

  const [products, setProducts] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')

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

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.line?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="py-12 bg-background min-h-[calc(100vh-160px)] flex flex-col">
      <div className="container px-4 flex-1 flex flex-col">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-serif font-bold text-foreground">Nossos Produtos</h1>
            <p className="text-lg text-muted-foreground mt-2">
              Explore nossa linha de equipamentos com especificações técnicas detalhadas.
            </p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produtos ou linhas..."
              className="pl-10 bg-card border-border"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
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
              Sua busca por "{searchTerm}" não retornou resultados.
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
                    <div className="absolute top-3 left-3">
                      <Badge
                        variant="secondary"
                        className="bg-background/80 backdrop-blur-md shadow-sm border-0"
                      >
                        {p.line || 'Geral'}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="flex-1 p-5">
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
