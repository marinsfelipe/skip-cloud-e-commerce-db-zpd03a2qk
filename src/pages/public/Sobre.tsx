import { CheckCircle2 } from 'lucide-react'
import { useSeo } from '@/hooks/use-seo'
import { useCMS } from '@/hooks/use-cms'

const DIFFERENTIATORS = [
  {
    title: 'Inox 304',
    desc: 'Aço inoxidável de grau superior, garantindo máxima durabilidade.',
  },
  {
    title: 'Self-contained',
    desc: 'Sistemas independentes e compactos que não exigem casa de máquinas externa.',
  },
  {
    title: 'Fluidos Refrigerantes Especiais',
    desc: 'Utilização de R290, R404A e R134A para máxima eficiência energética.',
  },
  {
    title: 'Padrão FAT',
    desc: 'Atendemos rigorosamente aos requisitos FAT.',
  },
]

export default function Sobre() {
  useSeo('Sobre Nós', 'Conheça a Vittorio Design, nossa história e diferenciais.', 'sobre')

  const { getPageContent } = useCMS()
  const intro = getPageContent(
    'sobre',
    'intro',
    'A Vittorio Design nasceu do desejo de revolucionar as cozinhas profissionais. Unimos a engenharia de ponta à tradição do design italiano.',
  )

  return (
    <div className="py-20 animate-fade-in-up">
      <div className="container px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-6">Sobre a Vittorio</h1>
          <div
            className="text-xl text-muted-foreground leading-relaxed"
            dangerouslySetInnerHTML={{ __html: intro }}
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
          <div className="relative aspect-video rounded-xl overflow-hidden bg-muted border border-border group">
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-lg">
              [Imagem da Fábrica / Operação]
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-serif font-bold mb-6">Nossos Diferenciais Técnicos</h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Cada detalhe dos nossos equipamentos é pensado para suportar a rotina exaustiva.
            </p>
            <div className="space-y-6">
              {DIFFERENTIATORS.map((diff, i) => (
                <div key={i} className="flex gap-4">
                  <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-foreground text-lg">{diff.title}</h3>
                    <p className="text-muted-foreground">{diff.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
