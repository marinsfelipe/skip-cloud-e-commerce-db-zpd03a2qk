migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('google_ads_config')
    try {
      app.findFirstRecordByData('google_ads_config', 'tag_id', 'AW-18109323512')
    } catch (_) {
      const record = new Record(col)
      record.set('tag_id', 'AW-18109323512')
      record.set('is_active', true)
      app.save(record)
    }
  },
  (app) => {
    try {
      const record = app.findFirstRecordByData('google_ads_config', 'tag_id', 'AW-18109323512')
      app.delete(record)
    } catch (_) {}
  },
)
