migrate(
  (app) => {
    const media = app.findCollectionByNameOrId('media')
    if (!media.fields.getByName('is_ad_carousel')) {
      media.fields.add(new BoolField({ name: 'is_ad_carousel' }))
    }
    app.save(media)
  },
  (app) => {
    const media = app.findCollectionByNameOrId('media')
    media.fields.removeByName('is_ad_carousel')
    app.save(media)
  },
)
