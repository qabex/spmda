#### [Vega-Lite](https://vega.github.io/vega-lite/)

This is `ex-g--vega.md`

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

```!vegalite-svg
  data: {url: "https://vega.github.io/vega-datasets/data/cars.json"},
  mark: "point",
  encoding: {
    x: {field: "Horsepower", type: "quantitative"},
    y: {field: "Miles_per_Gallon", type: "quantitative"}
  }
```

```!vegalite-canvas
{
  "width": 300,
  "height": 150,
  "data": {
    "sequence": {
      "start": 0,
      "stop": 12.7,
      "step": 0.1,
      "as": "x"
    }
  },
  "transform": [
    {
      "calculate": "sin(datum.x)",
      "as": "sin(x)"
    }
  ],
  "mark": "line",
  "encoding": {
    "x": {
      "field": "x",
      "type": "quantitative"
    },
    "y": {
      "field": "sin(x)",
      "type": "quantitative"
    }
  }
}
```

