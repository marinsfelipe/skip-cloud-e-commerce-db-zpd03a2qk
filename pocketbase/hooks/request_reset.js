routerAdd('POST', '/backend/v1/request-reset', (e) => {
  const body = e.requestInfo().body || {}
  const email = body.email
  if (!email) return e.badRequestError('Email é obrigatório')
  try {
    const user = $app.findAuthRecordByEmail('users', email)
    const token = $security.createJWT(
      { id: user.id, type: 'reset' },
      $secrets.get('PB_SUPERUSER_TOKEN') || 'fallback',
      3600,
    )

    const scheme = e.request.header.get('X-Forwarded-Proto') || 'https'
    const host = e.request.host
    const link = `${scheme}://${host}/admin/reset-password?token=${token}`

    return e.json(200, { link })
  } catch (_) {
    return e.badRequestError('Se o e-mail existir, um link foi gerado.')
  }
})
