migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('pages')

    // Add temporary backup field to preserve data during field replacement
    col.fields.add(new TextField({ name: 'content_backup' }))
    app.save(col)

    // Copy existing content data to backup
    app.db().newQuery('UPDATE pages SET content_backup = content').execute()

    // Remove editor field and add text field to bypass HTML sanitization
    col.fields.removeByName('content')
    col.fields.add(new TextField({ name: 'content' }))
    app.save(col)

    // Restore data from backup to the new content field
    app.db().newQuery('UPDATE pages SET content = content_backup').execute()

    // Remove backup field
    col.fields.removeByName('content_backup')
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('pages')

    col.fields.add(new TextField({ name: 'content_backup' }))
    app.save(col)

    app.db().newQuery('UPDATE pages SET content_backup = content').execute()

    col.fields.removeByName('content')
    col.fields.add(new EditorField({ name: 'content' }))
    app.save(col)

    app.db().newQuery('UPDATE pages SET content = content_backup').execute()

    col.fields.removeByName('content_backup')
    app.save(col)
  },
)
