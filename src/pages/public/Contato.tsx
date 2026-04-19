import { useState } from 'react'
import { MapPin, Phone, Instagram, Send } from 'lucide-react'
import { useSeo } from '@/hooks/use-seo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCMS } from '@/hooks/use-cms'

export default function Contato() {
  useSeo('Contato', 'Entre em contato com a Vittorio Design.', 'contato')

  const { toast } = useToast()
  const { getPageContent, getSocialUrl } = useCMS()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const intro = getPageContent(
    'contato',
    'intro',
    'Estamos prontos para atender as necessidades do seu projeto com agilidade e precisão.',
  )
  const instagramUrl =
    getSocialUrl('instagram') || 'https://www.instagram.com/vittoriodesignoficial/'

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      toast({ title: 'Mensagem Enviada', description: 'Agradecemos o contato.' })
      ;(e.target as HTMLFormElement).reset()
    }, 1500)
  }

  return (
    <div className="py-20 bg-background min-h-screen">
      <div className="container px-4">
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
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Nome Completo *</Label>
                      <Input required className="bg-background" />
                    </div>
                    <div className="space-y-2">
                      <Label>E-mail *</Label>
                      <Input type="email" required className="bg-background" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Assunto *</Label>
                    <Select required>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Assunto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="orcamento">Solicitar Orçamento</SelectItem>
                        <SelectItem value="duvida">Dúvida Técnica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Mensagem *</Label>
                    <Textarea required className="min-h-[150px] bg-background" />
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
