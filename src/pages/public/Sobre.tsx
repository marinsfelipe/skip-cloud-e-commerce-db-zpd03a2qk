import { CheckCircle2 } from 'lucide-react'
import { useSeo } from '@/hooks/use-seo'
import { useAssetStore } from '@/stores/use-asset-store'
import { useAuthStore } from '@/stores/use-auth-store'
import { ImageUploadOverlay } from '@/components/ImageUploadOverlay'

const DIFFERENTIATORS = [
  {
    title: 'Inox 304',
    desc: 'Aço inoxidável de grau superior, garantindo máxima durabilidade, resistência à corrosão e facilidade de higienização.',
  },
  {
    title: 'Self-contained',
    desc: 'Sistemas independentes e compactos que não exigem casa de máquinas externa, otimizando o espaço da sua cozinha.',
  },
  {
    title: 'Fluidos Refrigerantes Especiais',
    desc: 'Utilização de R290, R404A e R134A para máxima eficiência energética e respeito às normas ambientais.',
  },
  {
    title: 'Alta Performance',
    desc: 'Projetados para operar com excelência mesmo em condições extremas de até 42°C e 65% de Umidade Relativa (UR).',
  },
  {
    title: 'Padrão FAT',
    desc: 'Atendemos rigorosamente aos requisitos FAT (Factory Acceptance Testing), assegurando que o equipamento sai de fábrica testado e aprovado.',
  },
]

export default function Sobre() {
  useSeo(
    'Sobre Nós',
    'Conheça a Vittorio Design, nossa história e nossos diferenciais técnicos na fabricação de equipamentos.',
    'vittorio design, sobre, inox 304, refrigeração comercial, equipamentos para cozinha',
  )

  const { images, setImage } = useAssetStore()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return (
    <div className="py-20 animate-fade-in-up">
      <div className="container px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-6">Sobre a Vittorio</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            A Vittorio Design nasceu do desejo de revolucionar as cozinhas profissionais. Unimos a
            engenharia de ponta à tradição do design italiano para criar soluções que não apenas
            funcionam com precisão absoluta, mas também elevam o aspecto visual do seu
            estabelecimento.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
          <div className="relative aspect-video rounded-xl overflow-hidden bg-muted border border-border group">
            {images['about'] ? (
              <img
                src={images['about']}
                alt="Fábrica Vittorio"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-lg">
                [Imagem da Fábrica / Operação]
              </div>
            )}
            {isAuthenticated && (
              <ImageUploadOverlay
                onUpload={(url) => setImage('about', url)}
                label="Alterar Imagem Sobre"
              />
            )}
          </div>
          <div>
            <h2 className="text-3xl font-serif font-bold mb-6">Nossos Diferenciais Técnicos</h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Cada detalhe dos nossos equipamentos é pensado para suportar a rotina exaustiva do
              food service, entregando confiabilidade sem precedentes.
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
