import pb from '@/lib/pocketbase/client'
import type { CatalogLayout } from '@/pages/GerarCatalogo'

export interface CatalogProduct {
  id: string
  name: string
  code: string
  line: string
  price: number
  details: string
  image: string
}

export interface CatalogSection {
  line: string
  products: CatalogProduct[]
}

export interface CatalogConfigResolved {
  layout: CatalogLayout
  show_prices: boolean
  title: string
  subtitle: string
  contact_info: string
  cover_image: string
}

export interface CatalogData {
  config: CatalogConfigResolved
  sections: CatalogSection[]
  totalProducts: number
}

const stripHtml = (html: string): string => {
  if (!html) return ''
  return html
    .replace(/<[^>]*>?/gm, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

export const fetchCatalogData = async (): Promise<CatalogData> => {
  const [productsRes, imagesRes, configRes] = await Promise.all([
    pb.collection('products').getFullList({ filter: 'is_deleted=false', sort: 'line,name' }),
    pb.collection('product_images').getFullList({ sort: 'sort_order,created' }),
    pb
      .collection('catalog_generator_config')
      .getList(1, 1, { sort: '-updated' })
      .catch(() => ({ items: [] as any[] })),
  ])

  const imagesByProduct = new Map<string, string>()
  for (const img of imagesRes) {
    if (!imagesByProduct.has(img.product)) {
      imagesByProduct.set(img.product, pb.files.getURL(img, img.image))
    }
  }

  const sectionsMap = new Map<string, CatalogProduct[]>()
  for (const p of productsRes) {
    const line = p.line || 'Geral'
    const list = sectionsMap.get(line) || []
    list.push({
      id: p.id,
      name: p.name,
      code: p.code,
      line,
      price: p.price || 0,
      details: stripHtml(p.details || ''),
      image: imagesByProduct.get(p.id) || '',
    })
    sectionsMap.set(line, list)
  }

  const sections: CatalogSection[] = Array.from(sectionsMap.entries())
    .map(([line, products]) => ({ line, products }))
    .sort((a, b) => a.line.localeCompare(b.line, 'pt-BR'))

  const rec: any = configRes.items[0] || {}
  const config: CatalogConfigResolved = {
    layout: rec.layout === 'template' ? 'template' : 'site',
    show_prices: rec.show_prices ?? true,
    title: rec.title || 'Catálogo de Equipamentos',
    subtitle: rec.subtitle || 'Vittorio Design — Equipamentos Profissionais para Food Service',
    contact_info:
      rec.contact_info || 'contato@vittoriodesign.com.br • (21) 99045-1568 • Itaboraí - RJ',
    cover_image: rec.cover_image ? pb.files.getURL(rec, rec.cover_image) : '',
  }

  return {
    config,
    sections,
    totalProducts: productsRes.length,
  }
}
