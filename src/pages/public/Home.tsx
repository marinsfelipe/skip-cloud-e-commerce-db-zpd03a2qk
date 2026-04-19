import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ShieldCheck, Target, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSeo } from '@/hooks/use-seo'
import { useCMS } from '@/hooks/use-cms'
import pb from '@/lib/pocketbase/client'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'

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

  const { getPageContent, getPageImage } = useCMS()
  const [blogPosts, setBlogPosts] = useState<any[]>([])

  const heroTitle = getPageContent(
    'home',
    'hero_title',
    'Vittorio Equipamentos Profissionais para <span class="text-primary">Food Service</span>',
  )
  const heroSubtitle = getPageContent(
    'home',
    'hero_subtitle',
    'Elevando o padrão das cozinhas profissionais com design impecável e tecnologia de ponta.',
  )
  const mission = getPageContent(
    'home',
    'mission',
    'Fornecer equipamentos de excelência que potencializam a eficiência das operações gastronômicas.',
  )
  const vision = getPageContent(
    'home',
    'vision',
    'Ser referência nacional em inovação e durabilidade no segmento de Food Service.',
  )
  const values = getPageContent(
    'home',
    'values',
    'Qualidade intransigente, compromisso com o cliente, sustentabilidade e inovação contínua.',
  )

  const heroImage =
    getPageImage('home', 'hero_background') ||
    'https://img.usecurling.com/p/1920/1080?q=modern%20industrial%20kitchen&color=black'
  const featuredBgImage = getPageImage('home', 'featured_lines')

  useEffect(() => {
    pb.collection('blog_posts')
      .getList(1, 6, { sort: '-created', expand: 'image' })
      .then((res) => setBlogPosts(res.items))
      .catch(console.error)
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      <section
        className="relative h-[80vh] min-h-[600px] flex items-center justify-center bg-muted overflow-hidden"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/60 z-0" />
        <div className="container relative z-10 text-center px-4">
          <h1
            className="text-4xl md:text-6xl font-serif font-bold text-white max-w-4xl mx-auto leading-tight animate-fade-in-up"
            dangerouslySetInnerHTML={{ __html: heroTitle }}
          />
          <p
            className="mt-6 text-xl text-gray-300 max-w-2xl mx-auto animate-fade-in-up"
            style={{ animationDelay: '100ms' }}
          >
            {heroSubtitle}
          </p>
          <div
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up"
            style={{ animationDelay: '200ms' }}
          >
            <Button size="lg" asChild className="text-lg px-8">
              <Link to="/linhas">Conheça as Linhas</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="text-lg px-8 bg-transparent text-white border-white hover:bg-white hover:text-black"
            >
              <Link to="/catalogo">Ver Catálogo</Link>
            </Button>
          </div>
        </div>
      </section>

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
              <CardContent className="text-center text-muted-foreground">{mission}</CardContent>
            </Card>
            <Card className="bg-card border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <Zap className="w-12 h-12 text-primary mx-auto mb-4" />
                <CardTitle className="font-serif text-2xl">Visão</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-muted-foreground">{vision}</CardContent>
            </Card>
            <Card className="bg-card border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <ShieldCheck className="w-12 h-12 text-primary mx-auto mb-4" />
                <CardTitle className="font-serif text-2xl">Valores</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-muted-foreground">{values}</CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-24 relative overflow-hidden text-white bg-zinc-950">
        {featuredBgImage && (
          <div
            className="absolute inset-0 opacity-20 bg-cover bg-center"
            style={{ backgroundImage: `url(${featuredBgImage})` }}
          />
        )}
        <div className="container relative z-10 px-4">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-serif font-bold">Linhas em Destaque</h2>
              <div className="w-24 h-1 bg-primary mt-4 rounded-full" />
            </div>
            <Button
              variant="ghost"
              asChild
              className="hidden sm:flex hover:text-primary text-white"
            >
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
                className="group block relative overflow-hidden rounded-xl bg-black/50 border border-white/10 hover:border-primary transition-colors backdrop-blur-sm"
              >
                <div className="aspect-[4/3] relative bg-muted/20 flex items-center justify-center text-muted-foreground">
                  <span className="text-xs uppercase tracking-widest text-white/50">
                    {line.name}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="font-serif text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
                    {line.name}
                  </h3>
                  <p className="text-gray-400 text-sm">{line.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {blogPosts.length > 0 && (
        <section className="py-24 bg-card border-t border-border">
          <div className="container px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-serif font-bold">Últimas do Blog</h2>
              <div className="w-24 h-1 bg-primary mx-auto mt-4 rounded-full" />
            </div>

            <Carousel opts={{ align: 'start', loop: true }} className="w-full">
              <CarouselContent className="-ml-4">
                {blogPosts.map((post) => {
                  const imgUrl = post.expand?.image
                    ? pb.files.getURL(post.expand.image, post.expand.image.file)
                    : 'https://img.usecurling.com/p/400/300?q=kitchen'
                  return (
                    <CarouselItem key={post.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                      <div className="rounded-xl border bg-background overflow-hidden hover:shadow-lg transition-shadow group h-full flex flex-col">
                        <div className="aspect-video relative overflow-hidden">
                          <img
                            src={imgUrl}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                          <h3 className="text-xl font-serif font-bold mb-2 line-clamp-2">
                            {post.title}
                          </h3>
                          <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-1">
                            {post.content.replace(/<[^>]*>?/gm, '')}
                          </p>
                          <Button variant="link" className="px-0 self-start text-primary">
                            Ler mais <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </CarouselItem>
                  )
                })}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex" />
              <CarouselNext className="hidden md:flex" />
            </Carousel>
          </div>
        </section>
      )}
    </div>
  )
}
