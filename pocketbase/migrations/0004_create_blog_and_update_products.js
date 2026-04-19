migrate(
  (app) => {
    const products = app.findCollectionByNameOrId('products')
    products.fields.add(new EditorField({ name: 'details' }))
    app.save(products)

    const blogPosts = new Collection({
      name: 'blog_posts',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'slug', type: 'text', required: true },
        { name: 'content', type: 'editor', required: true },
        {
          name: 'image',
          type: 'relation',
          collectionId: app.findCollectionByNameOrId('media').id,
          required: true,
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_blog_posts_slug ON blog_posts (slug)'],
    })
    app.save(blogPosts)
  },
  (app) => {
    try {
      const blogPosts = app.findCollectionByNameOrId('blog_posts')
      app.delete(blogPosts)
    } catch (_) {}

    try {
      const products = app.findCollectionByNameOrId('products')
      products.fields.removeByName('details')
      app.save(products)
    } catch (_) {}
  },
)
