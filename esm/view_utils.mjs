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

export { fetch_cors_get, fetch_json, fetch_text, raf_batch };
//# sourceMappingURL=view_utils.mjs.map
