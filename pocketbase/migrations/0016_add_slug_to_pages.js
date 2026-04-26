migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('pages')

    if (!col.fields.getByName('slug')) {
      col.fields.add(new TextField({ name: 'slug', pattern: '^[a-z0-9-]+$' }))
    }
    if (!col.fields.getByName('is_custom_page')) {
      col.fields.add(new BoolField({ name: 'is_custom_page' }))
    }

    col.addIndex('idx_pages_slug', true, 'slug', "slug != ''")
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('pages')
    col.removeField('slug')
    col.removeField('is_custom_page')
    col.removeIndex('idx_pages_slug')
    app.save(col)
  },
)
