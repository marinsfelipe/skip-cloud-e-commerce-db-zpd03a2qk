import { useState } from 'react'
import { Phone, Instagram, Send, CheckCircle2 } from 'lucide-react'
import { useSeo } from '@/hooks/use-seo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCMS } from '@/hooks/use-cms'
import pb from '@/lib/pocketbase/client'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { useLocation, useNavigate } from 'react-router-dom'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { X } from 'lucide-react'

export default function Contato() {
  useSeo('Contato', 'Entre em contato com a Vittorio Design.', 'contato')

  const { getPageContent, getSocialUrl, getPageImage } = useCMS()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const location = useLocation()
  const navigate = useNavigate()
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('success') === 'true') {
      setShowBanner(true)
      const timer = setTimeout(() => setShowBanner(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [location])

  const intro = getPageContent(
    'contato',
    'intro',
    'Estamos prontos para atender as necessidades do seu projeto com agilidade e precisão.',
  )
  const instagramUrl =
    getSocialUrl('instagram') || 'https://www.instagram.com/vittoriodesignoficial/'

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg('')
    setSuccessMsg('')

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
    }

    try {
      await pb.send('/backend/v1/contact', {
        method: 'POST',
        body: JSON.stringify(data),
      })

      const conf = await pb
        .collection('google_ads_config')
        .getFirstListItem('', { sort: '-created' })
        .catch(() => null)
      if (conf?.is_active && conf?.conversion_send_to && window.gtag) {
        window.gtag('event', 'conversion', { send_to: conf.conversion_send_to })
      }

      setSuccessMsg(
        'Mensagem enviada com sucesso. Você será redirecionado para a página de contatos.',
      )
      e.currentTarget.reset()

      setTimeout(() => {
        navigate('/contato?success=true', { replace: true })
      }, 2000)
    } catch (err) {
      const msg = getErrorMessage(err)
      setErrorMsg(
        msg || 'Ocorreu um erro ao enviar sua mensagem. Por favor, tente novamente mais tarde.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const bgImage = getPageImage('contato', 'background')

  return (
    <div className="relative py-20 min-h-screen">
      {bgImage ? (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${bgImage})` }}
          />
          <div className="absolute inset-0 bg-background/90 z-0" />
        </>
      ) : (
        <div className="absolute inset-0 bg-background z-0" />
      )}

      <div className="container relative z-10 px-4">
        {showBanner && (
          <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
            <AlertDescription className="flex justify-between items-center text-base font-medium">
              Obrigado! Sua mensagem foi enviada com sucesso para contato@vittoriodesign.com.br.
              Entraremos em contato em breve.
              <Button variant="ghost" size="icon" onClick={() => setShowBanner(false)}>
                <X className="h-4 w-4" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="text-center mb-16 animate-fade-in-up">
          <h1 className="text-4xl font-serif font-bold mb-4">Fale Conosco</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{intro}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          <div
            className="lg:col-span-1 space-y-6 animate-fade-in-up"
            style={{ animationDelay: '100ms' }}
          >
            <Card className="bg-card border-border hover:border-primary transition-colors">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">WhatsApp / Telefone</h3>
                  <a
                    href="https://wa.me/5521990451568"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    (21) 99045-1568
                  </a>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border hover:border-primary transition-colors">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                  <Instagram className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Instagram</h3>
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    @VittorioDesignOficial
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <Card className="bg-card border-border p-2">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {errorMsg && (
                    <div className="p-4 rounded-md bg-destructive/15 text-destructive text-sm font-medium">
                      {errorMsg}
                    </div>
                  )}
                  {successMsg && (
                    <div className="p-4 rounded-md bg-green-50 text-green-800 border border-green-200 text-sm font-medium flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      {successMsg}
                    </div>
                  )}
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome Completo *</Label>
                      <Input id="name" name="name" required className="bg-background" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className="bg-background"
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone *</Label>
                      <Input id="phone" name="phone" required className="bg-background" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Assunto *</Label>
                      <Input id="subject" name="subject" required className="bg-background" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Mensagem * (mín 10 caracteres)</Label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      minLength={10}
                      className="min-h-[150px] bg-background"
                    />
                  </div>
                  <Button type="submit" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? (
                      'Enviando...'
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Enviar Mensagem
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
