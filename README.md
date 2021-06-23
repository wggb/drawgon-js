# DrawgonJS
[![GitHub license](https://img.shields.io/github/license/wggb/drawgon-js?color=%23F7E018&style=flat-square)](https://github.com/wggb/drawgon-js/blob/main/LICENSE) [![npm](https://img.shields.io/npm/v/drawgon?color=F7E018&style=flat-square)](https://www.npmjs.com/package/drawgon)

Customizable canvas drawing library.

# Usage
Add scripts right before closing `</body>` tag:
```html
<script src="https://cdn.jsdelivr.net/npm/paper@0.12.15/dist/paper-full.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/drawgon@1.0.0-alpha.4/dist/drawgon.min.js"></script>
```

You need to have a canvas with a specific id and these attributes in your page:
```html
<canvas id="drawgon" resize="true" data-paper-scope="1"></canvas>
```

Initialize DrawgonJS:
```js
var draw = new Drawgon("drawgon");

// Or you can change the default configurations:
var draw = new Drawgon("drawgon", {
    backgroundColor: "#ffffff",
    mode: "draw",
    tools: ['brush', 'eraser'],
    strokeColor: "#000000",
    strokeCap: "round",
    strokeWidth: 6,
    minStrokeWidth: 1,
    maxStrokeWidth: 9999,
    baseFontSize: 15,
    pathSmoothing: 10,
    cornerSmoothing: 4,
    center: [0, 0],
    zoom: 1,
    maxZoom: 16,
    minZoom: 0.4,
});
```

Choose tools:
```js
// Adding a tool
draw.tools.push(DrawgonTool.get("hand"));;

// Or choosing all available tools:
draw.tools = DrawgonTool.getAll();
```

Now the canvas is ready to use.

# 
- More instructions and details will be added in a few days...
