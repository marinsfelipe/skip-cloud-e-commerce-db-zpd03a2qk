import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Tag,
  FileText,
  ImageIcon,
  ScrollText,
  LogOut,
  Menu,
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
import { useAuthStore } from '@/stores/use-auth-store'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useEffect } from 'react'

const MENU_ITEMS = [
  { title: 'Dashboard', icon: LayoutDashboard, url: '/dashboard' },
  { title: 'Produtos', icon: Package, url: '/produtos' },
  { title: 'Promoções', icon: Tag, url: '/promocoes' },
  { title: 'Blog', icon: FileText, url: '/blog' },
  { title: 'Mídia', icon: ImageIcon, url: '/midia' },
  { title: 'Logs', icon: ScrollText, url: '/logs' },
]

export default function Layout() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated && location.pathname !== '/') {
      navigate('/')
    }
  }, [isAuthenticated, location.pathname, navigate])

  if (!isAuthenticated) {
    return <Outlet />
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
                  {MENU_ITEMS.map((item) => (
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
              <h1 className="text-xl font-serif font-semibold hidden sm:block">
                {MENU_ITEMS.find((i) => i.url === location.pathname)?.title || 'Painel'}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 border border-primary/10">
                      <AvatarFallback className="bg-secondary text-secondary-foreground font-serif">
                        {user?.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem className="flex-col items-start gap-1 p-3">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer">
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
