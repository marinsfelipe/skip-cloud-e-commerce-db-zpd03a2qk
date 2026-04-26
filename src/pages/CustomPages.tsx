import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Plus, Edit, Trash2, Globe } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  getCustomPages,
  createCustomPage,
  updateCustomPage,
  deleteCustomPage,
  CustomPage,
} from '@/services/custom-pages'
import { format } from 'date-fns'

const formSchema = z.object({
  page_name: z.string().min(2, 'O título deve ter pelo menos 2 caracteres'),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Use apenas letras minúsculas, números e hífens'),
  content: z.string().min(10, 'O conteúdo deve ter pelo menos 10 caracteres'),
})

export default function CustomPages() {
  const [pages, setPages] = useState<CustomPage[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { page_name: '', slug: '', content: '' },
  })

  const loadPages = async () => {
    try {
      const data = await getCustomPages()
      setPages(data)
    } catch (error) {
      toast.error('Erro ao carregar páginas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPages()
  }, [])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (editingId) {
        await updateCustomPage(editingId, values)
        toast.success('Página atualizada com sucesso')
      } else {
        await createCustomPage(values)
        toast.success('Página criada com sucesso')
      }
      setIsOpen(false)
      loadPages()
    } catch (error: any) {
      if (error?.response?.data?.slug?.code === 'validation_not_unique') {
        form.setError('slug', { message: 'Este slug já está em uso.' })
      } else {
        toast.error('Erro ao salvar página')
      }
    }
  }

  const handleEdit = (page: CustomPage) => {
    setEditingId(page.id)
    form.reset({
      page_name: page.page_name,
      slug: page.slug,
      content: page.content,
    })
    setIsOpen(true)
  }

  const handleCreate = () => {
    setEditingId(null)
    form.reset({ page_name: '', slug: '', content: '' })
    setIsOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteCustomPage(id)
      toast.success('Página excluída com sucesso')
      loadPages()
    } catch (error) {
      toast.error('Erro ao excluir página')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-serif font-bold tracking-tight">Páginas Institucionais</h2>
          <p className="text-muted-foreground mt-1">
            Gerencie as páginas dinâmicas do site (ex: Políticas, Termos).
          </p>
        </div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" /> Nova Página
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-xl overflow-y-auto">
            <SheetHeader className="mb-6">
              <SheetTitle>{editingId ? 'Editar Página' : 'Criar Nova Página'}</SheetTitle>
            </SheetHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="page_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título da Página</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Política de Privacidade" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug (URL)</FormLabel>
                      <FormControl>
                        <Input placeholder="ex: politica-de-privacidade" {...field} />
                      </FormControl>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center">
                        <Globe className="w-3 h-3 mr-1" /> O link ficará: /p/{field.value || 'slug'}
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conteúdo (HTML)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="<h1>Título</h1><p>Texto...</p>"
                          className="min-h-[300px] font-mono text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Salvar Página
                </Button>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </div>

      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Última Atualização</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : pages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  Nenhuma página encontrada.
                </TableCell>
              </TableRow>
            ) : (
              pages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell className="font-medium">{page.page_name}</TableCell>
                  <TableCell className="text-muted-foreground">/p/{page.slug}</TableCell>
                  <TableCell>{format(new Date(page.updated), 'dd/MM/yyyy HH:mm')}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(page)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir página?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. A página ficará inacessível
                            publicamente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => handleDelete(page.id)}
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
