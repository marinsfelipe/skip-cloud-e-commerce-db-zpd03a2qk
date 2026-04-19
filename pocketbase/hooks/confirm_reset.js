routerAdd('POST', '/backend/v1/confirm-reset', (e) => {
  const body = e.requestInfo().body || {}
  const token = body.token
  const password = body.password
  try {
    const payload = $security.parseJWT(token, $secrets.get('PB_SUPERUSER_TOKEN') || 'fallback')
    if (payload.type !== 'reset') throw new Error('invalid token type')

    const user = $app.findRecordById('users', payload.id)
    user.setPassword(password)
    $app.save(user)

    try {
      const auditCol = $app.findCollectionByNameOrId('audit_log')
      const log = new Record(auditCol)
      log.set('action', 'Password Reset Success')
      log.set('user', user.id)
      $app.save(log)
    } catch (err) {}

    return e.json(200, { success: true })
  } catch (_) {
    return e.badRequestError('Token inválido ou expirado')
  }
})
