function tiny_loader(opt) {
  const D = document;
  const src = 'string' === typeof opt ? opt : opt.src;
  if (src === opt) opt = {src: opt};
  if (src != encodeURI(src))
    throw new Error('Invalid script src')

  let s = D.querySelector('script[src="'+ src + '"]');
  if (!s) {
    s = D.createElement('script');

    if (src.startsWith('http') && undefined === opt.crossorigin)
      opt.crossorigin = 'anonymous';

    D.head.appendChild(Object.assign(s, opt));
  }

  if (undefined === s.promise)
    s.promise = new Promise((resolve, reject) => {
      s.onload = e => resolve(e.target);
      s.onerror = e => reject(e);
    });

  return s.promise
}

const as_src_view = ((() => {
  const _cache = new Map();

  const _as_view_class = baseElement =>(
    class SrcBaseElement extends baseElement {
      connectedCallback() {
        const src = this.textContent;
        this.textContent = '';
        this._render_src(src, this.ownerDocument);}

      _render_src(src) {
        this.src = src;}

      static initialize() {
        return this}
      static define_as(key) {
        const klass = this.initialize();
        customElements.define(key, klass);
        return klass} } );

  return (( baseElement ) => {
    let res = _cache.get(baseElement);
    if (undefined === res) {
      res = _as_view_class(baseElement);
      _cache.set(baseElement, res);}
    return res}) })());

const data_url = (( mime, src ) =>
  `data:${mime},${encodeURIComponent(src)}`);
const svg_data_url = src =>
  data_url('image/svg+xml', src);

const _mmd0 = ((async () => {
  await tiny_loader('https://cdn.jsdelivr.net/npm/mermaid@8.4.5/dist/mermaidAPI.js');
  const mermaid = window.mermaid;
  mermaid.initialize({startOnLoad: false});
  return mermaid})());


async function _mermaid_svg_render(mermaid_src) {
  const mermaid = await _mmd0;
  let svg_xml;
  try {
    svg_xml = mermaid.render('root', mermaid_src);}
  catch (err) {
    console.warn('Mermaid Rendering Problem:', err);
    return}

  // fixup SVG... but WHY?
  svg_xml = svg_xml.replace(
    'height="100%"'
  , 'preserveAspectRatio="xMinYMin meet"');
  return svg_xml}


class MermaidSVGView extends as_src_view(HTMLElement) {
  _render_svg(mermaid_src) {return _mermaid_svg_render(mermaid_src)}

  async _render_src(mermaid_src, doc) {
    const svg_src = await this._render_svg(mermaid_src);
    if (! svg_src) {return}

    const root = doc.createElement('figure');
    root.innerHTML = svg_src;
    this.appendChild(root);} }


class MermaidImgView extends as_src_view(HTMLElement) {
  _render_svg(mermaid_src) {return _mermaid_svg_render(mermaid_src)}

  async _render_src(mermaid_src, doc) {
    const svg_src = await this._render_svg(mermaid_src);
    if (! svg_src) {return}

    const root = doc.createElement('figure');
    const img = doc.createElement('img');
    img.src = svg_data_url(svg_src);
    root.appendChild(img);
    this.appendChild(root);} }


MermaidImgView.define_as('mermaid-img-view');
MermaidSVGView.define_as('mermaid-svg-view');

class MermaidView extends MermaidImgView {}
MermaidView.define_as('mermaid-view');

export default MermaidView;
export { MermaidImgView, MermaidSVGView, MermaidView };
//# sourceMappingURL=mermaid-view.mjs.map
