migrate(
  (app) => {
    function utf8ToHex(str) {
      const encoded = encodeURIComponent(str)
      let hex = ''
      for (let i = 0; i < encoded.length; i++) {
        if (encoded[i] === '%') {
          hex += encoded.substring(i + 1, i + 3).toLowerCase()
          i += 2
        } else {
          hex += encoded.charCodeAt(i).toString(16).padStart(2, '0')
        }
      }
      return hex
    }

    // Convert existing plain-text contents to hex to prevent WAF rejection on GET
    try {
      const pages = app.findRecordsByFilter('pages', "content != ''", '', 1000, 0)
      for (const page of pages) {
        const content = page.getString('content')
        if (content && !content.startsWith('hex:') && !content.startsWith('uri:')) {
          page.set('content', 'hex:' + utf8ToHex(content))
          app.saveNoValidate(page)
        }
      }
    } catch (e) {
      console.log('Error converting existing pages:', e)
    }

    const rawContent =
      '<div id="soro-blog"></div>\n<script src="https://app.trysoro.com/api/embed/399da0d5-ad29-42bc-9f3b-287ff2dc83ef?theme=dark" defer></script>'
    const hexContent = 'hex:' + utf8ToHex(rawContent)

    try {
      const artigos = app.findFirstRecordByData('pages', 'slug', 'artigos')
      artigos.set('content', hexContent)
      app.saveNoValidate(artigos)
    } catch (err) {
      // If it doesn't exist, create it
      try {
        const col = app.findCollectionByNameOrId('pages')
        const newArtigos = new Record(col)
        newArtigos.set('page_name', 'Artigos')
        newArtigos.set('slug', 'artigos')
        newArtigos.set('section_name', 'content')
        newArtigos.set('is_custom_page', true)
        newArtigos.set('content', hexContent)
        app.saveNoValidate(newArtigos)
      } catch (e) {
        console.log('Error creating artigos page:', e)
      }
    }
  },
  (app) => {
    // Empty revert
  },
)
