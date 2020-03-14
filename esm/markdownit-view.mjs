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
  } else if (!s.promise)
    return s.promise

  return s.promise = new Promise((resolve, reject) => {
    s.onload = e => resolve(e.target);
    s.onerror = e => reject(e);
  })
}

class MarkdownitView extends HTMLElement {
  async connectedCallback() {
    const root = this.ownerDocument.createElement('div');

    const source = this.textContent;
    this.textContent = '';

    let rendered = this._md_cache.get(source);
    if (undefined === rendered) {
      const md = await this.md;
      this._md_cache.set(source,
        rendered = md.render(source)); }

    root.innerHTML = rendered;
    this.appendChild(root);}

  static initialize() {
    this.prototype._md_cache = new Map();
    this.md = this.prototype.md =
      _initialize_markdownit(this);
    return this}

  static fence_webcomponent() {
    return (( md ) => {
      const rules = md.renderer.rules;
      const prev_fence = rules.fence;
      rules.fence = function (tokens, idx, options, env, slf) {
        const tkn = tokens[idx];
        const m = /\s*[!](\w+)\s*(.*)$/.exec(tkn.info);
        if (! m) {
          return prev_fence.apply(rules, arguments)}

        let [_, wc_name, wc_options] = m;
        const elem = document.createElement(`${wc_name}-view`);
        elem.textContent = tkn.content;
        if (wc_options) {
          try {
            wc_options = JSON.stringify(
              JSON5.parse(`{${wc_options}}`) ); }
          catch (err) {}
          elem.setAttribute('options', wc_options); }

        return elem.outerHTML}; }) } }


customElements.define('markdownit-view', MarkdownitView.initialize());


async function _initialize_markdownit(klass) {
   {
    const sc0 = tiny_loader('https://cdn.jsdelivr.net/npm/markdown-it@10.0.0/dist/markdown-it.min.js');
    const sc1 = tiny_loader('https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@9.17.1/build/highlight.min.js');
    await sc0;
    await sc1;}

  const md = window.markdownit({
    highlight(str, lang, ...args) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(lang, str).value}
        catch (err) {
          console.warn('[hljs exception]:', {lang}, err); } }

      return '' } });// use external default escaping

  md.use(klass.fence_webcomponent(md));
  return md}

export default MarkdownitView;
export { MarkdownitView };
//# sourceMappingURL=markdownit-view.mjs.map
