import pb from '@/lib/pocketbase/client'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import type { Role } from '@/lib/permissions'

export interface ManagedUser {
  id: string
  name: string
  email: string
  role: Role | ''
  is_active: boolean
  created: string
}

export async function listUsers(): Promise<ManagedUser[]> {
  const records = await pb.collection('users').getFullList({ sort: '-created' })
  return records.map((r: any) => ({
    id: r.id,
    name: r.name || '',
    email: r.email || '',
    role: (r.role as Role) || 'Viewer',
    is_active: r.is_active !== false,
    created: r.created,
  }))
}

export interface CreateUserData {
  name: string
  email: string
  tempPassword: string
  role: Role
}

export async function createUser({ name, email, tempPassword, role }: CreateUserData) {
  return pb.collection('users').create({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password: tempPassword,
    passwordConfirm: tempPassword,
    role,
    is_active: true,
  })
}

export interface UpdateUserData {
  name?: string
  email?: string
  role?: Role
  is_active?: boolean
}

export async function updateUser(id: string, data: UpdateUserData) {
  return pb.collection('users').update(id, data)
}

export async function deleteUser(id: string) {
  return pb.collection('users').delete(id)
}

export function describeUserError(err: unknown): string {
  const message = getErrorMessage(err)
  if (message.includes('email')) return 'Este e-mail já está em uso ou é inválido.'
  if (message.includes('password')) return 'A senha deve ter pelo menos 8 caracteres.'
  if (message.includes('role')) return 'Perfil de acesso inválido.'
  return message || 'Verifique os dados e tente novamente.'
}
