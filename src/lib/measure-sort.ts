/**
 * Extração do comprimento principal (em mm) de um produto Vittorio para ordenação.
 *
 * As medidas não têm campo próprio: vivem no texto do campo `details`
 * (editor HTML) em formatos como "Medidas: 1400x700x850mm" ou inline
 * "450mm", e eventualmente no JSON `specifications` ("Chave: valor").
 * O comprimento principal é o PRIMEIRO número da dimensão composta
 * (700x700x1250mm -> 700). A ordenação é NUMÉRICA, nunca alfabética.
 */

const HTML_TAG_RE = /<[^>]*>/g
const ENTITY_RE = /&(?:nbsp|amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);/g

/** Converte uma fonte (string HTML/texto ou objeto de especificações) em texto puro. */
const toPlainText = (source: unknown): string => {
  if (source == null) return ''
  if (typeof source === 'string') {
    return source.replace(HTML_TAG_RE, ' ').replace(ENTITY_RE, ' ')
  }
  if (typeof source === 'object') {
    // objeto plano: achata em linhas "Chave: valor"
    try {
      const entries = Array.isArray(source)
        ? (source as unknown[]).map(String)
        : Object.entries(source as Record<string, unknown>).map(
            ([key, value]) => `${key}: ${String(value)}`,
          )
      return entries.join(' ').replace(HTML_TAG_RE, ' ').replace(ENTITY_RE, ' ')
    } catch {
      return ''
    }
  }
  return String(source)
}

/** "1.400" -> 1400 | "1,5" -> 1.5 | "700" -> 700 */
const parseNumber = (raw: string): number => {
  const cleaned = raw.replace(/\s/g, '')
  if (/^\d{1,3}(\.\d{3})+$/.test(cleaned)) return parseFloat(cleaned.replace(/\./g, ''))
  return parseFloat(cleaned.replace(',', '.'))
}

/** Tenta casar uma dimensão composta (LxAxHmm) e devolve o 1º número (comprimento). */
const matchComposite = (text: string): number | null => {
  const m = text.match(
    /(\d+(?:[.,]\d+)?)\s*[xX×]\s*\d+(?:[.,]\d+)?(?:\s*[xX×]\s*\d+(?:[.,]\d+)?)?\s*(?:mm|mil[ií]metros)\b/i,
  )
  return m ? parseNumber(m[1]) : null
}

/** Tenta casar uma medida única em mm ("450mm"). */
const matchSingle = (text: string): number | null => {
  const m = text.match(/(\d+(?:[.,]\d+)?)\s*(?:mm|mil[ií]metros)\b/i)
  return m ? parseNumber(m[1]) : null
}

/**
 * Extrai o comprimento principal em mm a partir de uma ou mais fontes
 * (ex.: product.details, product.specifications). Retorna null quando
 * nenhuma medida identificável é encontrada (o produto fica no fim da lista).
 */
export const extractMainLengthMm = (...sources: unknown[]): number | null => {
  const texts = sources.map(toPlainText).filter((t) => t.trim().length > 0)
  if (texts.length === 0) return null

  // prioriza o trecho que traz o bloco "Medidas: ..."
  const explicit = texts.find((t) => /medidas?\b/i.test(t))
  const ordered = [explicit, ...texts].filter((t): t is string => Boolean(t))

  for (const text of ordered) {
    const composite = matchComposite(text)
    if (composite != null) return composite
    const single = matchSingle(text)
    if (single != null) return single
  }
  return null
}
