import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react'
import pb from '@/lib/pocketbase/client'
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
import { Copy, Pencil, Plus, RotateCcw, Save } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { canDeleteProducts } from '@/lib/permissions'
import { CopiarProdutoDialog } from '@/components/CopiarProdutoDialog'
import { ProductImagesEditor } from '@/components/ProductImagesEditor'
import {
  EMPTY_PRODUCT_FORM,
  PRODUCT_LINES,
  copyProductImages,
  createPendingImage,
  deleteStoredImage,
  formatSpecifications,
  fromStoredDetails,
  loadStoredImages,
  parseSpecifications,
  revokePendingImages,
  saveNewProduct,
  setStoredImageAsMain,
  toStoredDetails,
  uploadImagesToProduct,
  validateProductForm,
  type CopiedProductMeta,
  type PendingImage,
  type ProductFormValues,
  type StoredProductImage,
} from '@/services/product-form'

type Mode = 'create' | 'edit'

export default function CadastrarProduto() {
  const [form, setForm] = useState<ProductFormValues>(EMPTY_PRODUCT_FORM)
  const [mode, setMode] = useState<Mode>('create')
  const [products, setProducts] = useState<any[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [storedImages, setStoredImages] = useState<StoredProductImage[]>([])
  const [images, setImages] = useState<PendingImage[]>([])
  const [copyMeta, setCopyMeta] = useState<CopiedProductMeta | null>(null)
  const [copySource, setCopySource] = useState('')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [copying, setCopying] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loadingProduct, setLoadingProduct] = useState(false)
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

  const loadProducts = useCallback(async () => {
    try {
      const records = await pb.collection('products').getFullList({
        filter: 'is_deleted=false',
        sort: 'name',
      })
      setProducts(records)
    } catch {
      // lista de produtos usada apenas para seleção em modo edição
    }
  }, [])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

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

  // ===== Modo edição: imagens já persistidas =====

  const openProductForEdit = async (id: string) => {
    setLoadingProduct(true)
    setFormError('')
    setSuccessMsg('')
    try {
      const rec = await pb.collection('products').getOne(id)
      setForm({
        name: rec.name || '',
        code: rec.code || '',
        line: rec.line || '',
        description: fromStoredDetails(rec.details || ''),
        specifications: formatSpecifications(rec.specifications),
      })
      setStoredImages(await loadStoredImages(id))
      replaceImages([])
      setCopyMeta(null)
      setCopySource('')
      setEditingId(id)
    } catch {
      toast({ variant: 'destructive', title: 'Erro ao carregar o produto' })
      setEditingId(null)
    } finally {
      setLoadingProduct(false)
    }
  }

  const handleSetMainStored = async (imageId: string) => {
    if (!editingId) return
    const previous = storedImages
    // atualização otimista: a escolhida vai para a frente da lista
    setStoredImages((prev) => {
      const target = prev.find((img) => img.id === imageId)
      if (!target) return prev
      return [{ ...target, sortOrder: 0 }, ...prev.filter((img) => img.id !== imageId)]
    })
    try {
      await setStoredImageAsMain(imageId)
      toast({ title: 'Imagem principal atualizada' })
    } catch {
      setStoredImages(previous)
      toast({
        variant: 'destructive',
        title: 'Não foi possível definir a imagem principal',
      })
    }
  }

  const handleRemoveStored = async (imageId: string) => {
    if (!editingId || !canDeleteProducts()) {
      if (!canDeleteProducts()) {
        toast({
          variant: 'destructive',
          title: 'Sem permissão',
          description: 'Apenas administradores podem remover imagens.',
        })
      }
      return
    }
    try {
      await deleteStoredImage(imageId)
      setStoredImages((prev) => prev.filter((img) => img.id !== imageId))
      toast({ title: 'Imagem removida' })
    } catch {
      toast({ variant: 'destructive', title: 'Não foi possível remover a imagem' })
    }
  }

  const handleUploadStored = async () => {
    if (!editingId || images.length === 0) return
    setSaving(true)
    try {
      const saved = await uploadImagesToProduct(editingId, images)
      const fresh = await loadStoredImages(editingId)
      setStoredImages(fresh)
      replaceImages([])
      if (saved < images.length) {
        toast({
          variant: 'destructive',
          title: `${images.length - saved} imagem(ns) não puderam ser enviadas`,
          description: 'Tente novamente.',
        })
      } else {
        toast({ title: 'Imagens enviadas' })
      }
    } catch {
      toast({ variant: 'destructive', title: 'Erro ao enviar imagens' })
    } finally {
      setSaving(false)
    }
  }

  // ===== Modo criação: cópia de produto existente =====

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
    setStoredImages([])
    setForm(EMPTY_PRODUCT_FORM)
    setCopyMeta(null)
    setCopySource('')
    setEditingId(null)
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
      if (mode === 'edit' && editingId) {
        await pb.collection('products').update(editingId, {
          name: form.name.trim(),
          code: form.code.trim(),
          line: form.line,
          specifications: parseSpecifications(form.specifications),
          details: toStoredDetails(form.description),
        })
        if (images.length > 0) await uploadImagesToProduct(editingId, images)
        setSuccessMsg(`Produto "${form.name.trim()}" atualizado com sucesso.`)
        toast({ title: 'Produto atualizado' })
        replaceImages([])
        setStoredImages(await loadStoredImages(editingId))
      } else {
        const record = await saveNewProduct(form, images, copyMeta)
        setSuccessMsg(`Produto "${record.name}" cadastrado com sucesso.`)
        toast({ title: 'Produto cadastrado' })
        replaceImages([])
        setForm(EMPTY_PRODUCT_FORM)
        setCopyMeta(null)
        setCopySource('')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar produto.'
      setFormError(message)
      toast({ variant: 'destructive', title: 'Erro ao salvar produto', description: message })
    } finally {
      setSaving(false)
    }
  }

  const isEdit = mode === 'edit' && !!editingId

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold tracking-tight">
            {isEdit ? 'Editar Produto' : 'Cadastrar Produto'}
          </h2>
          <p className="text-muted-foreground">
            {isEdit
              ? 'Atualize os dados e gerencie as imagens do equipamento.'
              : 'Novo equipamento do catálogo Vittorio. Use uma cópia de um produto existente para agilizar.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => setMode(mode === 'edit' ? 'create' : 'edit')}
            disabled={copying || saving || loadingProduct}
            className="border-zinc-400 text-zinc-800 hover:bg-zinc-100"
          >
            <Pencil className="mr-2 h-4 w-4" />
            {mode === 'edit' ? 'Novo produto' : 'Editar produto existente'}
          </Button>
          {mode === 'create' && (
            <Button
              variant="outline"
              onClick={() => setPickerOpen(true)}
              disabled={copying || saving}
              className="border-zinc-400 text-zinc-800 hover:bg-zinc-100"
            >
              <Copy className="mr-2 h-4 w-4" />
              {copying ? 'Copiando...' : 'Copiar de produto existente'}
            </Button>
          )}
        </div>
      </div>

      {mode === 'edit' && (
        <div className="rounded-xl border bg-card p-4 space-y-2">
          <Label htmlFor="edit-product-picker">Produto a editar</Label>
          <Select
            value={editingId || undefined}
            onValueChange={openProductForEdit}
            disabled={copying || saving || loadingProduct}
          >
            <SelectTrigger id="edit-product-picker">
              <SelectValue placeholder="Selecione o produto..." />
            </SelectTrigger>
            <SelectContent>
              {products.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name} · {p.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

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
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <input
                ref={fileInput}
                type="file"
                multiple
                accept="image/jpeg, image/png, image/webp"
                onChange={handleFilesSelected}
                disabled={saving}
                className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-zinc-900 file:text-zinc-50 hover:file:bg-zinc-800"
              />
              {isEdit && images.length > 0 && (
                <Button
                  type="button"
                  onClick={handleUploadStored}
                  disabled={saving}
                  className="bg-zinc-900 text-zinc-50 hover:bg-zinc-800"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {saving ? 'Enviando...' : `Enviar ${images.length} imagem(ns)`}
                </Button>
              )}
            </div>
            <ProductImagesEditor
              storedImages={storedImages}
              images={images}
              disabled={saving || loadingProduct}
              onSetMain={isEdit ? handleSetMainStored : handleSetMain}
              onRemove={isEdit ? handleRemoveStored : handleRemoveImage}
            />
            {isEdit && images.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Clique em “Enviar” para gravar as novas imagens no produto. As removidas são
                excluídas imediatamente.
              </p>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {isEdit
              ? 'A imagem marcada como principal é a que aparece no catálogo e nos cards de /produtos.'
              : 'A primeira imagem é a principal: ela aparece no catálogo e nos cards de /produtos.'}
          </p>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleReset} disabled={saving}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Limpar formulário
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || copying}
            className="bg-zinc-900 text-zinc-50 hover:bg-zinc-800"
          >
            <Save className="mr-2 h-4 w-4" />
            {saving
              ? 'Salvando...'
              : mode === 'edit' && editingId
                ? 'Salvar alterações'
                : 'Salvar como novo produto'}
          </Button>
        </div>
      </div>

      <CopiarProdutoDialog open={pickerOpen} onOpenChange={setPickerOpen} onSelect={handleCopy} />
    </div>
  )
}
