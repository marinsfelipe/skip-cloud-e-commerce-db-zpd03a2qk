import pb from '@/lib/pocketbase/client'

export const PRODUCT_LINES = [
  'Strongest',
  'Cucinare',
  'Fredda',
  'Aprezzo',
  'Speciale',
  'Visione',
  'Perfecto Gusto',
  'Ideale',
  'Progetto',
] as const

export type ProductLine = (typeof PRODUCT_LINES)[number]

export interface ProductFormValues {
  name: string
  code: string
  line: string
  description: string
  specifications: string
}

export interface PendingImage {
  id: string
  file: File
  url: string
}

/** Campos que não aparecem no formulário, mas são herdados do produto copiado. */
export interface CopiedProductMeta {
  price: number
  stock: number
}

/** Imagem já persistida do produto, carregada da coleção `product_images`. */
export interface StoredProductImage {
  id: string
  productId: string
  fileName: string
  url: string
  sortOrder: number
}

export const EMPTY_PRODUCT_FORM: ProductFormValues = {
  name: '',
  code: '',
  line: '',
  description: '',
  specifications: '',
}

const newImageId = () => Math.random().toString(36).slice(2) + Date.now().toString(36)

export const createPendingImage = (file: File): PendingImage => ({
  id: newImageId(),
  file,
  url: URL.createObjectURL(file),
})

export const revokePendingImages = (images: PendingImage[]) => {
  images.forEach((img) => URL.revokeObjectURL(img.url))
}

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** Descrição em texto puro -> HTML seguro (escapado) para o campo `details`. */
export const toStoredDetails = (text: string): string =>
  escapeHtml(text.replace(/\r\n/g, '\n').trim()).replace(/\n/g, '<br>')

/** Campo `details` salvo -> texto puro para o textarea. */
export const fromStoredDetails = (html: string): string =>
  html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .trim()

/** Objeto de especificações salvo -> linhas "Chave: valor" para o textarea. */
export const formatSpecifications = (raw: unknown): string => {
  let obj: unknown = raw
  if (typeof raw === 'string') {
    if (!raw.trim()) return ''
    try {
      obj = JSON.parse(raw)
    } catch {
      return ''
    }
  }
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return ''
  return Object.entries(obj as Record<string, unknown>)
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join('\n')
}

/** Linhas "Chave: valor" -> objeto de especificações. Lança Error com mensagem para o usuário. */
export const parseSpecifications = (text: string): Record<string, string> => {
  const result: Record<string, string> = {}
  text.split('\n').forEach((line, index) => {
    const trimmed = line.trim()
    if (!trimmed) return
    const sep = trimmed.indexOf(':')
    const key = sep > 0 ? trimmed.slice(0, sep).trim() : ''
    const value = sep > 0 ? trimmed.slice(sep + 1).trim() : ''
    if (!key || !value) {
      throw new Error(`Especificação na linha ${index + 1} deve estar no formato "Chave: valor".`)
    }
    result[key] = value
  })
  return result
}

/** Retorna a mensagem de erro do formulário, ou null quando estiver válido. */
export const validateProductForm = (values: ProductFormValues): string | null => {
  const name = values.name.trim()
  const code = values.code.trim()
  if (!name) return 'Informe o nome do produto.'
  if (name.length > 200) return 'O nome do produto deve ter no máximo 200 caracteres.'
  if (!code) return 'Informe o código do produto.'
  if (code.length > 50) return 'O código deve ter no máximo 50 caracteres.'
  if (!PRODUCT_LINES.includes(values.line as ProductLine)) return 'Selecione uma das 9 linhas.'
  try {
    parseSpecifications(values.specifications)
  } catch (err) {
    return err instanceof Error ? err.message : 'Especificações técnicas inválidas.'
  }
  return null
}

/** Baixa as imagens já cadastradas de um produto para o formulário, na mesma ordem. */
export const copyProductImages = async (
  productId: string,
): Promise<{ images: PendingImage[]; failed: number }> => {
  const records = await pb
    .collection('product_images')
    .getFullList({ filter: `product="${productId}"`, sort: 'sort_order,created' })
  const images: PendingImage[] = []
  let failed = 0
  for (const rec of records) {
    try {
      const res = await fetch(pb.files.getURL(rec, rec.image))
      if (!res.ok) throw new Error(String(res.status))
      const blob = await res.blob()
      const file = new File([blob], String(rec.image), { type: blob.type || 'image/jpeg' })
      images.push(createPendingImage(file))
    } catch {
      failed++
    }
  }
  return { images, failed }
}

/** Carrega as imagens já persistidas de um produto, ordenadas (sort_order 0 = principal). */
export const loadStoredImages = async (productId: string): Promise<StoredProductImage[]> => {
  const records = await pb
    .collection('product_images')
    .getFullList({ filter: `product="${productId}"`, sort: 'sort_order,created' })
  return records.map((rec) => ({
    id: rec.id,
    productId,
    fileName: String(rec.image),
    url: pb.files.getURL(rec, rec.image),
    sortOrder: Number(rec.sort_order) || 0,
  }))
}

/** Reordena as imagens persistidas de um produto para que a escolhida fique com sort_order 0. */
export const setStoredImageAsMain = async (imageId: string): Promise<void> => {
  const rec = await pb.collection('product_images').getOne(imageId)
  const siblings = await pb.collection('product_images').getFullList({
    filter: `product="${rec.product}" && id!="${imageId}"`,
    sort: 'sort_order,created',
  })
  await pb.collection('product_images').update(imageId, { sort_order: 0 })
  for (let i = 0; i < siblings.length; i++) {
    const next = siblings[i].sort_order === 0 ? 1 : i + 1
    if (next !== siblings[i].sort_order) {
      await pb.collection('product_images').update(siblings[i].id, { sort_order: next })
    }
  }
}

/** Remove uma imagem persistida (registro em `product_images` + arquivo no storage). */
export const deleteStoredImage = async (imageId: string): Promise<void> => {
  await pb.collection('product_images').delete(imageId)
}

/** Envia novas imagens (upload) para um produto já existente, ao final da lista. */
export const uploadImagesToProduct = async (
  productId: string,
  images: PendingImage[],
): Promise<number> => {
  const existing = await pb.collection('product_images').getFullList({
    filter: `product="${productId}"`,
    sort: '-sort_order',
  })
  const base = existing.length > 0 ? Math.max(0, Number(existing[0].sort_order) || 0) + 1 : 0
  let saved = 0
  for (let i = 0; i < images.length; i++) {
    try {
      const fd = new FormData()
      fd.append('product', productId)
      fd.append('image', images[i].file)
      fd.append('sort_order', String(base + i))
      await pb.collection('product_images').create(fd)
      saved++
    } catch {
      // falha de uma imagem não interrompe as demais; o total salvo é retornado
    }
  }
  return saved
}

/**
 * Cria um produto novo em `products` e envia as imagens para `product_images`.
 * A imagem principal é a de sort_order 0 (primeira da lista), a mesma usada pelo catálogo e pelos cards.
 */
export const saveNewProduct = async (
  values: ProductFormValues,
  images: PendingImage[],
  meta: CopiedProductMeta | null,
) => {
  const specifications = parseSpecifications(values.specifications)
  let record
  try {
    record = await pb.collection('products').create({
      name: values.name.trim(),
      code: values.code.trim(),
      line: values.line,
      price: meta?.price ?? 0,
      stock: meta?.stock ?? 0,
      specifications,
      details: toStoredDetails(values.description),
      is_deleted: false,
    })
  } catch {
    throw new Error('Não foi possível salvar o produto. Verifique os campos e tente novamente.')
  }

  for (let i = 0; i < images.length; i++) {
    try {
      const fd = new FormData()
      fd.append('product', record.id)
      fd.append('image', images[i].file)
      fd.append('sort_order', String(i))
      await pb.collection('product_images').create(fd)
    } catch {
      throw new Error(
        `Produto "${record.name}" foi criado, mas a imagem ${i + 1} não foi enviada. Ajuste-a em Config. Produtos.`,
      )
    }
  }
  return record
}
