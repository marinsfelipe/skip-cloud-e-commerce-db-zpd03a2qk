import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShieldAlert, Filter, FileUp } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { ImageUploader } from '@/components/ImageUploader'
import { Switch } from '@/components/ui/switch'

const CATEGORIES = ['Todas', 'Produtos', 'Promoções', 'Blog', 'Páginas', 'Outros']

export default function Media() {
  const [category, setCategory] = useState('Todas')
  const [images, setImages] = useState<any[]>([])
  const { toast } = useToast()

  const loadImages = async () => {
    try {
      const records = await pb.collection('media').getFullList({ sort: '-created' })
      setImages(records)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadImages()
  }, [])

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast({
          variant: 'destructive',
          title: 'Arquivo muito grande',
          description: 'O catálogo PDF deve ter no máximo 50MB.',
        })
        return
      }
      try {
        const formData = new FormData()
        formData.append('key', 'catalog_pdf')
        formData.append('file', file)

        try {
          const record = await pb.collection('settings').getFirstListItem('key="catalog_pdf"')
          await pb.collection('settings').update(record.id, formData)
        } catch {
          await pb.collection('settings').create(formData)
        }
        toast({
          title: 'Catálogo Atualizado',
          description: `${file.name} foi definido como o catálogo oficial.`,
        })
      } catch (err) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Falha ao enviar o catálogo.' })
      }
    }
  }

  const handleToggleCarousel = async (id: string, checked: boolean) => {
    try {
      await pb.collection('media').update(id, { is_ad_carousel: checked })
      setImages(images.map((img) => (img.id === id ? { ...img, is_ad_carousel: checked } : img)))
      toast({ title: checked ? 'Adicionado ao carrossel' : 'Removido do carrossel' })
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erro ao atualizar mídia' })
    }
  }

  const filteredImages =
    category === 'Todas' ? images : images.filter((i) => i.category === category)

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
          <TabsTrigger value="images">Galeria de Imagens</TabsTrigger>
          <TabsTrigger value="catalog">Catálogo PDF Seguro</TabsTrigger>
        </TabsList>

        <TabsContent value="images" className="mt-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-auto min-w-[200px]">
              <ImageUploader onUploadSuccess={loadImages} />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredImages.map((img) => (
              <Card key={img.id} className="overflow-hidden group border-0 shadow-sm relative">
                <div
                  className="absolute top-2 right-2 z-10 flex items-center gap-2 bg-background/80 backdrop-blur-sm p-1 rounded-md"
                  title="Mostrar no Carrossel"
                >
                  <span className="text-[10px] font-medium leading-none">Carrossel</span>
                  <Switch
                    checked={img.is_ad_carousel}
                    onCheckedChange={(c) => handleToggleCarousel(img.id, c)}
                  />
                </div>
                <CardContent className="p-0 relative aspect-square bg-muted cursor-pointer">
                  <img
                    src={pb.files.getURL(img, img.file)}
                    alt="Mídia"
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-end p-4 text-center pointer-events-none">
                    <span className="text-white font-medium text-xs break-words w-full">
                      {img.file}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredImages.length === 0 && (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                Nenhuma imagem encontrada.
              </div>
            )}
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

              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div
                  className="relative bg-muted rounded-lg border w-full aspect-[1/1.4] max-w-sm mx-auto overflow-hidden pdf-secure-container flex items-center justify-center shadow-lg"
                  onContextMenu={(e) => e.preventDefault()}
                >
                  <div className="absolute inset-0 bg-white shadow-inner m-4 flex flex-col items-center justify-center text-center p-8 opacity-90 pointer-events-none">
                    <h1 className="text-3xl font-serif mb-4">Vittorio Design</h1>
                    <h2 className="text-xl font-light text-muted-foreground">Catálogo PDF</h2>
                    <div className="mt-8 w-24 h-1 bg-secondary"></div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex flex-col gap-3">
                    <label className="border-2 border-dashed border-primary/50 bg-primary/5 hover:bg-primary/10 transition-colors rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer text-center">
                      <FileUp className="h-8 w-8 text-primary mb-2" />
                      <span className="font-medium text-foreground mb-1">
                        Substituir Catálogo PDF
                      </span>
                      <span className="text-xs text-muted-foreground">Tamanho máximo: 50MB</span>
                      <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={handlePdfUpload}
                      />
                    </label>
                    <Button variant="outline" className="w-full">
                      Baixar Cópia (Apenas Admin)
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
