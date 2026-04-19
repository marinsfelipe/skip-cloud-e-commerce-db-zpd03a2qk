import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { MediaSelector } from '@/components/MediaSelector'

export default function Blog() {
  const [posts, setPosts] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<any>(null)
  const [formData, setFormData] = useState({ title: '', slug: '', content: '', image: '' })
  const [previewImage, setPreviewImage] = useState('')
  const { toast } = useToast()

  const loadPosts = async () => {
    try {
      const records = await pb
        .collection('blog_posts')
        .getFullList({ sort: '-created', expand: 'image' })
      setPosts(records)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadPosts()
  }, [])

  const handleOpenEdit = (post: any) => {
    setEditingPost(post)
    setFormData({ title: post.title, slug: post.slug, content: post.content, image: post.image })
    setPreviewImage(
      post.expand?.image ? pb.files.getURL(post.expand.image, post.expand.image.file) : '',
    )
    setIsOpen(true)
  }

  const handleOpenAdd = () => {
    setEditingPost(null)
    setFormData({ title: '', slug: '', content: '', image: '' })
    setPreviewImage('')
    setIsOpen(true)
  }

  const handleSave = async () => {
    if (!formData.title || !formData.content || !formData.image) {
      toast({
        variant: 'destructive',
        title: 'Preencha todos os campos obrigatórios, incluindo imagem.',
      })
      return
    }

    try {
      const slug =
        formData.slug ||
        formData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
      const data = { ...formData, slug }

      if (editingPost) {
        await pb.collection('blog_posts').update(editingPost.id, data)
        toast({ title: 'Artigo atualizado' })
      } else {
        await pb.collection('blog_posts').create(data)
        toast({ title: 'Artigo publicado' })
      }
      setIsOpen(false)
      loadPosts()
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erro ao salvar', description: err.message })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este artigo?')) return
    try {
      await pb.collection('blog_posts').delete(id)
      toast({ title: 'Artigo excluído' })
      loadPosts()
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erro ao excluir' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif font-bold tracking-tight">Editorial & Blog</h2>
          <p className="text-muted-foreground">
            Gerencie artigos de arquitetura, design e estilo de vida.
          </p>
        </div>
        <Button onClick={handleOpenAdd}>
          <Plus className="mr-2 h-4 w-4" /> Escrever Artigo
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPost ? 'Editar Artigo' : 'Novo Artigo'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Título do Artigo *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Slug (URL) Opcional</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="ex: o-uso-do-aco-inox"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Imagem de Destaque *</Label>
              <div className="flex items-center gap-4">
                {previewImage ? (
                  <img
                    src={previewImage}
                    className="h-24 w-32 object-cover rounded border"
                    alt="Preview"
                  />
                ) : (
                  <div className="h-24 w-32 bg-muted rounded border flex items-center justify-center text-xs text-muted-foreground">
                    Sem imagem
                  </div>
                )}
                <MediaSelector
                  selectedId={formData.image}
                  onSelect={(id, url) => {
                    setFormData({ ...formData, image: id })
                    setPreviewImage(url)
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Conteúdo *</Label>
              <Textarea
                className="min-h-[300px]"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>{editingPost ? 'Salvar Alterações' : 'Publicar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="font-medium font-serif">{post.title}</TableCell>
                <TableCell className="text-muted-foreground">{post.slug}</TableCell>
                <TableCell>{new Date(post.created).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(post)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(post.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {posts.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  Nenhum artigo publicado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
