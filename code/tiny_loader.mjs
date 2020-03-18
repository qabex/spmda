export default tiny_loader
export function tiny_loader(opt) {
  const D = document
  const src = 'string' === typeof opt ? opt : opt.src
  if (src === opt) opt = {src: opt}
  if (src != encodeURI(src))
    throw new Error('Invalid script src')

  let s = D.querySelector('script[src="'+ src + '"]')
  if (!s) {
    s = D.createElement('script')

    if (src.startsWith('http') && undefined === opt.crossorigin)
      opt.crossorigin = 'anonymous'

    D.head.appendChild(Object.assign(s, opt))
  }
  
  if (undefined === s.promise)
    s.promise = new Promise((resolve, reject) => {
      s.onload = e => resolve(e.target)
      s.onerror = e => reject(e)
    })

  return s.promise
}
