export async function readJsonLimited(request: Request, maxBytes: number): Promise<unknown> {
  if (Number(request.headers.get('content-length') || 0) > maxBytes) {
    throw new RangeError('Request too large')
  }
  if (!request.body) throw new SyntaxError('Missing request body')
  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > maxBytes) {
        await reader.cancel()
        throw new RangeError('Request too large')
      }
      chunks.push(value)
    }
  } finally {
    reader.releaseLock()
  }
  const body = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) {
    body.set(chunk, offset)
    offset += chunk.byteLength
  }
  return JSON.parse(new TextDecoder().decode(body)) as unknown
}
