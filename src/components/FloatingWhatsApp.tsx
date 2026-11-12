import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

const WHATSAPP_URL =
  'https://wa.me/5521990451568?text=' +
  encodeURIComponent(
    'Olá, vim pelo site da Vittorio e gostaria de mais informações sobre os equipamentos.',
  )
const TOOLTIP_TEXT = 'Fale conosco pelo WhatsApp'
const WELCOME_TEXT = 'Olá! Posso ajudar você a encontrar o equipamento ideal para o seu negócio?'
const WELCOME_STORAGE_KEY = 'vittorio-whatsapp-welcome-seen'
const WELCOME_DELAY_MS = 5000

export default function FloatingWhatsApp() {
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    let timer: number | undefined

    try {
      const alreadySeen = window.localStorage.getItem(WELCOME_STORAGE_KEY)
      if (!alreadySeen) {
        timer = window.setTimeout(() => {
          setShowWelcome(true)
          try {
            window.localStorage.setItem(WELCOME_STORAGE_KEY, '1')
          } catch {
            /* armazenamento indisponível: o balão apenas pode reaparecer */
          }
        }, WELCOME_DELAY_MS)
      }
    } catch {
      /* localStorage indisponível — botão segue funcionando sem o balão */
    }

    return () => {
      if (timer) window.clearTimeout(timer)
    }
  }, [])

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3 print:hidden">
      {showWelcome && (
        <div
          role="status"
          className="relative w-72 max-w-[calc(100vw-3rem)] rounded-lg border border-border bg-zinc-900/95 text-zinc-100 shadow-xl backdrop-blur animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <button
            type="button"
            onClick={() => setShowWelcome(false)}
            aria-label="Fechar mensagem"
            className="absolute top-2 right-2 p-1 rounded text-zinc-400 hover:text-zinc-100 hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="p-4 pr-9">
            <p className="font-serif text-sm font-semibold tracking-widest text-zinc-100 mb-1">
              VITTORIO
            </p>
            <p className="text-sm leading-relaxed text-zinc-300">{WELCOME_TEXT}</p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[#25D366] hover:text-[#1ebe5b] transition-colors"
            >
              <WhatsAppIcon className="w-4 h-4" />
              Responder no WhatsApp
            </a>
          </div>
          <span
            aria-hidden
            className="absolute -bottom-2 right-6 w-4 h-4 rotate-45 bg-zinc-900/95 border-b border-r border-border"
          />
        </div>
      )}

      <div className="group relative">
        <span
          role="tooltip"
          className="pointer-events-none absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md border border-border bg-zinc-900/95 px-3 py-1.5 text-sm text-zinc-100 shadow-lg opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-focus-within:opacity-100 transition-all duration-200"
        >
          {TOOLTIP_TEXT}
        </span>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={TOOLTIP_TEXT}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg ring-1 ring-black/10 hover:bg-[#1ebe5b] hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 transition-all duration-200"
        >
          <WhatsAppIcon className="w-7 h-7" />
        </a>
      </div>
    </div>
  )
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a5.29 5.29 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}
