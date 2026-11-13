import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { Users, UserPlus, Loader2, Pencil, Trash2 } from 'lucide-react'
import { ROLES, roleLabel, type Role } from '@/lib/permissions'
import {
  createUser,
  deleteUser,
  describeUserError,
  listUsers,
  updateUser,
  type ManagedUser,
} from '@/services/users-service'

interface FormState {
  name: string
  email: string
  tempPassword: string
  role: Role
}

const EMPTY_FORM: FormState = { name: '', email: '', tempPassword: '', role: 'Viewer' }

export default function UsersPage() {
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [editing, setEditing] = useState<ManagedUser | null>(null)
  const [saving, setSaving] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<ManagedUser | null>(null)
  const { toast } = useToast()
  const { user: me } = useAuth()
  const navigate = useNavigate()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setUsers(await listUsers())
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar usuários',
        description: describeUserError(err),
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    load()
  }, [load])

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormOpen(true)
  }

  const openEdit = (u: ManagedUser) => {
    setEditing(u)
    setForm({ name: u.name, email: u.email, tempPassword: '', role: (u.role || 'Viewer') as Role })
    setFormOpen(true)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim()) {
      toast({
        variant: 'destructive',
        title: 'Preencha nome e e-mail',
      })
      return
    }
    if (!editing && form.tempPassword.length < 8) {
      toast({
        variant: 'destructive',
        title: 'Senha temporária muito curta',
        description: 'A senha temporária deve ter pelo menos 8 caracteres.',
      })
      return
    }
    setSaving(true)
    try {
      if (editing) {
        const data: Record<string, unknown> = {
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          role: form.role,
        }
        if (form.tempPassword) {
          if (form.tempPassword.length < 8) {
            toast({
              variant: 'destructive',
              title: 'Senha muito curta',
              description: 'A nova senha deve ter pelo menos 8 caracteres.',
            })
            setSaving(false)
            return
          }
          data.password = form.tempPassword
          data.passwordConfirm = form.tempPassword
        }
        await updateUser(editing.id, data)
        toast({ title: 'Usuário atualizado com sucesso' })
      } else {
        await createUser({
          name: form.name,
          email: form.email,
          tempPassword: form.tempPassword,
          role: form.role,
        })
        toast({
          title: 'Usuário criado com sucesso',
          description: `${form.name} já pode acessar o painel com a senha temporária.`,
        })
      }
      setFormOpen(false)
      await load()
    } catch (err) {
      toast({
        variant: 'destructive',
        title: editing ? 'Erro ao salvar usuário' : 'Erro ao criar usuário',
        description: describeUserError(err),
      })
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (u: ManagedUser, nextActive: boolean) => {
    if (u.id === me?.id) {
      toast({
        variant: 'destructive',
        title: 'Você não pode desativar o próprio acesso',
      })
      return
    }
    setTogglingId(u.id)
    try {
      await updateUser(u.id, { is_active: nextActive })
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, is_active: nextActive } : x)))
      toast({
        title: nextActive ? 'Usuário reativado' : 'Usuário desativado',
        description: nextActive
          ? `${u.name} volta a ter acesso ao painel.`
          : `${u.name} não poderá mais fazer login.`,
      })
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erro ao alterar status',
        description: describeUserError(err),
      })
    } finally {
      setTogglingId(null)
    }
  }

  const handleRoleChange = async (u: ManagedUser, role: Role) => {
    try {
      await updateUser(u.id, { role })
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, role } : x)))
      toast({ title: `Perfil de ${u.name} alterado para ${roleLabel(role)}` })
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erro ao alterar perfil',
        description: describeUserError(err),
      })
    }
  }

  const handleDelete = async () => {
    if (!deleting) return
    const target = deleting
    setDeleting(null)
    try {
      await deleteUser(target.id)
      toast({ title: 'Usuário excluído', description: target.email })
      await load()
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Não foi possível excluir',
        description: describeUserError(err),
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold tracking-tight">Usuários</h2>
          <p className="text-muted-foreground">
            Gerencie quem tem acesso ao painel e seus perfis de permissão.
          </p>
        </div>
        <Button onClick={openCreate}>
          <UserPlus className="mr-2 h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Usuários cadastrados
          </CardTitle>
          <CardDescription>
            {users.length} usuário(s). Usuários desativados não conseguem fazer login.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Carregando...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-3 pr-4 font-medium">Nome</th>
                    <th className="py-3 pr-4 font-medium">E-mail</th>
                    <th className="py-3 pr-4 font-medium">Perfil</th>
                    <th className="py-3 pr-4 font-medium">Status</th>
                    <th className="py-3 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const isMe = u.id === me?.id
                    const canDelete = !isMe
                    return (
                      <tr key={u.id} className="border-b last:border-0">
                        <td className="py-3 pr-4 font-medium">
                          {u.name || '—'}
                          {isMe && (
                            <Badge variant="outline" className="ml-2">
                              você
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">{u.email}</td>
                        <td className="py-3 pr-4">
                          <Select
                            value={u.role || 'Viewer'}
                            onValueChange={(v) => handleRoleChange(u, v as Role)}
                            disabled={isMe}
                          >
                            <SelectTrigger className="w-[170px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ROLES.map((r) => (
                                <SelectItem key={r.value} value={r.value}>
                                  {r.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={u.is_active}
                              onCheckedChange={(v) => handleToggleActive(u, v)}
                              disabled={isMe || togglingId === u.id}
                            />
                            <Badge variant={u.is_active ? 'default' : 'secondary'}>
                              {u.is_active ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center justify-end gap-1">
                            {!isMe && (
                              <Button variant="ghost" size="icon" onClick={() => openEdit(u)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                            )}
                            {canDelete && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                onClick={() => setDeleting(u)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog: criar/editar */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              {editing ? 'Editar usuário' : 'Novo usuário'}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? 'Atualize os dados do usuário. Deixe a senha em branco para mantê-la.'
                : 'Cadastre o usuário com uma senha temporária que ele deverá trocar.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="u-name">Nome completo</Label>
              <Input
                id="u-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="u-email">E-mail</Label>
              <Input
                id="u-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="u-password">
                {editing ? 'Nova senha (opcional)' : 'Senha temporária'}
              </Label>
              <Input
                id="u-password"
                type="password"
                value={form.tempPassword}
                onChange={(e) => setForm({ ...form, tempPassword: e.target.value })}
                required={!editing}
                minLength={editing ? 0 : 8}
                autoComplete="new-password"
                placeholder={editing ? 'Deixe em branco para manter' : 'Mínimo de 8 caracteres'}
              />
            </div>
            <div className="space-y-2">
              <Label>Perfil de acesso</Label>
              <Select
                value={form.role}
                onValueChange={(v) => setForm({ ...form, role: v as Role })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      <span className="font-medium">{r.label}</span>
                      <span className="block text-xs text-muted-foreground">{r.description}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {saving ? 'Salvando...' : editing ? 'Salvar alterações' : 'Criar usuário'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* AlertDialog: exclusão */}
      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir usuário?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting && (
                <>
                  Esta ação remove permanentemente <strong>{deleting.name}</strong> (
                  {deleting.email}) do painel. Não é possível desfazer.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
