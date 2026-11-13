import pb from '@/lib/pocketbase/client'

export type Role = 'Admin' | 'Editor' | 'Viewer'

export const ROLES: { value: Role; label: string; description: string }[] = [
  {
    value: 'Admin',
    label: 'Administrador',
    description: 'Acesso total: produtos, usuários, configurações e exclusões.',
  },
  {
    value: 'Editor',
    label: 'Editor',
    description: 'Cria e edita produtos, mas não exclui nem gerencia usuários.',
  },
  {
    value: 'Viewer',
    label: 'Visualizador',
    description: 'Apenas visualiza produtos e gera catálogos.',
  },
]

export const roleLabel = (role?: string | null) =>
  ROLES.find((r) => r.value === role)?.label || 'Visualizador'

const currentRole = (): Role => {
  const role = pb.authStore.record?.role
  return role === 'Admin' || role === 'Editor' ? role : 'Viewer'
}

export const isAdmin = () => currentRole() === 'Admin'
export const isEditor = () => currentRole() === 'Editor'
export const isViewer = () => currentRole() === 'Viewer'

/** Administradores podem tudo. */
export const canManageUsers = () => isAdmin()

/** Criar/editar produtos: Admin e Editor. */
export const canEditProducts = () => isAdmin() || isEditor()

/** Excluir produtos: apenas Admin. */
export const canDeleteProducts = () => isAdmin()

/** Configurações, blog, mídia, páginas etc.: apenas Admin. */
export const canManageSettings = () => isAdmin()

/**
 * Guarda de rota por permissão: redireciona para o dashboard quando o
 * perfil logado não tem acesso à tela.
 */
export const routeAllows = (path: string): boolean => {
  const role = currentRole()
  if (role === 'Admin') return true
  if (role === 'Editor') {
    return [
      '/dashboard',
      '/admin/config-produtos',
      '/admin/cadastrar-produto',
      '/admin/gerar-catalogo',
      '/conta',
    ].includes(path)
  }
  // Viewer
  return ['/dashboard', '/admin/config-produtos', '/admin/gerar-catalogo', '/conta'].includes(path)
}
