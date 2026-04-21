migrate(
  (app) => {
    const settingsCol = app.findCollectionByNameOrId('settings')
    const settingsFile = settingsCol.fields.getByName('file')
    if (settingsFile) {
      settingsFile.maxSize = 52428800
    }
    app.save(settingsCol)

    const mediaCol = app.findCollectionByNameOrId('media')
    const mediaFile = mediaCol.fields.getByName('file')
    if (mediaFile) {
      mediaFile.maxSize = 52428800
    }
    app.save(mediaCol)
  },
  (app) => {
    const settingsCol = app.findCollectionByNameOrId('settings')
    const settingsFile = settingsCol.fields.getByName('file')
    if (settingsFile) {
      settingsFile.maxSize = 5242880
    }
    app.save(settingsCol)

    const mediaCol = app.findCollectionByNameOrId('media')
    const mediaFile = mediaCol.fields.getByName('file')
    if (mediaFile) {
      mediaFile.maxSize = 5242880
    }
    app.save(mediaCol)
  },
)
