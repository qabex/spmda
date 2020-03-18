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

class MarkdownitView extends as_src_view(HTMLElement) {
  async _render_src(markdown_src, doc) {
    let rendered = this._cache.get(markdown_src);
    if (undefined === rendered) {
      const md = await this.md;
      rendered = md.render(markdown_src);
      this._cache.set(markdown_src, rendered); }

    const root = doc.createElement('div');
    root.innerHTML = rendered;
    this.appendChild(root);}


  static fence_webcomponent() {
    return (( md ) => {
      const rules = md.renderer.rules;
      const prev_fence = rules.fence;
      rules.fence = function (tokens, idx, options, env, slf) {
        const tkn = tokens[idx];
        const m = /\s*[!]([\w\-]+)\s*(.*)$/.exec(tkn.info);
        if (! m) {
          return prev_fence.apply(rules, arguments)}

        let [_, wc_name, wc_options] = m;
        const elem = document.createElement(`${wc_name}-view`);
        elem.textContent = tkn.content;
        if (wc_options) {
          try {
            wc_options = JSON.stringify(
              json5_human(wc_options) ); }
          catch (err) {}
          elem.setAttribute('options', wc_options); }

        return elem.outerHTML}; }) }


  static initialize() {
    this.prototype._cache = new Map();
    this.md = this.prototype.md =
      this._init_markdownit();
    return this}

  static async _init_markdownit() {
     {
      const deps =[
        tiny_loader('https://cdn.jsdelivr.net/npm/markdown-it@10.0.0/dist/markdown-it.min.js')
      , tiny_loader('https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@9.17.1/build/highlight.min.js') ];

      while (deps.length) {await deps.pop();} }

    const md = window.markdownit({
      highlight(str, lang, ...args) {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(lang, str).value}
          catch (err) {
            console.warn('[hljs exception]:', {lang}, err); } }

        return '' } });// use external default escaping

    md.use(this.fence_webcomponent(md));
    return md} }


MarkdownitView.define_as('markdownit-view');

export default MarkdownitView;
export { MarkdownitView };
//# sourceMappingURL=markdownit-view.mjs.map
