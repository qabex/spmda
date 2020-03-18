# SPMDA: Single Page Markdown App

## Quickstart

```bash
$ mkdir spmda-quickstart
$ cd spmda-quickstart

$ npm init from-gh qabex/spmda/basic .
$ gvim index.html docs/*
$ npx qsrv ./docs
```

Take a look at the [qabx/spmda/basic](https://github.com/qabex/spmda/tree/master/basic) template.


### SPMDA Web Components 

#### `npx qsrv` integration

The "Quick Dev Server" allows live-reloading of changes and auto-updating JSON directory listings. For example, [`npx qsrv ./docs`](https://github.com/shanewholloway/node-qsrv#readme) watches the `./docs` directory for changes and keeps `"all-docs.json"` updated.

The `<lsdir-view>` web component fetches the specified `src` json document and then renders all referenced files using other web components such as `<markdownit-view>`.

The `textContent` is parsed with [JSON5](https://json5.org/) to be more human-friendly.

```html
...
<script type='module' src='https://cdn.jsdelivr.net/gh/qabex/spmda@0.0.3/esm/lsdir-view.mjs'></script>
...
<lsdir-view src='all-docs.json'>
  md: "markdownit-view",
  markdown: "markdownit-view",
  ".vegalite-json": "vegalite-view",
</lsdir-view>
...
```


#### [Mermaid](https://mermaid-js.github.io/mermaid/)

The `<mermaid-view>` web component renders its `textContent` attribute using the [mermaid](https://mermaid-js.github.io/mermaid/) package.

```html
...
<script type='module' src='https://cdn.jsdelivr.net/gh/qabex/spmda@0.0.3/esm/mermaid-view.mjs'></script>
...
<mermaid-view>
  graph TD;
      A-->B;
      A-->C;
      B-->D;
      C-->D;
</mermaid-view>
```


#### [Vega-Lite](https://vega.github.io/vega-lite/)

The `<vegalite-view>` web component renders its `textContent` attribute using the [Vega-Lite](https://vega.github.io/vega-lite/) package.

The `textContent` is parsed with [JSON5](https://json5.org/) to be more human-friendly.

```html
...
<script type='module' src='https://cdn.jsdelivr.net/gh/qabex/spmda@0.0.3/esm/vegalite-view.mjs'></script>
...
<vegalite-view>
  description: 'A simple bar chart with embedded data.',
  data: {
    values: [
      {a: 'A', b: 28},
      {a: 'B', b: 55},
      {a: 'C', b: 43},
      {a: 'D', b: 91},
      {a: 'E', b: 81},
      {a: 'F', b: 53},
      {a: 'G', b: 19},
      {a: 'H', b: 87},
      {a: 'I', b: 52}
    ]
  },
  mark: 'bar',
  encoding: {
    x: {field: 'a', type: 'ordinal'},
    y: {field: 'b', type: 'quantitative'}
  }
</vegalite-view>
```


#### [Markdown-It](https://github.com/markdown-it/markdown-it#readme)

The `<markdownit-view>` web component renders its `textContent` attribute using the [markdown-it](https://github.com/markdown-it/markdown-it#readme) package
and uses [highlight-js](https://highlightjs.org/) for code syntax highlighting.

```html
...
<script type='module' src='https://cdn.jsdelivr.net/gh/qabex/spmda@0.0.3/esm/markdownit-view.mjs'></script>
...
<markdownit-view>
  # An h1 title
  ### An h3 title
  ...
</markdownit-view>
```

To facilitate richer markdown-based documentation, block fences starting with `!` are delegated into web components. For example:

~~~
### First

```!mermaid
graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
```

### Second

```!vegalite
description: 'A simple bar chart with embedded data.',
data: {
  values: [
    {a: 'A', b: 28},
    {a: 'B', b: 55},
    {a: 'C', b: 43},
    {a: 'D', b: 91},
    {a: 'E', b: 81},
    {a: 'F', b: 53},
    {a: 'G', b: 19},
    {a: 'H', b: 87},
    {a: 'I', b: 52}
  ]
},
mark: 'bar',
encoding: {
  x: {field: 'a', type: 'ordinal'},
  y: {field: 'b', type: 'quantitative'}
}
```

### Third

~~~

becomes:

```html
<h3>First</h3>
<mermaid-view>
  graph TD;
      A-->B;
      A-->C;
      B-->D;
      C-->D;
</mermaid-view>
<h3>Second</h3>
<vegalite-view>
  description: 'A simple bar chart with embedded data.',
  data: {
    values: [
      {a: 'A', b: 28},
      {a: 'B', b: 55},
      {a: 'C', b: 43},
      {a: 'D', b: 91},
      {a: 'E', b: 81},
      {a: 'F', b: 53},
      {a: 'G', b: 19},
      {a: 'H', b: 87},
      {a: 'I', b: 52}
    ]
  },
  mark: 'bar',
  encoding: {
    x: {field: 'a', type: 'ordinal'},
    y: {field: 'b', type: 'quantitative'}
  }
</vegalite-view>
<h3>Third</h3>
```
