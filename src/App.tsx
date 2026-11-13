import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from './components/Layout'
import PublicLayout from './components/PublicLayout'
import AdminLogin from './pages/AdminLogin'
import ResetPassword from './pages/ResetPassword'
import Home from './pages/public/Home'
import Sobre from './pages/public/Sobre'
import Linhas from './pages/public/Linhas'
import Produtos from './pages/public/Produtos'
import ProdutoDetalhes from './pages/public/ProdutoDetalhes'
import Catalogo from './pages/public/Catalogo'
import Contato from './pages/public/Contato'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Promotions from './pages/Promotions'
import Blog from './pages/Blog'
import Media from './pages/Media'
import Logs from './pages/Logs'
import UsersPage from './pages/Users'
import SettingsPage from './pages/SettingsPage'
import CmsLinhas from './pages/CmsLinhas'
import Leads from './pages/Leads'
import CustomPages from './pages/CustomPages'
import CustomPage from './pages/public/CustomPage'
// nota: 'future' flags removidas — a versão do react-router do projeto não as exporta
import GerarCatalogo from './pages/GerarCatalogo'
import CadastrarProduto from './pages/CadastrarProduto'
import CatalogoGerado from './pages/public/CatalogoGerado'
import MinhaConta from './pages/MinhaConta'
import NotFound from './pages/NotFound'
import { AuthProvider } from './hooks/use-auth'
import { GoogleAdsProvider } from './components/GoogleAdsProvider'
import { AnalyticsTracker } from './components/AnalyticsTracker'
import RequirePermission from './components/RequirePermission'

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <AnalyticsTracker />
      <GoogleAdsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/sobre" element={<Sobre />} />
              <Route path="/linhas" element={<Linhas />} />
              <Route path="/produtos" element={<Produtos />} />
              <Route path="/produtos/:id" element={<ProdutoDetalhes />} />
              <Route path="/catalogo" element={<Catalogo />} />
              <Route path="/contato" element={<Contato />} />
              <Route path="/p/:slug" element={<CustomPage />} />
            </Route>
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/reset-password" element={<ResetPassword />} />
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route
                path="/admin/config-produtos"
                element={
                  <RequirePermission permission="products">
                    <Products />
                  </RequirePermission>
                }
              />
              <Route
                path="/admin/cadastrar-produto"
                element={
                  <RequirePermission permission="productsEdit">
                    <CadastrarProduto />
                  </RequirePermission>
                }
              />
              <Route
                path="/promocoes"
                element={
                  <RequirePermission permission="settings">
                    <Promotions />
                  </RequirePermission>
                }
              />
              <Route
                path="/blog"
                element={
                  <RequirePermission permission="settings">
                    <Blog />
                  </RequirePermission>
                }
              />
              <Route
                path="/midia"
                element={
                  <RequirePermission permission="settings">
                    <Media />
                  </RequirePermission>
                }
              />
              <Route
                path="/logs"
                element={
                  <RequirePermission permission="settings">
                    <Logs />
                  </RequirePermission>
                }
              />
              <Route
                path="/usuarios"
                element={
                  <RequirePermission permission="users">
                    <UsersPage />
                  </RequirePermission>
                }
              />
              <Route
                path="/configuracoes"
                element={
                  <RequirePermission permission="settings">
                    <SettingsPage />
                  </RequirePermission>
                }
              />
              <Route
                path="/mensagens"
                element={
                  <RequirePermission permission="settings">
                    <Leads />
                  </RequirePermission>
                }
              />
              <Route
                path="/cms/linhas"
                element={
                  <RequirePermission permission="settings">
                    <CmsLinhas />
                  </RequirePermission>
                }
              />
              <Route
                path="/admin/paginas"
                element={
                  <RequirePermission permission="settings">
                    <CustomPages />
                  </RequirePermission>
                }
              />
              <Route
                path="/admin/gerar-catalogo"
                element={
                  <RequirePermission permission="catalog">
                    <GerarCatalogo />
                  </RequirePermission>
                }
              />
              <Route path="/conta" element={<MinhaConta />} />
            </Route>
            <Route path="/catalogo-gerado" element={<CatalogoGerado />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </GoogleAdsProvider>
    </BrowserRouter>
  </AuthProvider>
)

export default App
