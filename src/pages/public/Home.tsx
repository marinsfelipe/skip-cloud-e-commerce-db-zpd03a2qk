import { Link } from 'react-router-dom'
import { ArrowRight, ShieldCheck, Target, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSeo } from '@/hooks/use-seo'
import { useAssetStore } from '@/stores/use-asset-store'
import { useAuthStore } from '@/stores/use-auth-store'
import { ImageUploadOverlay } from '@/components/ImageUploadOverlay'

const FEATURED_LINES = [
  { id: 'strongest', name: 'Strongest', desc: 'Robustez extrema para alta demanda.' },
  { id: 'speciale', name: 'Speciale', desc: 'Projetos sob medida.' },
  { id: 'aprezzo', name: 'Aprezzo', desc: 'Exposição com visibilidade máxima.' },
  { id: 'fredda', name: 'Fredda', desc: 'Refrigeração premium.' },
]

export default function Home() {
  useSeo(
    'Início',
    'Vittorio Equipamentos Profissionais para Food Service. Excelência em Inox 304 e refrigeração.',
    'vittorio design, inox 304, refrigeração comercial, food service',
  )

  const { images, setImage } = useAssetStore()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center bg-muted overflow-hidden">
        <div className="absolute inset-0 group">
          {images['hero'] ? (
            <img
              src={images['hero']}
              alt="Hero"
              className="w-full h-full object-cover opacity-40"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-b from-card to-background" />
          )}
          {isAuthenticated && (
            <ImageUploadOverlay
              onUpload={(url) => setImage('hero', url)}
              label="Alterar Fundo Hero"
            />
          )}
        </div>

        <div className="container relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-foreground max-w-4xl mx-auto leading-tight animate-fade-in-up">
            Vittorio Equipamentos Profissionais para{' '}
            <span className="text-primary">Food Service</span>
          </h1>
          <p
            className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in-up"
            style={{ animationDelay: '100ms' }}
          >
            Elevando o padrão das cozinhas profissionais com design impecável e tecnologia de ponta.
          </p>
          <div
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up"
            style={{ animationDelay: '200ms' }}
          >
            <Button size="lg" asChild className="text-lg px-8">
              <Link to="/linhas">Conheça as Linhas</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8">
              <Link to="/catalogo">Ver Catálogo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Section: Missão, Visão, Valores */}
      <section className="py-24 bg-background">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif font-bold">Nossa Essência</h2>
            <div className="w-24 h-1 bg-primary mx-auto mt-4 rounded-full" />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-card border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <Target className="w-12 h-12 text-primary mx-auto mb-4" />
                <CardTitle className="font-serif text-2xl">Missão</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-muted-foreground">
                Fornecer equipamentos de excelência que potencializam a eficiência das operações
                gastronômicas.
              </CardContent>
            </Card>

            <Card className="bg-card border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <Zap className="w-12 h-12 text-primary mx-auto mb-4" />
                <CardTitle className="font-serif text-2xl">Visão</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-muted-foreground">
                Ser referência nacional em inovação e durabilidade no segmento de Food Service.
              </CardContent>
            </Card>

            <Card className="bg-card border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <ShieldCheck className="w-12 h-12 text-primary mx-auto mb-4" />
                <CardTitle className="font-serif text-2xl">Valores</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-muted-foreground">
                Qualidade intransigente, compromisso com o cliente, sustentabilidade e inovação
                contínua.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Lines Section */}
      <section className="py-24 bg-card/50">
        <div className="container px-4">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-serif font-bold">Linhas em Destaque</h2>
              <div className="w-24 h-1 bg-primary mt-4 rounded-full" />
            </div>
            <Button variant="ghost" asChild className="hidden sm:flex hover:text-primary">
              <Link to="/linhas">
                Ver todas <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURED_LINES.map((line) => (
              <Link
                key={line.id}
                to="/linhas"
                className="group block relative overflow-hidden rounded-xl bg-card border border-border hover:border-primary transition-colors"
              >
                <div className="aspect-[4/3] relative bg-muted">
                  {images[`line-${line.id}`] ? (
                    <img
                      src={images[`line-${line.id}`]}
                      alt={line.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      Sem imagem
                    </div>
                  )}
                  {isAuthenticated && (
                    <ImageUploadOverlay onUpload={(url) => setImage(`line-${line.id}`, url)} />
                  )}
                </div>
                <div className="p-6">
                  <h3 className="font-serif text-xl font-bold text-foreground mb-2">{line.name}</h3>
                  <p className="text-muted-foreground text-sm">{line.desc}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Button variant="outline" asChild className="w-full">
              <Link to="/linhas">Ver todas as linhas</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
