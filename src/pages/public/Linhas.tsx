import { useSeo } from '@/hooks/use-seo'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCMS } from '@/hooks/use-cms'

const DEFAULT_LINES = [
  {
    id: 'strongest',
    name: 'Strongest',
    desc: 'Equipamentos robustos estruturados para resistir à alta demanda e operações contínuas e intensas.',
  },
  {
    id: 'cucinare',
    name: 'Cucinare',
    desc: 'Soluções completas e modulares para cozinhas profissionais de alto padrão e alta produtividade.',
  },
  {
    id: 'fredda',
    name: 'Fredda',
    desc: 'Linha premium de refrigeração e conservação de alimentos com precisão térmica.',
  },
  {
    id: 'aprezzo',
    name: 'Aprezzo',
    desc: 'Vitrines expositoras que unem alta visibilidade à conservação perfeita dos produtos.',
  },
  {
    id: 'speciale',
    name: 'Speciale',
    desc: 'Projetos totalmente customizados para atender às necessidades específicas do seu negócio.',
  },
  {
    id: 'visione',
    name: 'Visione',
    desc: 'Expositores verticais com design minimalista, clean e máxima transparência para autoatendimento.',
  },
  {
    id: 'perfecto-gusto',
    name: 'Perfecto Gusto',
    desc: 'Equipamentos refinados para a conservação e exposição ideal de vinhos e bebidas nobres.',
  },
  {
    id: 'ideale',
    name: 'Ideale',
    desc: 'Soluções versáteis e inteligentes projetadas para maximizar a eficiência em espaços compactos.',
  },
  {
    id: 'progetto',
    name: 'Progetto',
    desc: 'Mobiliário em Inox 304 fabricado sob medida para encaixe perfeito no seu projeto arquitetônico.',
  },
]

export default function Linhas() {
  useSeo(
    'Linhas de Produtos',
    'Conheça nossas 9 linhas exclusivas de equipamentos para Food Service.',
    'linhas vittorio, strongest, cucinare, fredda, aprezzo, speciale, visione, perfecto gusto, ideale, progetto',
  )

  const { getPageContent } = useCMS()

  return (
    <div className="py-20 bg-background min-h-screen">
      <div className="container px-4">
        <div className="text-center mb-16 animate-fade-in-up">
          <h1 className="text-4xl font-serif font-bold mb-4">
            {getPageContent('linhas', 'title', 'Nossas Linhas')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {getPageContent(
              'linhas',
              'subtitle',
              'Descubra o portfólio completo da Vittorio Design. Engenharia de precisão para cada necessidade do seu negócio.',
            )}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {DEFAULT_LINES.map((line, idx) => (
            <Card
              key={line.id}
              className="bg-card border-border overflow-hidden hover:border-primary transition-colors group animate-fade-in-up"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="aspect-[4/3] bg-muted relative flex items-center justify-center text-muted-foreground">
                <span className="font-serif text-2xl opacity-20">{line.name}</span>
              </div>
              <CardHeader>
                <CardTitle className="font-serif text-2xl text-primary">{line.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {getPageContent('linhas', `desc_${line.id}`, line.desc)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
