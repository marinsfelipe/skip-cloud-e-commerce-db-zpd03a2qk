import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Image as ImageIcon } from 'lucide-react'

export function MediaSelector({
  onSelect,
  trigger,
  selectedId,
}: {
  onSelect: (id: string, url: string) => void
  trigger?: React.ReactNode
  selectedId?: string
}) {
  const [media, setMedia] = useState<any[]>([])
  const [open, setOpen] = useState(false)

  const loadMedia = async () => {
    try {
      const records = await pb.collection('media').getFullList({ sort: '-created' })
      setMedia(records)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    if (open) loadMedia()
  }, [open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" type="button">
            <ImageIcon className="w-4 h-4 mr-2" /> Selecionar Mídia
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Selecionar Imagem da Galeria</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] mt-4">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 p-2">
            {media.map((m) => {
              const url = pb.files.getURL(m, m.file)
              return (
                <div
                  key={m.id}
                  className={`cursor-pointer border-2 rounded-lg overflow-hidden transition-all hover:border-primary ${selectedId === m.id ? 'border-primary shadow-md' : 'border-transparent'}`}
                  onClick={() => {
                    onSelect(m.id, url)
                    setOpen(false)
                  }}
                >
                  <img src={url} alt={m.alt_text} className="w-full h-32 object-cover" />
                </div>
              )
            })}
            {media.length === 0 && (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                Nenhuma imagem encontrada. Faça o upload na seção Mídia primeiro.
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
