import JSON5 from 'https://cdn.jsdelivr.net/npm/json5@2.1.1/dist/index.min.mjs';

function json5_human(json_src) {
  json_src = json_src.trim();
  if ('{' !== json_src[0]) {
    json_src = `{${json_src}}`;}
  return JSON5.parse(json_src) }

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


function raf_batch(on_render) {
  let q=[], tid=null;
  return (( ...args ) => {
    q.push(...args);
    if (null === tid) {
      tid = requestAnimationFrame(_batch); } })

  function _batch() {
    const batch = q;
    q=[]; tid=null;
    on_render(batch);} }

async function fetch_as(kind, req) {
  req = await req;
  switch (kind) {
    case 'body':
      return req.body

    case 'blob':
      return req.blob()

    case 'ab': case 'arrayBuffer':
      return req.arrayBuffer()

    case 'u8':
      return new Uint8Array(
        await req.arrayBuffer())

    case 'form': case 'formData':
      return req.formData()

    case 'json':
      return req.json()

    case 'json5':
      return json5_human(
        await req.text())

    case 'src': case 'txt': case 'text': default:
      return req.text()} }


function fetch_cors_get(src, headers) {
  return fetch(src,{method: 'GET', mode: 'cors', headers}) }

async function fetch_json(src, headers) {
  const req = await fetch_cors_get(src, headers);
  return req.json()}

class LsDirView extends as_src_view(HTMLElement) {
  get src() {return this.getAttribute('src')}
  set src(v) {
    if (v) {this.setAttribute('src', v);}
    else this.removeAttribute('src');
    this.update();}

  get prefix() {return this.getAttribute('prefix')}
  set prefix(v) {
    if (v) {this.setAttribute('prefix', v);}
    else this.removeAttribute('prefix');
    this.update();}

  get mask() {return this.getAttribute('mask')}
  set mask(v) {
    if (v) {this.setAttribute('mask', v);}
    else this.removeAttribute('mask');
    this.update();}

  async _render_src(cfg) {
    cfg = json5_human(cfg);

    this.render_doc_view =
      this._bind_render_doc_view(
        cfg.views || cfg || {});

    this.update();}

  update() {
    let cur = this._p_update;
    if (undefined === cur) {
      this._p_update = cur = this._update();}
    return cur}

  async _update() {
    await this;
    this.innerHTML = '';

    const mask = this.as_mask_filter(this.mask);
    const skip = this.as_prefix_filter(this.prefix);
    const all_docs = await this.fetch_all(this.src);

    const raf_q = raf_batch(this._bind_batch());
    for (const [fname, doc] of await all_docs) {
      if (mask(doc.meta)) {continue}
      if (skip(fname, doc)) {continue}

      raf_q(
        await this.render_doc_view(doc)); }

    this._p_update = undefined;}

  _bind_batch() {
    return (( batch ) => {
      for (const elem of batch) {
        this.appendChild(elem);} }) }

  _bind_render_doc_view(views_by_ext) {
    const owner = this.ownerDocument;
    const fb_view = this.getAttribute('view')
      || views_by_ext.fallback
      || this.view_fallback;

    return async function render_doc_view(doc) {
      const ext = doc.fname.split('.').pop();

      let attr='textContent', kind='text';
      let view = views_by_ext[ext]
        || views_by_ext['.'+ext]
        || fb_view;

      if ('string' !== typeof view) {
        [view, attr, kind] = view;}

      const elem = owner.createElement(view);
      elem[attr] = await fetch_as(kind, doc.request);
      return elem} }


  async fetch_all(src_path) {
    if (! src_path) {
      src_path = 'all-docs.json';}

    const all_docs = await fetch_json(
      src_path, this._fetch_headers);
    return all_docs.map(
      this.fetch_doc.bind(this)) }


  fetch_doc(doc) {
    const parts = doc.fname.split(/\s*--\s*/);
    doc.name = parts.pop();
    doc.prefix = parts.shift();
    doc.meta = new Set(parts);

    doc.request = fetch_cors_get(
      doc.path, this._fetch_headers);
    return [doc.fname, doc] }

  as_prefix_filter(prefix) {
    if (! prefix) {
      return () => false}

    if (prefix.endsWith('+')) {
      prefix = prefix.replace(/\+$/,'');
      return fname => fname < prefix}

    return fname => ! fname.startsWith(prefix)}

  as_mask_filter(mask_keys) {
    mask_keys = mask_keys ? mask_keys.split(/\s+/) : ['skip', 'hide'];
    return (( meta ) => {
      for (const k of mask_keys) {
        if (meta.has(k)) {
          return true} }
      return false}) } }


Object.assign(LsDirView.prototype,{
  view_fallback: 'pre'
, _fetch_headers: {}} );

customElements.define('lsdir-view', LsDirView);

export default LsDirView;
export { LsDirView };
//# sourceMappingURL=lsdir-view.mjs.map
