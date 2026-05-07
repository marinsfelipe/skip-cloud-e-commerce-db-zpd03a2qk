onRecordValidate((e) => {
  const content = e.record.getString('content')
  if (content && content.startsWith('hex:')) {
    const hex = content.slice(4)
    let str = ''
    for (let i = 0; i < hex.length; i += 2) {
      str += '%' + hex.substring(i, i + 2)
    }
    try {
      e.record.set('content', decodeURIComponent(str))
    } catch (err) {
      console.log('Error decoding hex content:', err)
    }
  } else if (content && content.startsWith('uri:')) {
    try {
      e.record.set('content', decodeURIComponent(content.slice(4)))
    } catch (err) {
      console.log('Error decoding uri content:', err)
    }
  }
  e.next()
}, 'pages')
