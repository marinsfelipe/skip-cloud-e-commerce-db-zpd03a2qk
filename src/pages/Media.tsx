import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, ShieldAlert } from 'lucide-react'

export default function Media() {
  // Generate fake images
  const images = Array.from({ length: 8 }).map(
    (_, i) => `https://img.usecurling.com/p/400/400?q=luxury%20furniture&seed=${i}`,
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-serif font-bold tracking-tight">Biblioteca de Mídia</h2>
        <p className="text-muted-foreground">
          Gerencie imagens de produtos e o catálogo PDF seguro.
        </p>
      </div>

      <Tabs defaultValue="images" className="w-full">
        <TabsList>
          <TabsTrigger value="images">Imagens (Produtos/Blog)</TabsTrigger>
          <TabsTrigger value="catalog">Catálogo PDF Seguro</TabsTrigger>
        </TabsList>

        <TabsContent value="images" className="mt-6">
          <div className="flex justify-end mb-4">
            <Button>
              <Upload className="mr-2 h-4 w-4" /> Fazer Upload
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((src, i) => (
              <Card key={i} className="overflow-hidden group cursor-pointer border-0 shadow-sm">
                <CardContent className="p-0 relative aspect-square">
                  <img
                    src={src}
                    alt="Produto"
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-medium text-sm">Ver Detalhes</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="catalog" className="mt-6">
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6 p-4 bg-amber-50 text-amber-900 rounded-md border border-amber-200">
                <ShieldAlert className="h-6 w-6 text-amber-600" />
                <div>
                  <h4 className="font-semibold">Segurança de Visualização Ativada</h4>
                  <p className="text-sm">
                    O download e a impressão deste PDF estão desativados via bloqueio de interface.
                  </p>
                </div>
              </div>

              <div
                className="relative bg-muted rounded-lg border w-full aspect-[1/1.4] max-w-2xl mx-auto overflow-hidden pdf-secure-container flex items-center justify-center"
                onContextMenu={(e) => e.preventDefault()}
              >
                {/* Fake PDF Layer */}
                <div className="absolute inset-0 bg-white shadow-inner m-4 flex flex-col items-center justify-center text-center p-8 opacity-90 pointer-events-none">
                  <h1 className="text-4xl font-serif mb-4">Vittorio Design</h1>
                  <h2 className="text-2xl font-light text-muted-foreground">Coleção 2026</h2>
                  <div className="mt-12 w-32 h-1 bg-secondary"></div>
                </div>
                {/* Anti-interaction overlay */}
                <div className="absolute inset-0 bg-transparent z-50"></div>
              </div>

              <div className="flex justify-center mt-6">
                <Button variant="outline">
                  <Upload className="mr-2 h-4 w-4" /> Atualizar PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
