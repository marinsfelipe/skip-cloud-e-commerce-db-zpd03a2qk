import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSeo } from '@/hooks/use-seo'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, ChevronRight, Ruler } from 'lucide-react'

export default function ProdutoDetalhes() {
  const { id } = useParams()
  const [product, setProduct] = useState<any>(null)
  const [images, setImages] = useState<any[]>([])
  const [mainImage, setMainImage] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useSeo(
    product ? product.name : 'Produto',
    product ? `Especificações técnicas do produto ${product.name}` : 'Detalhes do produto',
  )

  useEffect(() => {
    if (!id) return
    pb.collection('products')
      .getOne(id)
      .then(async (p) => {
        setProduct(p)
        try {
          const imgs = await pb
            .collection('product_images')
            .getFullList({ filter: `product="${p.id}"`, sort: 'sort_order' })
          setImages(imgs)
          if (imgs.length > 0) {
            setMainImage(pb.files.getURL(imgs[0], imgs[0].image))
          }
        } catch (err) {
          console.error(err)
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <span className="text-muted-foreground font-serif">Carregando especificações...</span>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-3xl font-serif font-bold mb-4">Produto não encontrado</h2>
        <p className="text-muted-foreground mb-8">
          O equipamento que você está procurando não existe ou foi removido.
        </p>
        <Button asChild>
          <Link to="/produtos">Ver todos os produtos</Link>
        </Button>
      </div>
    )
  }

  let specs = []
  if (product.specifications) {
    try {
      const parsed =
        typeof product.specifications === 'string'
          ? JSON.parse(product.specifications)
          : product.specifications
      specs = Object.entries(parsed)
    } catch {}
  }

  return (
    <div className="py-10 md:py-16 bg-background min-h-screen">
      <div className="container px-4 max-w-6xl">
        <nav className="flex text-sm text-muted-foreground mb-8 items-center">
          <Link to="/produtos" className="hover:text-primary transition-colors flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" /> Produtos
          </Link>
          <ChevronRight className="w-4 h-4 mx-2 opacity-50" />
          <span className="truncate">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Gallery */}
          <div className="space-y-4">
            <div className="aspect-[4/3] sm:aspect-square rounded-2xl overflow-hidden bg-muted/30 border border-border/50">
              {mainImage ? (
                <img
                  src={mainImage}
                  alt={product.name}
                  className="w-full h-full object-cover animate-fade-in"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/50">
                  <span className="font-serif text-4xl mb-2 opacity-20">Vittorio</span>
                  <span className="text-sm tracking-widest uppercase">Imagem Indisponível</span>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {images.map((img) => {
                  const url = pb.files.getURL(img, img.image)
                  const isActive = mainImage === url
                  return (
                    <button
                      key={img.id}
                      onClick={() => setMainImage(url)}
                      className={`aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                        isActive
                          ? 'border-primary ring-2 ring-primary/20 scale-[0.98]'
                          : 'border-transparent hover:border-primary/50 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col animate-fade-in-up">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="secondary" className="px-3 py-1 text-sm font-medium tracking-wide">
                  Linha {product.line || 'Geral'}
                </Badge>
                <div className="text-sm font-mono text-muted-foreground bg-muted/50 px-3 py-1 rounded-md">
                  CÓD: {product.code}
                </div>
              </div>
              <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-4 leading-tight">
                {product.name}
              </h1>
            </div>

            {product.details && (
              <div
                className="prose prose-slate dark:prose-invert max-w-none mb-10 text-muted-foreground leading-relaxed"
                dangerouslySetInnerHTML={{ __html: product.details }}
              />
            )}

            {specs.length > 0 && (
              <div className="mb-10 bg-card border border-border/50 rounded-2xl p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6 border-b border-border/50 pb-4">
                  <Ruler className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-serif font-semibold">Especificações Técnicas</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                  {specs.map(([key, value]) => (
                    <div key={key} className="flex flex-col group">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1 font-medium group-hover:text-primary transition-colors">
                        {key}
                      </span>
                      <span className="font-medium text-sm text-foreground">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-auto pt-8 border-t border-border/50">
              <p className="text-sm text-muted-foreground mb-4">
                Interessado neste equipamento? Entre em contato com nossos consultores para projetos
                e orçamentos detalhados.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild className="w-full sm:w-auto px-8 h-14 text-base">
                  <Link to="/contato">Falar com Consultor</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="w-full sm:w-auto px-8 h-14 text-base"
                >
                  <Link to="/catalogo">Baixar Catálogo PDF</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
