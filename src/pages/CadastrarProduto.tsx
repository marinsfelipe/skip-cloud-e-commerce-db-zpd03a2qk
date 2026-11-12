import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Copy, Save } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { CopiarProdutoDialog } from '@/components/CopiarProdutoDialog'
import { ProductImagesEditor } from '@/components/ProductImagesEditor'
import {
  EMPTY_PRODUCT_FORM,
  PRODUCT_LINES,
  copyProductImages,
  createPendingImage,
  formatSpecifications,
  fromStoredDetails,
  revokePendingImages,
  saveNewProduct,
  validateProductForm,
  type CopiedProductMeta,
  type PendingImage,
  type ProductFormValues,
} from '@/services/product-form'

export default function CadastrarProduto() {
  const [form, setForm] = useState<ProductFormValues>(EMPTY_PRODUCT_FORM)
  const [images, setImages] = useState<PendingImage[]>([])
  const [copyMeta, setCopyMeta] = useState<CopiedProductMeta | null>(null)
  const [copySource, setCopySource] = useState('')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [copying, setCopying] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)
  const imagesRef = useRef<PendingImage[]>([])
  const { toast } = useToast()

  // Mantém a referência atual para liberar as URLs de preview ao desmontar a tela.
  useEffect(() => {
    imagesRef.current = images
  }, [images])
  useEffect(() => () => revokePendingImages(imagesRef.current), [])

  const update = (patch: Partial<ProductFormValues>) => {
    setForm((prev) => ({ ...prev, ...patch }))
    setFormError('')
    setSuccessMsg('')
  }

  const replaceImages = (next: PendingImage[]) => {
    revokePendingImages(imagesRef.current)
    setImages(next)
  }

  const handleFilesSelected = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const added = Array.from(e.target.files).map(createPendingImage)
    setImages((prev) => [...prev, ...added])
    setSuccessMsg('')
    e.target.value = ''
  }

  const handleSetMain = (id: string) => {
    setImages((prev) => {
      const target = prev.find((img) => img.id === id)
      if (!target) return prev
      return [target, ...prev.filter((img) => img.id !== id)]
    })
  }

  const handleRemoveImage = (id: string) => {
    setImages((prev) => {
      const target = prev.find((img) => img.id === id)
      if (target) URL.revokeObjectURL(target.url)
      return prev.filter((img) => img.id !== id)
    })
  }

  const handleCopy = async (source: any) => {
    setPickerOpen(false)
    setCopying(true)
    setFormError('')
    setSuccessMsg('')
    try {
      const { images: copied, failed } = await copyProductImages(source.id)
      setForm({
        name: `${source.name} (cópia)`,
        code: '',
        line: source.line || '',
        description: fromStoredDetails(source.details || ''),
        specifications: formatSpecifications(source.specifications),
      })
      setCopyMeta({ price: Number(source.price) || 0, stock: Number(source.stock) || 0 })
      setCopySource(source.name)
      replaceImages(copied)
      if (failed > 0) {
        toast({
          variant: 'destructive',
          title: `${failed} imagem(ns) não puderam ser copiadas`,
          description: 'Envie-as novamente pelo botão de upload.',
        })
      } else {
        toast({ title: 'Dados copiados', description: 'Ajuste nome e código antes de salvar.' })
      }
    } catch {
      toast({ variant: 'destructive', title: 'Erro ao copiar o produto' })
    } finally {
      setCopying(false)
    }
  }

  const handleReset = () => {
    replaceImages([])
    setForm(EMPTY_PRODUCT_FORM)
    setCopyMeta(null)
    setCopySource('')
    setFormError('')
    setSuccessMsg('')
  }

  const handleSave = async () => {
    const error = validateProductForm(form)
    if (error) {
      setFormError(error)
      setSuccessMsg('')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      const record = await saveNewProduct(form, images, copyMeta)
      setSuccessMsg(`Produto "${record.name}" cadastrado com sucesso.`)
      toast({ title: 'Produto cadastrado' })
      replaceImages([])
      setForm(EMPTY_PRODUCT_FORM)
      setCopyMeta(null)
      setCopySource('')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar produto.'
      setFormError(message)
      toast({ variant: 'destructive', title: 'Erro ao salvar produto', description: message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold tracking-tight">Cadastrar Produto</h2>
          <p className="text-muted-foreground">
            Novo equipamento do catálogo Vittorio. Use uma cópia de um produto existente para
            agilizar.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setPickerOpen(true)}
          disabled={copying || saving}
          className="border-zinc-400 text-zinc-800 hover:bg-zinc-100"
        >
          <Copy className="mr-2 h-4 w-4" />
          {copying ? 'Copiando...' : 'Copiar de produto existente'}
        </Button>
      </div>

      {copySource && (
        <p className="text-sm text-muted-foreground">
          Dados copiados de <span className="font-medium text-foreground">{copySource}</span>. Nome
          e código devem ser ajustados antes de salvar.
        </p>
      )}

      {successMsg && (
        <div
          role="status"
          className="rounded-md border border-green-600/40 bg-green-50 px-4 py-3 text-sm text-green-800"
        >
          {successMsg}
        </div>
      )}
      {formError && (
        <div
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {formError}
        </div>
      )}

      <div className="rounded-xl border bg-card p-6 space-y-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="prod-name">Nome do produto</Label>
            <Input
              id="prod-name"
              value={form.name}
              maxLength={200}
              onChange={(e) => update({ name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="prod-code">Código</Label>
            <Input
              id="prod-code"
              value={form.code}
              maxLength={50}
              className="font-mono"
              onChange={(e) => update({ code: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Linha</Label>
            <Select value={form.line || undefined} onValueChange={(v) => update({ line: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a linha" />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_LINES.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="prod-description">Descrição</Label>
          <Textarea
            id="prod-description"
            className="min-h-[120px]"
            placeholder="Descrição comercial do equipamento..."
            value={form.description}
            onChange={(e) => update({ description: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="prod-specs">Especificações técnicas</Label>
          <Textarea
            id="prod-specs"
            className="min-h-[120px] font-mono text-xs"
            placeholder={'Uma por linha, no formato "Chave: valor"\nEx.: Voltagem: 220V'}
            value={form.specifications}
            onChange={(e) => update({ specifications: e.target.value })}
          />
        </div>

        <div className="space-y-3">
          <Label>Imagens</Label>
          <div className="border-2 border-dashed border-border rounded-md p-4 bg-muted/30 space-y-4">
            <input
              ref={fileInput}
              type="file"
              multiple
              accept="image/jpeg, image/png, image/webp"
              onChange={handleFilesSelected}
              disabled={saving}
              className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-zinc-900 file:text-zinc-50 hover:file:bg-zinc-800"
            />
            <ProductImagesEditor
              images={images}
              disabled={saving}
              onSetMain={handleSetMain}
              onRemove={handleRemoveImage}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            A primeira imagem é a principal: ela aparece no catálogo e nos cards de /produtos.
          </p>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleReset} disabled={saving}>
            Limpar formulário
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || copying}
            className="bg-zinc-900 text-zinc-50 hover:bg-zinc-800"
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Salvando...' : 'Salvar como novo produto'}
          </Button>
        </div>
      </div>

      <CopiarProdutoDialog open={pickerOpen} onOpenChange={setPickerOpen} onSelect={handleCopy} />
    </div>
  )
}
