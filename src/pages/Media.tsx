import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Filter, FileUp, Trash2 } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { getErrorMessage } from '@/lib/pocketbase/errors'

const CATEGORIES = ['Todas', 'Produtos', 'Promoções', 'Blog', 'Páginas', 'Outros']

export default function Media() {
  const [category, setCategory] = useState('Todas')
  const [images, setImages] = useState<any[]>([])
  const [catalogPages, setCatalogPages] = useState<any[]>([])
  const [uploadingCatalog, setUploadingCatalog] = useState(false)
  const { toast } = useToast()

  const loadImages = async () => {
    try {
      const records = await pb.collection('media').getFullList({ sort: '-created' })
      setImages(records)
    } catch (err) {
      console.error(err)
    }
  }

  const loadCatalogPages = async () => {
    try {
      const records = await pb.collection('catalog_pages').getFullList({ sort: 'sort_order' })
      setCatalogPages(records)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadImages()
    loadCatalogPages()
  }, [])

  const handleToggleCarousel = async (id: string, checked: boolean) => {
    try {
      await pb.collection('media').update(id, { is_ad_carousel: checked })
      setImages(images.map((img) => (img.id === id ? { ...img, is_ad_carousel: checked } : img)))
      toast({ title: checked ? 'Adicionado ao carrossel' : 'Removido do carrossel' })
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erro ao atualizar mídia' })
    }
  }

  const handleCatalogUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingCatalog(true)
    try {
      const maxOrder = catalogPages.reduce((max, p) => Math.max(max, p.sort_order), 0)
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData()
        formData.append('image', files[i])
        formData.append('sort_order', (maxOrder + i + 1).toString())
        await pb.collection('catalog_pages').create(formData)
      }
      toast({ title: 'Páginas adicionadas com sucesso' })
      loadCatalogPages()
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erro', description: getErrorMessage(err) })
    } finally {
      setUploadingCatalog(false)
      if (e.target) e.target.value = ''
    }
  }

  const updateOrder = async (id: string, newOrder: number) => {
    try {
      await pb.collection('catalog_pages').update(id, { sort_order: newOrder })
      loadCatalogPages()
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erro ao atualizar ordem' })
    }
  }

  const deleteCatalogPage = async (id: string) => {
    if (!confirm('Remover esta página do catálogo?')) return
    try {
      await pb.collection('catalog_pages').delete(id)
      toast({ title: 'Página removida' })
      loadCatalogPages()
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erro ao remover' })
    }
  }

  const filteredImages =
    category === 'Todas' ? images : images.filter((i) => i.category === category)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-serif font-bold tracking-tight">Biblioteca de Mídia</h2>
        <p className="text-muted-foreground">
          Gerencie imagens de produtos e o catálogo sequencial.
        </p>
      </div>

      <Tabs defaultValue="images" className="w-full">
        <TabsList>
          <TabsTrigger value="images">Galeria de Imagens</TabsTrigger>
          <TabsTrigger value="catalog">Gerenciar Catálogo</TabsTrigger>
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

        <TabsContent value="catalog" className="mt-6 space-y-6">
          <div className="flex justify-between items-center bg-card p-4 rounded-lg border">
            <div>
              <h3 className="text-lg font-medium">Páginas do Catálogo</h3>
              <p className="text-sm text-muted-foreground">
                Adicione e reordene as imagens do seu catálogo digital.
              </p>
            </div>
            <label className="cursor-pointer">
              <div className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors">
                <FileUp className="w-4 h-4 mr-2" />
                {uploadingCatalog ? 'Enviando...' : 'Adicionar Páginas'}
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleCatalogUpload}
                disabled={uploadingCatalog}
              />
            </label>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {catalogPages.map((page) => (
              <Card key={page.id} className="overflow-hidden relative group border-2">
                <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8 rounded-full shadow-md"
                    onClick={() => deleteCatalogPage(page.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <CardContent className="p-0">
                  <div className="aspect-[1/1.4] bg-muted relative">
                    {page.image ? (
                      <img
                        src={pb.files.getURL(page, page.image)}
                        className="w-full h-full object-cover"
                        alt={`Página ${page.sort_order}`}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        Sem imagem
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-background/95 p-3 flex items-center justify-between border-t shadow-[0_-4px_10px_rgba(0,0,0,0.1)]">
                      <span className="text-sm font-medium">Ordem:</span>
                      <Input
                        type="number"
                        className="w-20 h-8 text-sm text-center"
                        defaultValue={page.sort_order}
                        onBlur={(e) => {
                          const val = parseInt(e.target.value)
                          if (!isNaN(val) && val !== page.sort_order) updateOrder(page.id, val)
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {catalogPages.length === 0 && !uploadingCatalog && (
              <div className="col-span-full py-16 text-center text-muted-foreground border-2 border-dashed rounded-lg bg-muted/20">
                Nenhuma página no catálogo. Faça o upload das imagens para começar.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
