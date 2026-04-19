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
import { Plus, Edit, Eye } from 'lucide-react'

export default function Blog() {
  const [posts] = useState(MOCK_POSTS)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif font-bold tracking-tight">Editorial & Blog</h2>
          <p className="text-muted-foreground">Artigos de arquitetura, design e estilo de vida.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Escrever Artigo
        </Button>
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
                <TableCell className="font-medium">{post.title}</TableCell>
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
                  <Button variant="ghost" size="icon">
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
