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


const data_url = (( mime, src ) =>
  `data:${mime},${encodeURIComponent(src)}`);
const svg_data_url = src =>
  data_url('image/svg+xml', src);

export { as_src_view, data_url, raf_batch, svg_data_url };
//# sourceMappingURL=view_utils.mjs.map
