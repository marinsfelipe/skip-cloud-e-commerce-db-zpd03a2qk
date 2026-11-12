import PocketBase from 'pocketbase'
import { LocalAuthStore } from 'pocketbase'

// Em desenvolvimento, `import.meta.env.DEV` usa `.env.local`; em produção, o bundle embute as vars.
const env = import.meta.env as Record<string, string | undefined>

const baseUrl =
  env.DEV && env.VITE_POCKETBASE_URL_DEV ? env.VITE_POCKETBASE_URL_DEV : env.VITE_POCKETBASE_URL

if (!baseUrl) {
  throw new Error(
    'VITE_POCKETBASE_URL não definida. Configure-a no ambiente (set_env) antes de rodar o app.',
  )
}

// LocalAuthStore persiste token + registro no localStorage e os restaura no load,
// mantendo a sessão do painel admin entre recarregamentos de página. Sem isso,
// toda escrita (produtos, páginas, catálogo) chega anônima ao backend e falha.
const pb = new PocketBase(baseUrl, new LocalAuthStore('vittorio_session'))

pb.autoCancellation(false)

export default pb
