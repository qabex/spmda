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

const _mmd0 = ((async () => {
  await tiny_loader('https://cdn.jsdelivr.net/npm/mermaid@8.4.5/dist/mermaidAPI.js');
  window.mermaid.initialize({startOnLoad: false});
  return window.mermaid})());


async function _mmd_svg_render(source) {
  const mermaid = await _mmd0;
  let svg_xml;
  try {
    svg_xml = mermaid.render('root', source);}
  catch (err) {
    console.warn(err);
    return}

  // fixup SVG... but WHY?
  svg_xml = svg_xml.replace('height="100%"', 'preserveAspectRatio="xMinYMin meet"');
  return svg_xml}


class MermaidSVGView extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});

    const style = this.ownerDocument.createElement('style');
    style.innerText = `
:host { display: flex; overflow: hidden; }
figure { margin: 0; padding: 0; flex-grow: 1; display: flex; }
`;
    this.shadowRoot.appendChild(style);}

  async connectedCallback() {
    const source = this.textContent;
    const svg_src = await _mmd_svg_render(source);
    if (! svg_src) {return}

    this.textContent = '';

    const root = this.ownerDocument.createElement('figure');
    root.innerHTML = svg_src;

    this.shadowRoot.appendChild(root);} }


function svg_data_url(svg_src) {
  return 'data:image/svg+xml,' + encodeURIComponent(svg_src)}

class MermaidImageView extends HTMLElement {
  async connectedCallback() {
    const source = this.textContent;
    const svg_src = await _mmd_svg_render(source);
    if (! svg_src) {return}

    this.textContent = '';

    const OD = this.ownerDocument;
    const img = OD.createElement('img');
    img.src = svg_data_url(svg_src);

    {
      const root = OD.createElement('figure');
      root.classList.add('mermaid');
      root.appendChild(img);
      this.parentNode.replaceChild(root, this);} } }


customElements.define('mermaid-image-view', MermaidImageView);
customElements.define('mermaid-svg-view', MermaidSVGView);

class MermaidView extends MermaidImageView {}
customElements.define('mermaid-view', MermaidView);

export default MermaidView;
export { MermaidImageView, MermaidSVGView, MermaidView };
//# sourceMappingURL=mermaid-view.mjs.map
