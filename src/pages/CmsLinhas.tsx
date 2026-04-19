import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { ImageIcon, Save, Loader2 } from 'lucide-react'
import { MediaPicker } from '@/components/MediaPicker'

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

export default function CmsLinhas() {
  const [pages, setPages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [activeLine, setActiveLine] = useState<string | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState<
    Record<string, { desc: string; image?: string; imageUrl?: string }>
  >({})

  const loadData = async () => {
    try {
      const records = await pb
        .collection('pages')
        .getFullList({ filter: 'page_name = "linhas"', expand: 'image' })
      setPages(records)

      const newFormData: Record<string, { desc: string; image?: string; imageUrl?: string }> = {}
      DEFAULT_LINES.forEach((line) => {
        const record = records.find((r) => r.section_name === `desc_${line.id}`)
        newFormData[line.id] = {
          desc: record?.content || line.desc,
          image: record?.image || undefined,
          imageUrl: record?.expand?.image
            ? pb.files.getURL(record.expand.image, record.expand.image.file)
            : undefined,
        }
      })
      setFormData(newFormData)
    } catch (e) {
      toast({ title: 'Erro ao carregar dados', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSave = async (lineId: string) => {
    setSaving(lineId)
    try {
      const sectionName = `desc_${lineId}`
      const existing = pages.find((p) => p.section_name === sectionName)
      const data = {
        page_name: 'linhas',
        section_name: sectionName,
        content: formData[lineId].desc,
        image: formData[lineId].image || null,
      }

      if (existing) {
        await pb.collection('pages').update(existing.id, data)
      } else {
        await pb.collection('pages').create(data)
      }

      toast({ title: 'Salvo com sucesso!' })
      loadData()
    } catch (e) {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    } finally {
      setSaving(null)
    }
  }

  if (loading)
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="animate-spin" />
      </div>
    )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">CMS - Linhas de Produtos</h2>
        <p className="text-muted-foreground">
          Gerencie o conteúdo e as imagens da página de Linhas.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {DEFAULT_LINES.map((line) => (
          <Card key={line.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{line.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 space-y-4 flex flex-col">
              <div className="space-y-2">
                <label className="text-sm font-medium">Descrição</label>
                <Textarea
                  value={formData[line.id]?.desc || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      [line.id]: { ...prev[line.id], desc: e.target.value },
                    }))
                  }
                  className="resize-none h-24"
                />
              </div>

              <div className="space-y-2 flex-1">
                <label className="text-sm font-medium">Imagem Destacada</label>
                {formData[line.id]?.imageUrl ? (
                  <div className="relative aspect-video rounded-md overflow-hidden border bg-muted">
                    <img
                      src={formData[line.id].imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video rounded-md border border-dashed flex items-center justify-center bg-muted/50 text-muted-foreground">
                    Nenhuma imagem
                  </div>
                )}
                <Button
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => {
                    setActiveLine(line.id)
                    setPickerOpen(true)
                  }}
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Alterar Imagem
                </Button>
              </div>

              <Button
                className="w-full mt-4"
                onClick={() => handleSave(line.id)}
                disabled={saving === line.id}
              >
                {saving === line.id ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Salvar Alterações
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <MediaPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={(id, url) => {
          if (activeLine) {
            setFormData((prev) => ({
              ...prev,
              [activeLine]: { ...prev[activeLine], image: id, imageUrl: url },
            }))
          }
        }}
      />
    </div>
  )
}
