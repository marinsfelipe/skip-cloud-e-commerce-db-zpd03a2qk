import { Button } from '@/components/ui/button'
import { Star, X } from 'lucide-react'
import type { PendingImage, StoredProductImage } from '@/services/product-form'

interface ProductImagesEditorProps {
  /** Imagens já persistidas no banco (coleção product_images). */
  storedImages?: StoredProductImage[]
  /** Novas imagens ainda não salvas (upload pendente). */
  images?: PendingImage[]
  disabled?: boolean
  onSetMain?: (id: string) => void
  onRemove?: (id: string) => void
}

/** Miniaturas das imagens do produto; a primeira de cada lista é a imagem principal (catálogo e cards). */
export function ProductImagesEditor({
  storedImages = [],
  images = [],
  disabled,
  onSetMain,
  onRemove,
}: ProductImagesEditorProps) {
  if (storedImages.length === 0 && images.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhuma imagem. Envie uma ou mais fotos acima.
      </p>
    )
  }

  const renderThumb = (
    key: string,
    url: string,
    alt: string,
    isMain: boolean,
    onSet: () => void,
    onDel: () => void,
  ) => (
    <div
      key={key}
      className={`rounded-lg border bg-background p-2 space-y-2 ${
        isMain ? 'border-primary ring-2 ring-primary/20' : ''
      }`}
    >
      <div className="relative aspect-square rounded overflow-hidden bg-muted/30">
        <img src={url} alt={alt} className="w-full h-full object-cover" />
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
          onClick={onDel}
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
        onClick={onSet}
        disabled={disabled || isMain}
      >
        <Star className="mr-1 h-3 w-3" />
        {isMain ? 'Imagem principal' : 'Definir como principal'}
      </Button>
    </div>
  )

  return (
    <div className="space-y-4">
      {storedImages.length > 0 && (
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
            Imagens cadastradas
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {storedImages.map((img, index) =>
              renderThumb(
                img.id,
                img.url,
                `Imagem cadastrada ${index + 1}`,
                index === 0,
                () => onSetMain?.(img.id),
                () => onRemove?.(img.id),
              ),
            )}
          </div>
        </div>
      )}
      {images.length > 0 && (
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
            Novas imagens {storedImages.length > 0 ? '(ainda não salvas)' : ''}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {images.map((img, index) =>
              renderThumb(
                img.id,
                img.url,
                `Nova imagem ${index + 1}`,
                storedImages.length === 0 && index === 0,
                () => onSetMain?.(img.id),
                () => onRemove?.(img.id),
              ),
            )}
          </div>
        </div>
      )}
    </div>
  )
}
