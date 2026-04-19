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

export default function Contato() {
  useSeo(
    'Contato',
    'Entre em contato com a Vittorio Design. Solicite orçamentos ou tire dúvidas.',
    'contato vittorio design, telefone, endereço, itaboraí, orçamento',
  )

  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate sending email to contato@vittoriodesign.com.br
    setTimeout(() => {
      setIsSubmitting(false)
      toast({
        title: 'Mensagem Enviada',
        description: 'Agradecemos o contato. Retornaremos em breve.',
      })
      ;(e.target as HTMLFormElement).reset()
    }, 1500)
  }

  return (
    <div className="py-20 bg-background min-h-screen">
      <div className="container px-4">
        <div className="text-center mb-16 animate-fade-in-up">
          <h1 className="text-4xl font-serif font-bold mb-4">Fale Conosco</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Estamos prontos para atender as necessidades do seu projeto com agilidade e precisão.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Info Cards */}
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
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Endereço (Fábrica)</h3>
                  <p className="text-muted-foreground">
                    Itaboraí - RJ
                    <br />
                    Brasil
                  </p>
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
                    href="https://instagram.com/VittorioDesignOficial"
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

          {/* Contact Form */}
          <div className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <Card className="bg-card border-border p-2">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome Completo *</Label>
                      <Input id="name" required placeholder="Seu nome" className="bg-background" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        placeholder="seu@email.com"
                        className="bg-background"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone / WhatsApp *</Label>
                      <Input
                        id="phone"
                        required
                        placeholder="(00) 00000-0000"
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Assunto *</Label>
                      <Select required name="subject">
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Selecione o assunto" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="orcamento">Solicitar Orçamento</SelectItem>
                          <SelectItem value="duvida">Dúvida Técnica</SelectItem>
                          <SelectItem value="parceria">Parceria Comercial</SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Mensagem *</Label>
                    <Textarea
                      id="message"
                      required
                      placeholder="Como podemos ajudar?"
                      className="min-h-[150px] bg-background"
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full sm:w-auto"
                    disabled={isSubmitting}
                  >
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

        {/* Map Embedding Placeholder */}
        <div
          className="mt-16 rounded-xl overflow-hidden border border-border h-[400px] bg-muted animate-fade-in-up"
          style={{ animationDelay: '300ms' }}
        >
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d117765.26909569032!2d-43.01353106197176!3d-22.72382101340156!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x999ac8f1dbb1bf%3A0xc6ba3fb7a89ff705!2sItabora%C3%AD%20-%20RJ!5e0!3m2!1spt-BR!2sbr!4v1715000000000!5m2!1spt-BR!2sbr"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Localização Vittorio Design"
          />
        </div>
      </div>
    </div>
  )
}
