import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'

export default function SettingsPage() {
  const [socialLinks, setSocialLinks] = useState<any[]>([])
  const [pages, setPages] = useState<any[]>([])
  const [logoUrl, setLogoUrl] = useState('')
  const { toast } = useToast()

  const loadData = async () => {
    try {
      const s = await pb.collection('social_links').getFullList()
      setSocialLinks(s)
      const p = await pb.collection('pages').getFullList()
      setPages(p)
      const st = await pb
        .collection('settings')
        .getFirstListItem('key="site_logo"')
        .catch(() => null)
      if (st && st.file) {
        setLogoUrl(pb.files.getURL(st, st.file))
      }
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

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-serif font-bold">Configurações & CMS</h2>

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
