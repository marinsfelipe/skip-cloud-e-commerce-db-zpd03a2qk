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
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Shield } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()

  const loadUsers = async () => {
    try {
      const records = await pb.collection('users').getFullList({ sort: '-created' })
      setUsers(records)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])
  useRealtime('users', loadUsers)

  const maxUsers = 10
  const activeUsersCount = users.filter((u) => u.is_active !== false).length
  const canAddUser = activeUsersCount < maxUsers

  const handleAddUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    try {
      await pb.collection('users').create({
        name: formData.get('name'),
        email: formData.get('email'),
        password: 'Password123!',
        passwordConfirm: 'Password123!',
        role: formData.get('role'),
        is_active: true,
      })
      setIsOpen(false)
      toast({ title: 'Usuário adicionado', description: 'O novo usuário foi criado com sucesso.' })
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erro ao criar usuário',
        description: 'Verifique os dados e tente novamente.',
      })
    }
  }

  const handleDeactivate = async (id: string, currentState: boolean) => {
    if (
      !confirm(
        `Tem certeza que deseja ${currentState ? 'revogar' : 'restaurar'} o acesso deste usuário?`,
      )
    )
      return
    try {
      await pb.collection('users').update(id, { is_active: !currentState })
      toast({ title: `Usuário ${currentState ? 'desativado' : 'ativado'}` })
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erro ao atualizar usuário' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif font-bold tracking-tight">Usuários</h2>
          <p className="text-muted-foreground">
            Gerencie o acesso administrativo ({activeUsersCount}/{maxUsers} vagas).
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button disabled={!canAddUser}>
              <Plus className="mr-2 h-4 w-4" /> Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Usuário</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input name="name" required placeholder="Ex: Maria" />
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input name="email" type="email" required placeholder="maria@vittorio.com" />
              </div>
              <div className="space-y-2">
                <Label>Função</Label>
                <Select name="role" defaultValue="Editor">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Editor">Editor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit">Criar Usuário</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Função</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className={user.is_active === false ? 'opacity-50' : ''}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {user.role === 'Admin' && <Shield className="h-4 w-4 text-primary" />}
                    {user.role || 'Editor'}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={user.is_active !== false ? 'default' : 'secondary'}
                    className={user.is_active !== false ? 'bg-green-600' : ''}
                  >
                    {user.is_active !== false ? 'Ativo' : 'Inativo'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeactivate(user.id, user.is_active !== false)}
                    disabled={user.id === pb.authStore.record?.id}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
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
