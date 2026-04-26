onRecordAfterCreateSuccess((e) => {
  if (e.record.getBool('is_custom_page')) {
    const audit = new Record($app.findCollectionByNameOrId('audit_log'))
    audit.set('action', 'create_custom_page')
    audit.set('user', e.auth ? e.auth.id : null)
    audit.set('details', {
      page_name: e.record.getString('page_name'),
      slug: e.record.getString('slug'),
    })
    $app.save(audit)
  }
  return e.next()
}, 'pages')

onRecordAfterUpdateSuccess((e) => {
  if (e.record.getBool('is_custom_page')) {
    const audit = new Record($app.findCollectionByNameOrId('audit_log'))
    audit.set('action', 'update_custom_page')
    audit.set('user', e.auth ? e.auth.id : null)
    audit.set('details', {
      page_name: e.record.getString('page_name'),
      slug: e.record.getString('slug'),
    })
    $app.save(audit)
  }
  return e.next()
}, 'pages')

onRecordAfterDeleteSuccess((e) => {
  if (e.record.getBool('is_custom_page')) {
    const audit = new Record($app.findCollectionByNameOrId('audit_log'))
    audit.set('action', 'delete_custom_page')
    audit.set('user', e.auth ? e.auth.id : null)
    audit.set('details', {
      page_name: e.record.getString('page_name'),
      slug: e.record.getString('slug'),
    })
    $app.save(audit)
  }
  return e.next()
}, 'pages')
