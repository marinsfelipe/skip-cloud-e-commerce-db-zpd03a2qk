import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Tag,
  FileText,
  ImageIcon,
  ScrollText,
  LogOut,
  Users as UsersIcon,
  Settings,
  MessageSquare,
  Files,
  BookOpen,
  PackagePlus,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { useAuth } from '@/hooks/use-auth'
import { roleLabel } from '@/lib/permissions'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { KeyRound } from 'lucide-react'
import { useEffect } from 'react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

const MENU_ITEMS: {
  title: string
  icon: typeof LayoutDashboard
  url: string
  permission: 'products' | 'productsEdit' | 'users' | 'settings' | 'catalog'
}[] = [
  { title: 'Dashboard', icon: LayoutDashboard, url: '/dashboard', permission: 'products' },
  { title: 'Mensagens / Leads', icon: MessageSquare, url: '/mensagens', permission: 'settings' },
  {
    title: 'Config. Produtos',
    icon: Package,
    url: '/admin/config-produtos',
    permission: 'products',
  },
  {
    title: 'Cadastrar Produto',
    icon: PackagePlus,
    url: '/admin/cadastrar-produto',
    permission: 'productsEdit',
  },
  { title: 'Promoções', icon: Tag, url: '/promocoes', permission: 'settings' },
  { title: 'Páginas', icon: Files, url: '/admin/paginas', permission: 'settings' },
  { title: 'Blog', icon: FileText, url: '/blog', permission: 'settings' },
  { title: 'Mídia', icon: ImageIcon, url: '/midia', permission: 'settings' },
  { title: 'Gerar Catálogo', icon: BookOpen, url: '/admin/gerar-catalogo', permission: 'catalog' },
  { title: 'Usuários', icon: UsersIcon, url: '/usuarios', permission: 'users' },
  { title: 'Logs', icon: ScrollText, url: '/logs', permission: 'settings' },
  { title: 'Configurações', icon: Settings, url: '/configuracoes', permission: 'settings' },
]

const roleCan = (permission: string, role: string | undefined): boolean => {
  if (role === 'Admin') return true
  if (role === 'Editor') {
    return permission === 'products' || permission === 'productsEdit' || permission === 'catalog'
  }
  return permission === 'products' || permission === 'catalog'
}

export default function Layout() {
  const { isAuthenticated, user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated && location.pathname !== '/admin') {
      navigate('/admin')
    }
  }, [isAuthenticated, location.pathname, navigate])

  if (!isAuthenticated) {
    return null
  }

  const visibleItems = MENU_ITEMS.filter((i) => roleCan(i.permission, user?.role))
  const activeItem = visibleItems.find((i) => i.url === location.pathname)

  const handleLogout = () => {
    logout()
    navigate('/admin')
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/30">
        <Sidebar variant="sidebar" className="border-r-0 shadow-lg">
          <SidebarHeader className="h-16 flex items-center justify-center border-b border-sidebar-border/50">
            <h2 className="text-xl font-serif text-sidebar-primary tracking-widest font-bold">
              VITTORIO
            </h2>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {visibleItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={location.pathname === item.url}
                        className="my-1"
                      >
                        <Link to={item.url}>
                          <item.icon className="h-5 w-5" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="h-16 flex items-center justify-between px-6 bg-background border-b shadow-sm shrink-0">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden" />
              <Breadcrumb className="hidden md:flex">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to="/dashboard">Admin</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  {activeItem && activeItem.url !== '/dashboard' && (
                    <>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage>{activeItem.title}</BreadcrumbPage>
                      </BreadcrumbItem>
                    </>
                  )}
                </BreadcrumbList>
              </Breadcrumb>
              <h1 className="text-xl font-serif font-semibold md:hidden">
                {activeItem?.title || 'Painel'}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 border border-primary/10">
                      <AvatarFallback className="bg-secondary text-secondary-foreground font-serif">
                        {user?.name?.charAt(0) || 'A'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem className="flex-col items-start gap-1 p-3">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    <Badge variant="outline" className="mt-1 font-normal">
                      {roleLabel(user?.role)}
                    </Badge>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/conta')} className="cursor-pointer">
                    <KeyRound className="mr-2 h-4 w-4" />
                    <span>Minha Conta</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-6xl animate-fade-in-up">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
