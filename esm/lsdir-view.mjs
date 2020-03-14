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


function fetch_cors_get(src, headers) {
  return fetch(src,{method: 'GET', mode: 'cors', headers}) }
async function fetch_json(src, headers) {
  const req = await fetch_cors_get(src, headers);
  return req.json()}
async function fetch_text(src, headers) {
  const req = await fetch_cors_get(src, headers);
  return req.text()}

class LsDirView extends HTMLElement {
  async connectedCallback() {
    const raf_q = this.bind_batch_render();

    const mask = this.as_mask_filter(
      this.getAttribute('mask'));
    const skip = this.as_prefix_filter(
      this.getAttribute('prefix'));
    const all_docs = await this.fetch_all(
      this.getAttribute('src'));

    const ctx = this.render_ctx();
    for (const [fname, doc] of await all_docs) {
      if (mask(doc.meta)) {continue}
      if (skip(fname, doc)) {continue}

      raf_q(
        await this.render_doc(
          await doc.source, ctx) ); } }

  bind_batch_render() {
    return raf_batch (( batch ) => {
      for (const elem of batch) {
        this.appendChild(elem);} }) }

  render_ctx() {
    return {
      view: this.getAttribute('view') || this.default_view
    , doc: this.ownerDocument} }

  render_doc(doc_src, {view, doc}) {
    const elem = doc.createElement(view);
    elem.textContent = doc_src;
    return elem}

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

    doc.source = fetch_text(
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
  default_view: 'doc-view'
, _fetch_headers: {}} );

customElements.define('lsdir-view', LsDirView);

export default LsDirView;
export { LsDirView };
//# sourceMappingURL=lsdir-view.mjs.map
