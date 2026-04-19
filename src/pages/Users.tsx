import { useState } from 'react'
import { MOCK_USERS } from '@/lib/mock-data'
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

export default function UsersPage() {
  const [users, setUsers] = useState(MOCK_USERS)
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()

  const maxUsers = 3
  const canAddUser = users.filter((u) => u.is_active).length < maxUsers

  const handleAddUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const newUser = {
      id: Date.now().toString(),
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      role: formData.get('role') as string,
      is_active: true,
    }
    setUsers([...users, newUser])
    setIsOpen(false)
    toast({
      title: 'Usuário adicionado',
      description: 'O novo usuário recebeu um e-mail de convite.',
    })
  }

  const handleDeactivate = (id: string) => {
    if (!confirm('Tem certeza que deseja revogar o acesso deste usuário?')) return
    setUsers(users.map((u) => (u.id === id ? { ...u, is_active: false } : u)))
    toast({
      title: 'Usuário desativado',
      description: 'Acesso revogado com sucesso.',
      variant: 'destructive',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif font-bold tracking-tight">Usuários</h2>
          <p className="text-muted-foreground">
            Gerencie o acesso administrativo ({users.filter((u) => u.is_active).length}/{maxUsers}{' '}
            vagas).
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
                <Button type="submit">Enviar Convite</Button>
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
              <TableRow key={user.id} className={!user.is_active ? 'opacity-50' : ''}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {user.role === 'Admin' && <Shield className="h-4 w-4 text-primary" />}
                    {user.role}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={user.is_active ? 'default' : 'secondary'}
                    className={user.is_active ? 'bg-green-600' : ''}
                  >
                    {user.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeactivate(user.id)}
                    disabled={!user.is_active || user.role === 'Admin'}
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
