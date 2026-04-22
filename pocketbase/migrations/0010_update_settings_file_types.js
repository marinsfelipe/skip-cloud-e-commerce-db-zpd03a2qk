migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('settings')
    const fileField = col.fields.getByName('file')
    if (fileField) {
      fileField.mimeTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/svg+xml',
        'image/webp',
        'image/gif',
      ]
      fileField.maxSize = 52428800 // 50MB
      app.save(col)
    }
  },
  (app) => {
    const col = app.findCollectionByNameOrId('settings')
    const fileField = col.fields.getByName('file')
    if (fileField) {
      fileField.mimeTypes = []
      fileField.maxSize = 0
      app.save(col)
    }
  },
)
