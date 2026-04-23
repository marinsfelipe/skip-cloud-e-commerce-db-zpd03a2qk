import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'
import { MediaSelector } from '@/components/MediaSelector'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

export default function SettingsPage() {
  const [socialLinks, setSocialLinks] = useState<any[]>([])
  const [pages, setPages] = useState<any[]>([])
  const [logoUrl, setLogoUrl] = useState('')
  const [adsConfig, setAdsConfig] = useState<any>({
    tag_id: '',
    conversion_send_to: '',
    is_active: false,
  })
  const { toast } = useToast()

  const loadData = async () => {
    try {
      const s = await pb.collection('social_links').getFullList()
      setSocialLinks(s)
      const p = await pb.collection('pages').getFullList({ expand: 'image' })
      setPages(p)
      const st = await pb
        .collection('settings')
        .getFirstListItem('key="site_logo"')
        .catch(() => null)
      if (st && st.file) {
        setLogoUrl(pb.files.getURL(st, st.file))
      }

      const ads = await pb
        .collection('google_ads_config')
        .getFirstListItem('', { sort: '-created' })
        .catch(() => null)
      if (ads) setAdsConfig(ads)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleUpdateSocial = async (id: string, url: string) => {
    try {
      await pb.collection('social_links').update(id, { url })
      toast({ title: 'Link atualizado' })
      loadData()
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erro ao atualizar' })
    }
  }

  const handleUpdatePage = async (id: string, content: string) => {
    try {
      await pb.collection('pages').update(id, { content })
      toast({ title: 'Conteúdo atualizado' })
      loadData()
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erro ao atualizar' })
    }
  }

  const handleUpdatePageImage = async (id: string, imageId: string) => {
    try {
      await pb.collection('pages').update(id, { image: imageId })
      toast({ title: 'Imagem atualizada' })
      loadData()
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erro ao atualizar imagem' })
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)

    try {
      const st = await pb
        .collection('settings')
        .getFirstListItem('key="site_logo"')
        .catch(() => null)
      if (st) {
        await pb.collection('settings').update(st.id, formData)
      } else {
        formData.append('key', 'site_logo')
        await pb.collection('settings').create(formData)
      }
      toast({ title: 'Logo atualizado com sucesso' })
      loadData()
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erro ao atualizar logo' })
    }
  }

  const handleSaveAdsConfig = async () => {
    try {
      if (adsConfig.id) {
        await pb.collection('google_ads_config').update(adsConfig.id, adsConfig)
      } else {
        await pb.collection('google_ads_config').create(adsConfig)
      }
      await pb.collection('audit_log').create({ action: 'update_ads_config', details: adsConfig })
      toast({ title: 'Configuração do Google Ads salva' })
      loadData()
    } catch (e) {
      toast({ variant: 'destructive', title: 'Erro ao salvar configuração' })
    }
  }

  const checkAdsStatus = async () => {
    try {
      const res = await pb.send('/backend/v1/analytics/google-ads-status', { method: 'GET' })
      toast({
        title: 'Status do Google Ads (Deploy)',
        description: `Ativo: ${res.is_active ? 'Sim' : 'Não'} | Tag: ${res.tag_id || 'N/A'}`,
      })
    } catch (e) {
      toast({ variant: 'destructive', title: 'Erro ao checar status' })
    }
  }

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-serif font-bold">Configurações & CMS</h2>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Configuração Google Ads</CardTitle>
          <Button variant="outline" size="sm" onClick={checkAdsStatus}>
            Testar Deploy
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Tag ID (ex: AW-18109323512)</Label>
              <Input
                value={adsConfig?.tag_id || ''}
                onChange={(e) => setAdsConfig({ ...adsConfig, tag_id: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Conversion Send To (ex: AW-18109323512/XXXXX)</Label>
              <Input
                value={adsConfig?.conversion_send_to || ''}
                onChange={(e) => setAdsConfig({ ...adsConfig, conversion_send_to: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2 sm:col-span-2">
              <Checkbox
                id="ads-active"
                checked={adsConfig?.is_active || false}
                onCheckedChange={(c) => setAdsConfig({ ...adsConfig, is_active: !!c })}
              />
              <Label htmlFor="ads-active">Ativar Google Ads Global</Label>
            </div>
          </div>
          <Button onClick={handleSaveAdsConfig}>Salvar Configuração Ads</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Identidade Visual (Logo)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6">
            <div className="bg-muted p-4 rounded-md border flex items-center justify-center w-[200px] h-[100px]">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Logo Atual"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <span className="text-muted-foreground text-sm">Sem Logo</span>
              )}
            </div>
            <div className="space-y-2">
              <Label>Alterar Logo (máx 150px largura ideal)</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="max-w-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Links Sociais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {socialLinks.map((s) => (
            <div key={s.id} className="space-y-1">
              <Label>{s.platform}</Label>
              <Input
                defaultValue={s.url}
                onBlur={(e) => {
                  if (e.target.value !== s.url) handleUpdateSocial(s.id, e.target.value)
                }}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conteúdo das Páginas (CMS)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {pages.map((p) => (
            <div key={p.id} className="space-y-2 border-b border-border pb-4 last:border-0">
              <Label className="text-primary font-semibold block capitalize">
                {p.page_name} - {p.section_name.replace('_', ' ')}
              </Label>
              {p.type === 'editor' ? (
                <Textarea
                  defaultValue={p.content}
                  onBlur={(e) => {
                    if (e.target.value !== p.content) handleUpdatePage(p.id, e.target.value)
                  }}
                  className="min-h-[120px]"
                />
              ) : p.type === 'image' ? (
                <div className="flex items-center gap-4">
                  {p.expand?.image ? (
                    <img
                      src={pb.files.getURL(p.expand.image, p.expand.image.file)}
                      className="h-24 w-32 object-cover rounded border"
                      alt="Imagem da Página"
                    />
                  ) : (
                    <div className="h-24 w-32 bg-muted rounded border flex items-center justify-center text-xs text-muted-foreground">
                      Sem imagem
                    </div>
                  )}
                  <MediaSelector
                    selectedId={p.image}
                    onSelect={(id) => handleUpdatePageImage(p.id, id)}
                  />
                </div>
              ) : (
                <Input
                  defaultValue={p.content}
                  onBlur={(e) => {
                    if (e.target.value !== p.content) handleUpdatePage(p.id, e.target.value)
                  }}
                />
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
