import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShieldAlert } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { roleLabel } from '@/lib/permissions'

export type Permission = 'products' | 'productsEdit' | 'users' | 'settings' | 'catalog'

const PERMISSION_LABEL: Record<Permission, string> = {
  products: 'ver produtos',
  productsEdit: 'criar e editar produtos',
  users: 'gerenciar usuários',
  settings: 'acessar configurações e módulos administrativos',
  catalog: 'gerar catálogos',
}

const can = (permission: Permission, role: string | undefined): boolean => {
  if (role === 'Admin') return true
  if (role === 'Editor') {
    return permission === 'products' || permission === 'productsEdit' || permission === 'catalog'
  }
  return permission === 'products' || permission === 'catalog'
}

export default function RequirePermission({
  permission,
  children,
}: {
  permission: Permission
  children: ReactNode
}) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) return <Navigate to="/admin" replace state={{ from: location.pathname }} />

  if (!can(permission, user.role)) {
    return (
      <Card className="max-w-lg mx-auto mt-10">
        <CardHeader>
          <CardTitle className="font-serif text-xl flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-destructive" />
            Acesso restrito
          </CardTitle>
          <CardDescription>
            Seu perfil ({roleLabel(user.role)}) não tem permissão para{' '}
            {PERMISSION_LABEL[permission]}. Fale com um administrador.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Você voltará ao painel automaticamente.
        </CardContent>
      </Card>
    )
  }

  return <>{children}</>
}
