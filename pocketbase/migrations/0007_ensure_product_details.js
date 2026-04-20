migrate(
  (app) => {
    const products = app.findCollectionByNameOrId('products')
    if (!products.fields.getByName('details')) {
      products.fields.add(new EditorField({ name: 'details' }))
    }
    app.save(products)
  },
  (app) => {
    const products = app.findCollectionByNameOrId('products')
    products.fields.removeByName('details')
    app.save(products)
  },
)
