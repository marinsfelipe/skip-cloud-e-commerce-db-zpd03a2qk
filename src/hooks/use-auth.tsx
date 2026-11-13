import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import pb from '@/lib/pocketbase/client'

interface AuthContextType {
  user: any
  isAuthenticated: boolean
  login: (email: string, password?: string) => Promise<{ error: any }>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(pb.authStore.record)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange((_token, record) => {
      setUser(record)
    })

    // Renova a sessão salva ao abrir o app: sem isso um token expirado segue
    // "isValid" no cliente e toda escrita do painel falha (regra exige auth).
    if (pb.authStore.isValid) {
      pb.collection('users')
        .authRefresh()
        .catch(() => {
          pb.authStore.clear()
        })
    }

    setLoading(false)
    return () => {
      unsubscribe()
    }
  }, [])

  const login = async (email: string, password?: string) => {
    try {
      const auth = await pb.collection('users').authWithPassword(email, password || 'Skip@Pass')

      // Defesa extra no cliente: usuários desativados não permanecem logados
      // (o servidor já recusa o login via hook onRecordAuthRequest).
      if (auth.record && (auth.record as any).is_active === false) {
        pb.authStore.clear()
        return { error: { message: 'Esta conta está desativada. Fale com o administrador.' } }
      }
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const logout = () => {
    pb.authStore.clear()
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
