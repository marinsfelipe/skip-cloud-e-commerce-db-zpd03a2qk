import type { CatalogData } from '@/services/catalog-generator'

const STEEL_LINE = 'bg-gradient-to-r from-transparent via-[#B9C0C6] to-transparent'

/**
 * Capa oficial do catálogo gerado — identidade Inox Premium Minimal.
 * Logo centralizada (vinda das Configurações do site), "Vittorio" em destaque,
 * subtítulo e frase institucional. Dois temas: layout do site (grafite + dourado)
 * e template branco profissional.
 */
export const CatalogCover = ({ data }: { data: CatalogData }) => {
  const { config } = data
  const isSite = config.layout === 'site'
  const logo = config.logo_url

  return (
    <div
      className={`catalog-page aspect-[1/1.414] w-full relative overflow-hidden flex flex-col items-center justify-center text-center px-14 py-16 ${
        isSite
          ? 'bg-zinc-950 text-zinc-100'
          : 'bg-white text-zinc-900 border border-border shadow-xl'
      }`}
      style={
        config.cover_image
          ? {
              backgroundImage: `url(${config.cover_image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : undefined
      }
    >
      {config.cover_image && (
        <div className={`absolute inset-0 ${isSite ? 'bg-black/75' : 'bg-white/85'}`} />
      )}

      {/* Moldura fina em inox */}
      <div
        className={`pointer-events-none absolute inset-6 border ${
          isSite ? 'border-[#B9C0C6]/35' : 'border-zinc-300'
        }`}
      />
      <div
        className={`pointer-events-none absolute inset-8 border ${
          isSite ? 'border-[#B9C0C6]/15' : 'border-zinc-200'
        }`}
      />

      <div className="relative z-10 flex flex-col items-center w-full">
        {logo && (
          <div
            className={`flex items-center justify-center mb-12 ${
              isSite ? 'rounded-md bg-white/95 px-6 py-4' : ''
            }`}
          >
            <img src={logo} alt="Vittorio" className="h-28 max-w-[260px] object-contain" />
          </div>
        )}

        <span
          className={`font-serif text-6xl font-semibold tracking-[0.32em] pl-[0.32em] ${
            isSite ? 'text-[#D4AF37]' : 'text-zinc-900'
          }`}
        >
          Vittorio
        </span>

        <div className={`mt-8 h-px w-64 ${STEEL_LINE}`} />

        <p
          className={`mt-8 font-serif text-base uppercase tracking-[0.28em] ${
            isSite ? 'text-zinc-200' : 'text-zinc-700'
          }`}
        >
          Equipamentos Profissionais para Food Service
        </p>

        <p
          className={`mt-6 font-serif text-lg italic ${isSite ? 'text-zinc-400' : 'text-zinc-500'}`}
        >
          Excelência e durabilidade em Inox 304
        </p>

        <div className={`mt-12 h-px w-24 ${STEEL_LINE}`} />

        <p
          className={`mt-8 max-w-md text-xs leading-relaxed tracking-wide ${
            isSite ? 'text-zinc-500' : 'text-zinc-400'
          }`}
        >
          {config.contact_info}
        </p>
      </div>
    </div>
  )
}
