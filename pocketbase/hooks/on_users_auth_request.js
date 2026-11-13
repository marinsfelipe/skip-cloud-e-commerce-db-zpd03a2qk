// Bloqueia o login de usuários desativados (is_active = false).
// Roda em TODAS as formas de autenticação por senha (authWithPassword).
onRecordAuthRequest((e) => {
  const record = e.record

  // Usuários de outras auth collections (ex.: _superusers) não são afetados.
  if (record?.collection()?.name !== 'users') {
    return e.next()
  }

  if (record.get('is_active') === false) {
    throw new BadRequestError('Esta conta está desativada. Fale com o administrador.')
  }

  e.next()
}, 'users')

// Garante defaults ao criar usuário pelo painel:
// sem perfil informado => Viewer; sem status => ativo.
onRecordCreate((e) => {
  if (!e.record.get('role')) {
    e.record.set('role', 'Viewer')
  }
  if (e.record.get('is_active') === undefined || e.record.get('is_active') === null) {
    e.record.set('is_active', true)
  }
  e.next()
}, 'users')
