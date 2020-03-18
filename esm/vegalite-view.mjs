import JSON5 from 'https://cdn.jsdelivr.net/npm/json5@2.1.1/dist/index.min.mjs';

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

      disconnectedCallback() {}

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

function json5_human(json_src) {
  json_src = json_src.trim();
  if ('{' !== json_src[0]) {
    json_src = `{${json_src}}`;}
  return JSON5.parse(json_src) }

class VegaLiteViewBaseElement extends as_src_view(HTMLElement) {
  connectedCallback() {
    super.connectedCallback();
    this.dispatchEvent(new CustomEvent('start')); }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.dispatchEvent(new CustomEvent('finish')); }

  get hover() {return this.hasAttribute('hover')}
  set hover(v) {
    if (v) {this.setAttribute('hover', '');}
    else this.removeAttribute('hover'); }


  async _render_src(vegalite_src) {
    let vl_doc = this.parseDoc(vegalite_src);
    return this.renderDoc(vl_doc) }

  parseDoc(vegalite_src) {
    try {return json5_human(vegalite_src)}
    catch (err) {
      console.warn('VegaLite parsing problem:', err); } }

  async renderDoc(vegalite_doc) {
    if ('string' === typeof vegalite_doc) {
      vegalite_doc = this.parseDoc(vegalite_doc);}

    const {vega, vegaLite} = await this._vegalite;

    const vega_spec = this.vega_spec =
      vegaLite.compile(vegalite_doc);

    const container = this._container(
      this.ownerDocument);
    const {renderer, hover}=this;
    const vega_view = this.vega_view =
      new vega.View(
        vega.parse(vega_spec.spec)
      , {renderer, hover, container} );

    //this.appendChild(container)
    vega_view.runAsync();}

  _container(doc) {return this}

  static initialize() {
    this._vegalite = this.prototype._vegalite =
      this._init_vegalite();
    return this}

  static async _init_vegalite() {
     {
      const deps =[
        tiny_loader('https://cdn.jsdelivr.net/npm/vega@5.10.0')
      , tiny_loader('https://cdn.jsdelivr.net/npm/vega-lite@4.7.0') ];

      while (deps.length) {await deps.pop();} }

    const {vega, vegaLite} = window;
    return {vega, vegaLite}} }


VegaLiteViewBaseElement.prototype._data ={
  $schema: 'https://vega.github.io/schema/vega-lite/v4.json'
, mark: 'point'};


class VegaLiteViewElement extends VegaLiteViewBaseElement {
  get renderer() {return this.getAttribute('renderer')}
  set renderer(v) {this.setAttribute('renderer', v);} }

class VegaLiteSVGViewElement extends VegaLiteViewBaseElement {
  get renderer() {return 'svg'} }

class VegaLiteCanvasViewElement extends VegaLiteViewBaseElement {
  get renderer() {return 'canvas'} }

VegaLiteViewElement.define_as('vegalite-view');
VegaLiteSVGViewElement.define_as('vegalite-svg-view');
VegaLiteCanvasViewElement.define_as('vegalite-canvas-view');
//# sourceMappingURL=vegalite-view.mjs.map
