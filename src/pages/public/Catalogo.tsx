import { Upload } from 'lucide-react'
import { useSeo } from '@/hooks/use-seo'
import { useAssetStore } from '@/stores/use-asset-store'
import { useAuthStore } from '@/stores/use-auth-store'
import { Button } from '@/components/ui/button'

export default function Catalogo() {
  useSeo(
    'Catálogo',
    'Visualize o catálogo completo de equipamentos da Vittorio Design.',
    'catálogo vittorio design, equipamentos inox, pdf',
  )

  const { catalogPdfUrl, setCatalogPdf } = useAssetStore()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return (
    <div className="py-12 bg-background min-h-[calc(100vh-160px)] flex flex-col">
      <div className="container px-4 flex-1 flex flex-col">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Catálogo Digital</h1>
            <p className="text-muted-foreground mt-2">
              Explore todas as nossas soluções detalhadamente.
            </p>
          </div>

          {isAuthenticated && (
            <label className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md cursor-pointer font-semibold inline-flex items-center gap-2 transition-colors">
              <Upload className="w-4 h-4" />
              Upload PDF
              <input
                type="file"
                className="hidden"
                accept="application/pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) setCatalogPdf(URL.createObjectURL(file))
                }}
              />
            </label>
          )}
        </div>

        <div
          className="flex-1 min-h-[600px] w-full border border-border rounded-lg overflow-hidden bg-card relative"
          onContextMenu={(e) => {
            e.preventDefault() // Prevents right click
          }}
        >
          {catalogPdfUrl ? (
            // #toolbar=0 prevents standard download/print toolbar in some browsers
            <iframe
              src={`${catalogPdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
              className="w-full h-full pdf-secure-container"
              title="Catálogo Vittorio"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <span className="font-serif text-2xl text-primary font-bold">V</span>
              </div>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
                Catálogo em Breve
              </h2>
              <p className="text-muted-foreground max-w-md">
                Estamos finalizando nosso novo material. Em breve o catálogo completo estará
                disponível para visualização.
              </p>
            </div>
          )}

          {/* Overlay to intercept right-clicks on iframe (partial protection) */}
          <div className="absolute inset-0 bg-transparent z-10 pointer-events-none" />
        </div>
      </div>
    </div>
  )
}
