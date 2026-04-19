import { useState } from 'react'
import { MOCK_POSTS } from '@/lib/mock-data'
import { formatDate } from '@/lib/format'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Eye, Bold, Italic, Link as LinkIcon, Image as ImageIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

export default function Blog() {
  const [posts] = useState(MOCK_POSTS)
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()

  const handleSave = (status: 'Draft' | 'Published') => {
    if (status === 'Published' && !confirm('Tem certeza que deseja publicar este artigo agora?'))
      return
    setIsOpen(false)
    toast({
      title: status === 'Published' ? 'Artigo Publicado' : 'Rascunho Salvo',
      description:
        status === 'Published'
          ? 'O artigo já está disponível no blog.'
          : 'Seu progresso foi salvo.',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif font-bold tracking-tight">Editorial & Blog</h2>
          <p className="text-muted-foreground">Artigos de arquitetura, design e estilo de vida.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Escrever Artigo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editor de Conteúdo</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label>Título do Artigo</Label>
                <Input
                  className="text-xl font-serif h-12"
                  placeholder="O Uso do Aço Inox na Arquitetura..."
                />
              </div>
              <div className="space-y-2">
                <Label>Imagem de Destaque</Label>
                <div className="h-32 border-2 border-dashed border-border rounded flex items-center justify-center cursor-pointer hover:bg-muted/50">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Conteúdo</Label>
                <div className="border rounded-md overflow-hidden">
                  <div className="bg-muted p-2 flex gap-2 border-b">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <LinkIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  <textarea
                    className="w-full h-64 p-4 bg-background resize-none focus:outline-none"
                    placeholder="Escreva sua história aqui..."
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="flex justify-between items-center sm:justify-between">
              <Button variant="outline" onClick={() => handleSave('Draft')}>
                Salvar Rascunho
              </Button>
              <Button onClick={() => handleSave('Published')}>Publicar Agora</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Data de Publicação</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="font-medium font-serif">{post.title}</TableCell>
                <TableCell>{formatDate(post.date)}</TableCell>
                <TableCell>
                  {post.status === 'Published' ? (
                    <Badge className="bg-green-600">Publicado</Badge>
                  ) : (
                    <Badge variant="secondary">Rascunho</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
