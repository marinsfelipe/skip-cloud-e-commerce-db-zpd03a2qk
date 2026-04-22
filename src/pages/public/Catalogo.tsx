import { useState, useEffect } from 'react'
import { useSeo } from '@/hooks/use-seo'
import pb from '@/lib/pocketbase/client'
import { ImageIcon } from 'lucide-react'

export default function Catalogo() {
  useSeo(
    'Catálogo',
    'Navegue pelo nosso catálogo completo online.',
    'catálogo, produtos, vittorio design',
  )
  const [pages, setPages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    pb.collection('catalog_pages')
      .getFullList({ sort: 'sort_order' })
      .then(setPages)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="py-20 bg-background min-h-[calc(100vh-160px)] flex flex-col items-center">
      <div className="container px-4 text-center max-w-4xl animate-fade-in-up">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
          <ImageIcon className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">Catálogo Digital</h1>
        <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
          Explore nossa linha completa de equipamentos profissionais.
        </p>

        {loading ? (
          <div className="flex flex-col gap-4 items-center">
            <div className="w-full max-w-2xl h-[600px] bg-muted animate-pulse rounded-lg"></div>
          </div>
        ) : pages.length > 0 ? (
          <div className="flex flex-col items-center gap-8 max-w-3xl mx-auto">
            {pages.map((p, i) => {
              const imgUrl = p.image
                ? pb.files.getURL(p, p.image)
                : `https://img.usecurling.com/p/800/1200?q=catalog%20page%20${i + 1}`

              return (
                <img
                  key={p.id}
                  src={imgUrl}
                  alt={`Página do Catálogo ${p.sort_order}`}
                  className="w-full rounded-lg shadow-xl border border-border bg-muted"
                  loading="lazy"
                />
              )
            })}
          </div>
        ) : (
          <div className="p-8 border border-border/50 rounded-xl bg-card/50 text-muted-foreground">
            O catálogo digital está sendo atualizado e estará disponível em breve.
          </div>
        )}
      </div>
    </div>
  )
}
