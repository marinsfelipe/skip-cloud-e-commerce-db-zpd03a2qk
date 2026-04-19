routerAdd(
  'POST',
  '/backend/v1/images',
  (e) => {
    const files = e.findUploadedFiles('file')
    if (!files || files.length === 0) return e.badRequestError('Nenhuma imagem enviada')

    const col = $app.findCollectionByNameOrId('media')
    const record = new Record(col)
    record.set('file', files[0])
    $app.save(record)

    try {
      const auditCol = $app.findCollectionByNameOrId('audit_log')
      const log = new Record(auditCol)
      log.set('action', 'Image Uploaded: ' + files[0].name)
      if (e.auth) log.set('user', e.auth.id)
      $app.save(log)
    } catch (err) {}

    const url = `/api/files/${col.id}/${record.id}/${record.getString('file')}`
    return e.json(200, { id: record.id, url })
  },
  $apis.requireAuth(),
)
