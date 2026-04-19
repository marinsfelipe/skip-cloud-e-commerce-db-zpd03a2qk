migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('pages')
    if (!col.fields.getByName('image')) {
      col.fields.add(
        new RelationField({
          name: 'image',
          collectionId: app.findCollectionByNameOrId('media').id,
          maxSelect: 1,
          cascadeDelete: false,
        }),
      )
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('pages')
    if (col.fields.getByName('image')) {
      col.fields.removeByName('image')
    }
    app.save(col)
  },
)
