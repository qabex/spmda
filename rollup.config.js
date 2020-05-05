import pkg from './package.json'
import rpi_resolve from '@rollup/plugin-node-resolve'
//import rpi_commonjs from '@rollup/plugin-node-resolve'
import rpi_jsy from 'rollup-plugin-jsy'
const pkg_name = (pkg.name || 'private').replace('-', '_')

const configs = []
export default configs

const sourcemap = true
const external = name =>
  name.startsWith('http')

const plugins_web = [
  rpi_resolve({}),
  //rpi_commonjs(),
  rpi_jsy({defines: {PLAT_WEB: true}}),
]


add_jsy('view_utils')
add_jsy('lsdir-view')
add_jsy('markdownit-view')
add_jsy('mermaid-view')
add_jsy('vegalite-view')
add_jsy('rtc_handshake')


function add_jsy(src_name, opt={}) {
  configs.push({
    input: `code/${src_name}.jsy`,
    plugins: plugins_web, external,
    output: { file: `esm/${src_name}.mjs`, format: 'es', sourcemap } })
}
