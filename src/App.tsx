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
import NotFound from './pages/NotFound'
import { AuthProvider } from './hooks/use-auth'

const App = () => (
  <AuthProvider>
    <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/sobre" element={<Sobre />} />
            <Route path="/linhas" element={<Linhas />} />
            <Route path="/catalogo" element={<Catalogo />} />
            <Route path="/contato" element={<Contato />} />
          </Route>
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/reset-password" element={<ResetPassword />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/produtos" element={<Products />} />
            <Route path="/promocoes" element={<Promotions />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/midia" element={<Media />} />
            <Route path="/logs" element={<Logs />} />
            <Route path="/usuarios" element={<UsersPage />} />
            <Route path="/configuracoes" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </AuthProvider>
)

export default App
