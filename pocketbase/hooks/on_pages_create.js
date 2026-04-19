onRecordAfterCreateSuccess((e) => {
  try {
    const auditCol = $app.findCollectionByNameOrId('audit_log')
    const log = new Record(auditCol)
    log.set('action', 'update_page_content')
    log.set('user', e.auth ? e.auth.id : null)
    log.set('details', {
      page: e.record.getString('page_name'),
      section: e.record.getString('section_name'),
      isNew: true,
    })
    $app.save(log)
  } catch (err) {
    console.log('Audit log error:', err)
  }
  e.next()
}, 'pages')
