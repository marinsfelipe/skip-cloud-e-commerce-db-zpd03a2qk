onRecordCreateRequest((e) => {
  const body = e.requestInfo().body
  if (body && typeof body.content === 'string' && body.content.startsWith('uri:')) {
    const decoded = decodeURIComponent(body.content.slice(4))
    e.record.set('content', decoded)
  }
  return e.next()
}, 'pages')

onRecordUpdateRequest((e) => {
  const body = e.requestInfo().body
  if (body && typeof body.content === 'string' && body.content.startsWith('uri:')) {
    const decoded = decodeURIComponent(body.content.slice(4))
    e.record.set('content', decoded)
  }
  return e.next()
}, 'pages')
