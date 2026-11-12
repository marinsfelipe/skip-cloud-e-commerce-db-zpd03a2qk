import { Button } from '@/components/ui/button'
import { Star, X } from 'lucide-react'
import type { PendingImage } from '@/services/product-form'

interface ProductImagesEditorProps {
  images: PendingImage[]
  disabled?: boolean
  onSetMain: (id: string) => void
  onRemove: (id: string) => void
}

/** Miniaturas das imagens do produto; a primeira da lista é a imagem principal (catálogo e cards). */
export function ProductImagesEditor({
  images,
  disabled,
  onSetMain,
  onRemove,
}: ProductImagesEditorProps) {
  if (images.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhuma imagem. Envie uma ou mais fotos acima.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {images.map((img, index) => {
        const isMain = index === 0
        return (
          <div
            key={img.id}
            className={`rounded-lg border bg-background p-2 space-y-2 ${
              isMain ? 'border-primary ring-2 ring-primary/20' : ''
            }`}
          >
            <div className="relative aspect-square rounded overflow-hidden bg-muted/30">
              <img
                src={img.url}
                alt={`Imagem ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {isMain && (
                <span className="absolute left-1 top-1 rounded bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
                  Principal
                </span>
              )}
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute right-1 top-1 h-6 w-6 rounded-full"
                onClick={() => onRemove(img.id)}
                disabled={disabled}
                aria-label="Remover imagem"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <Button
              type="button"
              variant={isMain ? 'secondary' : 'outline'}
              size="sm"
              className="w-full text-xs"
              onClick={() => onSetMain(img.id)}
              disabled={disabled || isMain}
            >
              <Star className="mr-1 h-3 w-3" />
              {isMain ? 'Imagem principal' : 'Definir como principal'}
            </Button>
          </div>
        )
      })}
    </div>
  )
}
