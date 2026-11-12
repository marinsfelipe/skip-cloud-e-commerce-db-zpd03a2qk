import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useSeo } from '@/hooks/use-seo'
import { fetchCatalogData } from '@/services/catalog-generator'
import type { CatalogData } from '@/services/catalog-generator'
import { CatalogCover } from '@/components/catalog/CatalogCover'
import { Button } from '@/components/ui/button'
import { Loader2, Printer, ChevronLeft, ChevronRight, X } from 'lucide-react'

const PRODUCTS_PER_PAGE = 6
const fmtPrice = (v: number) =>
  v > 0 ? v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'Consultar'

export default function CatalogoGerado() {
  useSeo(
    'Catálogo Gerado',
    'Catálogo de equipamentos gerado automaticamente.',
    'catálogo, produtos',
  )
  const [searchParams] = useSearchParams()
  const overrideLayout = searchParams.get('layout')
  const overridePrices = searchParams.get('precos')
  const [data, setData] = useState<CatalogData | null>(null)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCatalogData()
      .then((d) => {
        if (overrideLayout === 'site' || overrideLayout === 'template') {
          d.config.layout = overrideLayout
        }
        if (overridePrices === '1') d.config.show_prices = true
        if (overridePrices === '0') d.config.show_prices = false
        setData(d)
      })
      .catch((err) => {
        console.error(err)
        setError('Não foi possível carregar os dados do catálogo.')
      })
      .finally(() => setLoading(false))
  }, [overrideLayout, overridePrices])

  const pages = useMemo(() => {
    if (!data) return []
    const list: React.ReactNode[] = []
    list.push(<CatalogCover key="cover" data={data} />)
    list.push(<SummaryPage key="summary" data={data} />)

    for (const section of data.sections) {
      for (let i = 0; i < section.products.length; i += PRODUCTS_PER_PAGE) {
        const chunk = section.products.slice(i, i + PRODUCTS_PER_PAGE)
        list.push(
          <ProductsPage
            key={`${section.line}-${i}`}
            line={section.line}
            products={chunk}
            showPrices={data.config.show_prices}
            layout={data.config.layout}
          />,
        )
      }
    }

    list.push(<BackCoverPage key="back" data={data} />)
    return list
  }, [data])

  useEffect(() => {
    if (page >= pages.length) setPage(0)
  }, [pages.length, page])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <span className="text-muted-foreground">Gerando catálogo...</span>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-serif font-bold mb-4">Erro ao gerar o catálogo</h2>
        <p className="text-muted-foreground">{error || 'Tente novamente mais tarde.'}</p>
        <Button asChild className="mt-6" variant="outline">
          <Link to="/">Voltar ao início</Link>
        </Button>
      </div>
    )
  }

  const totalPages = pages.length
  const go = (delta: number) => setPage((p) => Math.min(Math.max(p + delta, 0), totalPages - 1))

  return (
    <div className="catalog-viewer min-h-screen bg-muted/40">
      {/* Barra de controles (não impressa) */}
      <div className="no-print sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => go(-1)} disabled={page === 0}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground min-w-[110px] text-center font-medium">
              Página {page + 1} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => go(1)}
              disabled={page >= totalPages - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <X className="mr-1 h-4 w-4" /> Fechar
              </Link>
            </Button>
            <Button size="sm" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" /> Imprimir / Salvar PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Página atual (folheável) */}
      <div className="py-8 flex justify-center print:p-0 print:block">
        <div className="catalog-page-wrap w-full max-w-5xl print:max-w-none">{pages[page]}</div>
      </div>

      {/* Impressão: todas as páginas, cada uma quebrando corretamente */}
      <div className="hidden print:block">
        {pages.map((p, i) => (
          <div key={i} className="catalog-print-page">
            {p}
          </div>
        ))}
      </div>

      <div className="no-print text-center pb-8 text-xs text-muted-foreground">
        Gerado automaticamente a partir dos equipamentos cadastrados — {data.totalProducts}{' '}
        produtos.
      </div>
    </div>
  )
}

const SummaryPage = ({ data }: { data: CatalogData }) => {
  const { config } = data
  const isSite = config.layout === 'site'
  return (
    <div
      className={`catalog-page aspect-[1/1.414] w-full p-12 flex flex-col ${
        isSite
          ? 'bg-zinc-800 text-zinc-100'
          : 'bg-white text-zinc-900 border border-border shadow-xl'
      }`}
    >
      <h2
        className={`text-3xl font-serif font-bold mb-2 ${
          isSite ? 'text-[#D4AF37]' : 'text-zinc-900'
        }`}
      >
        Sumário
      </h2>
      <div className={`w-16 h-0.5 mb-8 ${isSite ? 'bg-[#D4AF37]' : 'bg-zinc-900'}`} />
      <div className="flex-1 overflow-hidden">
        {data.sections.map((s, i) => (
          <div
            key={s.line}
            className={`flex items-center justify-between py-3 border-b ${
              isSite ? 'border-zinc-600/50' : 'border-zinc-200'
            }`}
          >
            <span className="font-serif text-lg font-semibold">{s.line}</span>
            <span className={`text-sm ${isSite ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {s.products.length} {s.products.length === 1 ? 'item' : 'itens'}
            </span>
            <span className={`text-xs ${isSite ? 'text-zinc-500' : 'text-zinc-400'}`}>
              pág.{' '}
              {3 +
                data.sections
                  .slice(0, i)
                  .reduce((acc, x) => acc + Math.ceil(x.products.length / PRODUCTS_PER_PAGE), 0)}
            </span>
          </div>
        ))}
        {data.sections.length === 0 && (
          <p className="text-muted-foreground">Nenhum produto cadastrado ainda.</p>
        )}
      </div>
      <p className={`text-xs mt-6 ${isSite ? 'text-zinc-500' : 'text-zinc-400'}`}>
        {config.show_prices
          ? 'Valores apresentados em reais (BRL), sujeitos a alteração sem aviso prévio.'
          : 'Versão sem valores — consulte nossos consultores para orçamentos.'}
      </p>
    </div>
  )
}

const ProductsPage = ({
  line,
  products,
  showPrices,
  layout,
}: {
  line: string
  products: CatalogData['sections'][number]['products']
  showPrices: boolean
  layout: 'site' | 'template'
}) => {
  const isSite = layout === 'site'
  return (
    <div
      className={`catalog-page aspect-[1/1.414] w-full p-10 flex flex-col ${
        isSite
          ? 'bg-zinc-900 text-zinc-100'
          : 'bg-white text-zinc-900 border border-border shadow-xl'
      }`}
    >
      <div className="flex items-end justify-between mb-6 pb-3 border-b border-current/20">
        <div>
          <p
            className={`text-xs uppercase tracking-widest mb-1 ${isSite ? 'text-[#D4AF37]' : 'text-zinc-500'}`}
          >
            Linha
          </p>
          <h2 className="text-2xl font-serif font-bold">{line}</h2>
        </div>
        <span className="text-sm opacity-60">Vittorio Design</span>
      </div>
      <div className="grid grid-cols-2 gap-6 flex-1 content-start">
        {products.map((p) => (
          <div
            key={p.id}
            className={`flex flex-col rounded-lg overflow-hidden border ${
              isSite ? 'border-zinc-600/40 bg-zinc-800/60' : 'border-zinc-200 bg-zinc-50'
            }`}
          >
            <div className="aspect-[4/3] bg-muted/40 overflow-hidden">
              {p.image ? (
                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs uppercase tracking-widest opacity-40">
                  Sem imagem
                </div>
              )}
            </div>
            <div className="p-4 flex flex-col flex-1">
              <h3 className="font-serif font-semibold text-base leading-snug line-clamp-2">
                {p.name}
              </h3>
              <p className="text-xs opacity-60 mt-1">CÓD: {p.code}</p>
              {p.details && (
                <p className="text-xs opacity-70 mt-2 line-clamp-3 flex-1">{p.details}</p>
              )}
              {showPrices && (
                <p
                  className={`mt-3 pt-2 border-t border-current/10 font-semibold text-sm ${
                    isSite ? 'text-[#D4AF37]' : 'text-zinc-900'
                  }`}
                >
                  {fmtPrice(p.price)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      <div
        className={`mt-4 pt-3 border-t border-current/10 text-xs opacity-50 flex justify-between`}
      >
        <span>Vittorio Design — Catálogo de Equipamentos</span>
        <span>{line}</span>
      </div>
    </div>
  )
}

const BackCoverPage = ({ data }: { data: CatalogData }) => {
  const { config } = data
  const isSite = config.layout === 'site'
  return (
    <div
      className={`catalog-page aspect-[1/1.414] w-full flex flex-col items-center justify-center text-center p-12 ${
        isSite
          ? 'bg-zinc-900 text-zinc-100'
          : 'bg-white text-zinc-900 border border-border shadow-xl'
      }`}
    >
      <span
        className={`font-serif text-4xl font-bold tracking-widest mb-6 ${
          isSite ? 'text-[#D4AF37]' : 'text-zinc-900'
        }`}
      >
        VITTORIO
      </span>
      <p className={`max-w-md ${isSite ? 'text-zinc-300' : 'text-zinc-600'}`}>
        {config.contact_info}
      </p>
      <p className={`mt-8 text-xs ${isSite ? 'text-zinc-500' : 'text-zinc-400'}`}>
        Catálogo gerado automaticamente a partir do site — não copia nem duplica dados dos produtos.
      </p>
    </div>
  )
}
