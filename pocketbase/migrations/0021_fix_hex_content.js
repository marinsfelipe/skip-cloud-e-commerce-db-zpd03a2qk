migrate((app) => {
  const decodeHex = (str) => {
    if (!str || !str.startsWith('hex:')) return str
    const hexStr = str.slice(4)
    let decoded = ''
    for (let i = 0; i < hexStr.length; i += 2) {
      decoded += '%' + hexStr.substring(i, i + 2)
    }
    try {
      return decodeURIComponent(decoded)
    } catch (e) {
      return str
    }
  }

  try {
    const pages = app.findRecordsByFilter('pages', "content ~ 'hex:%'", '', 1000, 0)
    for (const record of pages) {
      const content = record.getString('content')
      if (content.startsWith('hex:')) {
        record.set('content', decodeHex(content))
        app.saveNoValidate(record)
      }
    }
  } catch (e) {
    console.log('pages collection error: ', e)
  }

  try {
    const settings = app.findRecordsByFilter('settings', "value ~ 'hex:%'", '', 1000, 0)
    for (const record of settings) {
      const value = record.getString('value')
      if (value.startsWith('hex:')) {
        record.set('value', decodeHex(value))
        app.saveNoValidate(record)
      }
    }
  } catch (e) {
    console.log('settings collection error: ', e)
  }
})
