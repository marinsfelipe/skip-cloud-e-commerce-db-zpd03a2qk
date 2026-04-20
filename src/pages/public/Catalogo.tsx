import { useState, useEffect } from 'react'
import { useSeo } from '@/hooks/use-seo'
import pb from '@/lib/pocketbase/client'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function Catalogo() {
  useSeo(
    'Produtos',
    'Visualize o catálogo completo de equipamentos da Vittorio Design.',
    'catálogo vittorio design, equipamentos inox, produtos',
  )

  const [products, setProducts] = useState<any[]>([])

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

  return (
    <div className="py-12 bg-background min-h-[calc(100vh-160px)] flex flex-col">
      <div className="container px-4 flex-1 flex flex-col">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Nossos Produtos</h1>
            <p className="text-muted-foreground mt-2">
              Explore todas as nossas soluções detalhadamente.
            </p>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="flex-1 border border-border rounded-lg overflow-hidden bg-card relative flex flex-col items-center justify-center p-6 min-h-[400px]">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <span className="font-serif text-2xl text-primary font-bold">V</span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
              Nenhum produto encontrado
            </h2>
            <p className="text-muted-foreground max-w-md text-center">
              Estamos finalizando nosso novo material. Em breve o catálogo completo estará
              disponível para visualização.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-12">
            {products.map((p) => (
              <Card
                key={p.id}
                className="overflow-hidden hover:shadow-xl transition-shadow group border-border"
              >
                <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                  {p.firstImage ? (
                    <img
                      src={p.firstImage}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs uppercase tracking-widest bg-muted/50">
                      Sem imagem
                    </div>
                  )}
                  {p.stock <= 0 && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="destructive">Esgotado</Badge>
                    </div>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="text-lg font-serif mb-1 group-hover:text-primary transition-colors line-clamp-1">
                    {p.name}
                  </CardTitle>
                  <div className="text-sm text-muted-foreground mb-2">{p.line || 'Geral'}</div>
                  <div className="font-bold text-primary">R$ {p.price?.toFixed(2) || '0.00'}</div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
