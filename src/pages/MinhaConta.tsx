import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { KeyRound, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { getErrorMessage } from '@/lib/pocketbase/errors'

export default function MinhaConta() {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (next.length < 8) {
      toast({
        variant: 'destructive',
        title: 'Senha muito curta',
        description: 'A nova senha deve ter pelo menos 8 caracteres.',
      })
      return
    }
    if (next !== confirm) {
      toast({
        variant: 'destructive',
        title: 'As senhas não coincidem',
        description: 'A confirmação deve ser idêntica à nova senha.',
      })
      return
    }
    setSaving(true)
    try {
      // Reautentica com a senha atual para confirmá-la e, em seguida,
      // grava a nova senha no próprio registro (updateRule permite o próprio).
      await pb.collection('users').authWithPassword(user.email, current)
      await pb.collection('users').update(user.id, {
        password: next,
        passwordConfirm: confirm,
        oldPassword: current,
      })
      toast({ title: 'Senha alterada com sucesso' })
      setCurrent('')
      setNext('')
      setConfirm('')
      navigate('/dashboard')
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Não foi possível alterar a senha',
        description: getErrorMessage(err) || 'Verifique a senha atual e tente novamente.',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h2 className="text-3xl font-serif font-bold tracking-tight">Minha Conta</h2>
        <p className="text-muted-foreground">Altere sua senha de acesso ao painel.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            Alterar Senha
          </CardTitle>
          <CardDescription>
            Informe sua senha atual, a nova senha e a confirmação da nova senha.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="current-password">Senha atual</Label>
              <Input
                id="current-password"
                type="password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Nova senha</Label>
              <Input
                id="new-password"
                type="password"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmação da nova senha</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" disabled={saving} className="w-full sm:w-auto">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {saving ? 'Salvando...' : 'Salvar nova senha'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
