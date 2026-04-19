import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from './components/Layout'
import Index from './pages/Index'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Promotions from './pages/Promotions'
import Blog from './pages/Blog'
import Media from './pages/Media'
import Logs from './pages/Logs'
import NotFound from './pages/NotFound'

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/produtos" element={<Products />} />
          <Route path="/promocoes" element={<Promotions />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/midia" element={<Media />} />
          <Route path="/logs" element={<Logs />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </BrowserRouter>
)

export default App
