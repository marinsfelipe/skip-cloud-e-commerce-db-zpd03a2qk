import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const { error } = await login(email, password)
    setIsLoading(false)

    if (!error) {
      navigate('/dashboard')
      toast({
        title: 'Login realizado com sucesso',
        description: 'Bem-vindo ao Vittorio Design.',
      })
    } else {
      toast({
        variant: 'destructive',
        title: 'Erro de autenticação',
        description: 'Credenciais inválidas.',
      })
    }
  }

  const handleForgot = async () => {
    if (!email) {
      return toast({ variant: 'destructive', title: 'Digite seu e-mail no campo acima' })
    }
    try {
      const res = await pb.send('/backend/v1/request-reset', {
        method: 'POST',
        body: JSON.stringify({ email }),
      })
      toast({
        title: 'Recuperação Solicitada',
        description: 'O link de recuperação foi gerado (veja console/alert).',
      })
      if (res.link) {
        console.log('RESET LINK:', res.link)
        alert(`Reset Link (Demo Mode): ${res.link}`)
      }
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erro ao solicitar recuperação' })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md shadow-lg border-border bg-card">
        <CardHeader className="space-y-3 text-center pb-8">
          <div className="mx-auto bg-primary text-primary-foreground w-16 h-16 flex items-center justify-center rounded-full mb-4">
            <span className="font-serif text-3xl font-bold">V</span>
          </div>
          <CardTitle className="text-3xl font-serif tracking-tight text-foreground">
            Vittorio Design
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Painel Administrativo Restrito
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@vittorio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 bg-background border-input"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-foreground">
                  Senha
                </Label>
                <button
                  type="button"
                  onClick={handleForgot}
                  className="text-sm text-primary hover:underline"
                >
                  Esqueci a senha
                </button>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 bg-background border-input"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 text-md font-semibold"
              disabled={isLoading}
            >
              {isLoading ? 'Autenticando...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
