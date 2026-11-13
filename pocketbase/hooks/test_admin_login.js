// Teste PONTUAL: valida o login com a nova senha do admin principal.
// Faz um auth-with-password real contra o PocketBase e reporta o resultado
// SEM logar a senha. Remover após a validação.
routerAdd('POST', '/backend/v1/test-admin-login', (e) => {
  const email = 'felipe.marins@vittoriodesign.com.br'
  const body = e.requestInfo().body || {}
  const password = $os.getenv('ADMIN_RESET_PASSWORD') || ''

  if (!password) {
    return e.json(500, { error: 'ADMIN_RESET_PASSWORD ausente' })
  }
  if (body.confirm !== 'yes') {
    return e.badRequestError('Confirmação ausente')
  }

  try {
    const http = $http.send({
      url: $os.getenv('PB_INSTANCE_URL') + '/api/collections/users/auth-with-password',
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ identity: email, password: password }),
    })
    const ok = http.statusCode === 200
    let token = ''
    let role = ''
    let isActive = null
    try {
      const parsed = JSON.parse(http.body)
      token = parsed.token || ''
      role = parsed.record?.role || ''
      isActive = parsed.record?.is_active
    } catch (_) {}
    // Nunca devolve o token nem a senha — só o resultado e o perfil.
    return e.json(200, {
      loginOk: ok,
      statusCode: http.statusCode,
      role: role,
      is_active: isActive,
      tokenIssued: token.length > 0,
    })
  } catch (err) {
    return e.json(500, { error: 'falha ao chamar auth', detail: String(err) })
  }
})
