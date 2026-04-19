import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'

interface MediaPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (mediaId: string, url: string) => void
}

export function MediaPicker({ open, onOpenChange, onSelect }: MediaPickerProps) {
  const [mediaItems, setMediaItems] = useState<any[]>([])
  const [productImages, setProductImages] = useState<any[]>([])

  const [mediaPage, setMediaPage] = useState(1)
  const [mediaHasMore, setMediaHasMore] = useState(false)

  const [prodPage, setProdPage] = useState(1)
  const [prodHasMore, setProdHasMore] = useState(false)

  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      loadMedia(1)
      loadProducts(1)
    }
  }, [open])

  const loadMedia = async (page = 1) => {
    if (page === 1) setLoading(true)
    try {
      const res = await pb.collection('media').getList(page, 20, { sort: '-created' })
      setMediaItems((prev) => (page === 1 ? res.items : [...prev, ...res.items]))
      setMediaHasMore(res.page < res.totalPages)
      setMediaPage(page)
    } catch (e) {
      toast({ title: 'Erro ao carregar mídia', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const loadProducts = async (page = 1) => {
    if (page === 1) setLoading(true)
    try {
      const res = await pb.collection('product_images').getList(page, 20, { sort: '-created' })
      setProductImages((prev) => (page === 1 ? res.items : [...prev, ...res.items]))
      setProdHasMore(res.page < res.totalPages)
      setProdPage(page)
    } catch (e) {
      toast({ title: 'Erro ao carregar produtos', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleSelectMedia = (item: any) => {
    onSelect(item.id, pb.files.getURL(item, item.file))
    onOpenChange(false)
  }

  const handleSelectProductImage = async (item: any) => {
    setProcessing(true)
    try {
      const url = pb.files.getURL(item, item.image)
      const res = await fetch(url)
      const blob = await res.blob()
      const formData = new FormData()
      formData.append('file', blob, item.image)
      formData.append('alt_text', 'Importado de produto')
      formData.append('category', 'cms')

      const newMedia = await pb.collection('media').create(formData)
      onSelect(newMedia.id, pb.files.getURL(newMedia, newMedia.file))
      onOpenChange(false)
    } catch (e) {
      toast({ title: 'Erro ao processar imagem', variant: 'destructive' })
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-6">
        <DialogHeader>
          <DialogTitle>Selecionar Imagem</DialogTitle>
        </DialogHeader>

        {processing ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
            <p className="text-muted-foreground">Processando e importando imagem...</p>
          </div>
        ) : (
          <Tabs defaultValue="media" className="flex-1 overflow-hidden flex flex-col mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="media">Galeria de Mídia</TabsTrigger>
              <TabsTrigger value="products">Imagens de Produtos</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto mt-6 pr-2">
              <TabsContent value="media" className="mt-0 h-full flex flex-col">
                {loading && mediaItems.length === 0 ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="animate-spin h-6 w-6" />
                  </div>
                ) : mediaItems.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    Nenhuma mídia encontrada.
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {mediaItems.map((m) => (
                        <button
                          key={m.id}
                          className="relative aspect-square rounded-md overflow-hidden border bg-muted hover:border-primary hover:ring-2 ring-primary/50 transition-all focus:outline-none"
                          onClick={() => handleSelectMedia(m)}
                        >
                          <img
                            src={pb.files.getURL(m, m.file)}
                            alt={m.alt_text || 'Media'}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                    {mediaHasMore && (
                      <div className="flex justify-center mt-8 mb-4">
                        <Button variant="outline" onClick={() => loadMedia(mediaPage + 1)}>
                          Carregar Mais
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>

              <TabsContent value="products" className="mt-0 h-full flex flex-col">
                {loading && productImages.length === 0 ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="animate-spin h-6 w-6" />
                  </div>
                ) : productImages.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    Nenhuma imagem de produto encontrada.
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {productImages.map((p) => (
                        <button
                          key={p.id}
                          className="relative aspect-square rounded-md overflow-hidden border bg-muted hover:border-primary hover:ring-2 ring-primary/50 transition-all focus:outline-none"
                          onClick={() => handleSelectProductImage(p)}
                        >
                          <img
                            src={pb.files.getURL(p, p.image)}
                            alt="Produto"
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                    {prodHasMore && (
                      <div className="flex justify-center mt-8 mb-4">
                        <Button variant="outline" onClick={() => loadProducts(prodPage + 1)}>
                          Carregar Mais
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>
            </div>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}
