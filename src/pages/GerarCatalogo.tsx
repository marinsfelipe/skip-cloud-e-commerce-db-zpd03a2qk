import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import {
  BookOpen,
  ExternalLink,
  Loader2,
  Save,
  Coins,
  EyeOff,
  Paintbrush,
  Sparkles,
} from 'lucide-react'

export type CatalogLayout = 'site' | 'template'

export interface CatalogConfig {
  layout: CatalogLayout
  show_prices: boolean
  title: string
  subtitle: string
  contact_info: string
  cover_image: string
}

const DEFAULT_CONFIG: CatalogConfig = {
  layout: 'site',
  show_prices: true,
  title: 'Catálogo de Equipamentos',
  subtitle: 'Vittorio Design — Equipamentos Profissionais para Food Service',
  contact_info: 'contato@vittoriodesign.com.br • (21) 99045-1568 • Itaboraí - RJ',
  cover_image: '',
}

export default function GerarCatalogo() {
  const [config, setConfig] = useState<CatalogConfig>(DEFAULT_CONFIG)
  const [configId, setConfigId] = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string>('')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const list = await pb
          .collection('catalog_generator_config')
          .getList(1, 1, { sort: '-updated' })
        if (cancelled) return
        if (list.items.length > 0) {
          const rec = list.items[0]
          setConfigId(rec.id)
          setConfig({
            layout: (rec.layout as CatalogLayout) || 'site',
            show_prices: rec.show_prices ?? true,
            title: rec.title || DEFAULT_CONFIG.title,
            subtitle: rec.subtitle || DEFAULT_CONFIG.subtitle,
            contact_info: rec.contact_info || DEFAULT_CONFIG.contact_info,
            cover_image: rec.cover_image || '',
          })
          if (rec.cover_image) {
            setCoverPreview(pb.files.getURL(rec, rec.cover_image))
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  const handleSave = async (openAfter: boolean) => {
    setSaving(true)
    try {
      let rec: any = null
      if (configId) {
        rec = await pb.collection('catalog_generator_config').update(configId, {
          layout: config.layout,
          show_prices: config.show_prices,
          title: config.title,
          subtitle: config.subtitle,
          contact_info: config.contact_info,
          updated_by: user?.id,
        })
      } else {
        rec = await pb.collection('catalog_generator_config').create({
          layout: config.layout,
          show_prices: config.show_prices,
          title: config.title,
          subtitle: config.subtitle,
          contact_info: config.contact_info,
          updated_by: user?.id,
        })
        setConfigId(rec.id)
      }

      if (coverFile && rec) {
        const fd = new FormData()
        fd.append('cover_image', coverFile)
        rec = await pb.collection('catalog_generator_config').update(rec.id, fd)
        setCoverFile(null)
        setCoverPreview(pb.files.getURL(rec, rec.cover_image))
      }

      toast({
        title: 'Configuração salva',
        description: 'A configuração do catálogo foi atualizada.',
      })
      if (openAfter) {
        navigate(
          `/catalogo-gerado?layout=${config.layout}&precos=${config.show_prices ? '1' : '0'}`,
        )
      }
    } catch (err: any) {
      console.error(err)
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
        description: err?.message || 'Tente novamente.',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando configuração...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold tracking-tight">Gerar Catálogo</h2>
          <p className="text-muted-foreground">
            Monte automaticamente um catálogo a partir dos equipamentos cadastrados.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/catalogo-gerado">
            <ExternalLink className="mr-2 h-4 w-4" /> Ver catálogo atual
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl">Configuração do Catálogo</CardTitle>
          <CardDescription>
            As opções abaixo definem como o catálogo será gerado a partir dos produtos do site.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <Label className="text-base font-medium">Layout</Label>
            </div>
            <RadioGroup
              value={config.layout}
              onValueChange={(v: CatalogLayout) => setConfig({ ...config, layout: v })}
              className="grid md:grid-cols-2 gap-4"
            >
              <Label
                htmlFor="layout-site"
                className={`flex flex-col gap-2 rounded-xl border p-5 cursor-pointer transition-colors ${
                  config.layout === 'site' ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="site" id="layout-site" />
                  <span className="font-serif font-semibold">Layout do Site</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  Identidade visual Vittorio Design: grafite, dourado e fontes do site.
                </span>
              </Label>
              <Label
                htmlFor="layout-template"
                className={`flex flex-col gap-2 rounded-xl border p-5 cursor-pointer transition-colors ${
                  config.layout === 'template' ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="template" id="layout-template" />
                  <span className="font-serif font-semibold">Template Pré-fabricado</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  Design profissional limpo: branco, tipografia neutra e grade de produtos.
                </span>
              </Label>
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-primary" />
              <Label className="text-base font-medium">Preços</Label>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border p-5">
              <div className="space-y-1">
                <Label htmlFor="show-prices" className="font-medium">
                  {config.show_prices ? 'Mostrar preços' : 'Ocultar preços'}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {config.show_prices
                    ? 'O catálogo exibirá o valor de cada equipamento.'
                    : 'Ideal para revendedores: nenhum valor será exibido.'}
                </p>
              </div>
              <Switch
                id="show-prices"
                checked={config.show_prices}
                onCheckedChange={(v) => setConfig({ ...config, show_prices: v })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Paintbrush className="h-4 w-4 text-primary" />
              <Label className="text-base font-medium">Capa e informações</Label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cat-title">Título da capa</Label>
                <Input
                  id="cat-title"
                  value={config.title}
                  onChange={(e) => setConfig({ ...config, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-subtitle">Subtítulo</Label>
                <Input
                  id="cat-subtitle"
                  value={config.subtitle}
                  onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="cat-contact">Informações de contato (capa e contracapa)</Label>
                <Textarea
                  id="cat-contact"
                  rows={2}
                  value={config.contact_info}
                  onChange={(e) => setConfig({ ...config, contact_info: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Imagem de capa (opcional — deve ser uma imagem já existente)</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg, image/png, image/webp"
                  onChange={handleCoverSelect}
                  className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
                {coverPreview && (
                  <img
                    src={coverPreview}
                    alt="Pré-visualização da capa"
                    className="mt-2 max-h-40 rounded-lg border border-border object-contain"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-border">
            <Button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="flex-1 sm:flex-none"
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <BookOpen className="mr-2 h-4 w-4" />
              )}
              Gerar catálogo
            </Button>
            <Button onClick={() => handleSave(false)} disabled={saving} variant="outline">
              <Save className="mr-2 h-4 w-4" /> Salvar configuração
            </Button>
            {!config.show_prices && (
              <span className="flex items-center text-sm text-muted-foreground sm:ml-auto">
                <EyeOff className="mr-2 h-4 w-4" /> Versão sem preços ativa
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        O catálogo é gerado em tempo real a partir dos produtos cadastrados em Config. Produtos —
        nenhum dado é duplicado. O link{' '}
        <Link to="/catalogo-gerado" className="underline">
          /catalogo-gerado
        </Link>{' '}
        pode ser compartilhado com clientes e revendedores.
      </p>
    </div>
  )
}
