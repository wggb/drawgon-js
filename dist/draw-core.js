/*!
  * Draw-JS v1.0.0-alpha (https://github.com/wggb/draw-js)
  * Copyright (c) 2021 WhiteGooseGoesBlack
  * @license MIT (https://github.com/wggb/draw-js/blob/main/LICENSE)
  */
{
    let drawTools = {
        all: [],
        getAllNames: function() {
            let names = [];
            this.all.forEach(function(tool) {
                names.push(tool.name);
            });
            return names.slice();
        },
        getAll: function(name) {
            if (typeof name == "undefined") {
                return this.all.slice();
            } else {
                let tools = [];
                this.all.forEach(function(item) {
                    if (item.name == name) tools.push(item);
                });
                return tools.slice();
            }
        },
        get: function(name) {
            let tools = this.getAll(name);
            if (tools.length > 0) return tools[0]; else return null;
        },
        add: function(tool) {
            if (tool instanceof DrawTool) this.all.push(tool); else console.error("Parameter must be instance of 'DrawTool'.");
        },
        remove: function(name) {
            this.all.forEach(function(item, index) {
                if (item.name == name) drawTools.all.splice(index, 1);
            });
        }
    };
    var DrawTool = function(name, error) {
        let unique = true;
        drawTools.getAll().forEach(function(item) {
            if (item.name == name && unique) {
                if (typeof error == "undefined" || error) console.error("You have multiple tools with the same name!");
                unique = false;
            }
        });
        this.name = name;
        this.obj = {};
        this.active = function(drawCanvas) {
            return false;
        };
        this.onMouseDown = function(event, drawCanvas) {
            return;
        };
        this.onMouseDrag = function(event, drawCanvas) {
            return;
        };
        this.onMouseMove = function(event, drawCanvas) {
            return;
        };
        this.onMouseUp = function(event, drawCanvas) {
            return;
        };
        this.onKeyDown = function(event, drawCanvas) {
            return;
        };
        this.onKeyUp = function(event, drawCanvas) {
            return;
        };
        this.onWheel = function(event, drawCanvas) {
            return;
        };
        this.onTouchStart = function(event, drawCanvas) {
            return;
        };
        this.onTouchMove = function(event, drawCanvas) {
            return;
        };
        this.onTouchEnd = function(event, drawCanvas) {
            return;
        };
        this.onTouchCancel = function(event, drawCanvas) {
            return;
        };
        if (unique) drawTools.add(this);
    };
    DrawTool.getInstance = function(instanceName) {
        return drawTools.get(instanceName);
    };
    DrawTool.getInstances = function() {
        return drawTools.getAll();
    };
    DrawTool.getInstanceNames = function() {
        return drawTools.getAllNames();
    };
}

var DrawCanvas = function(id, config) {
    paper.install(window);
    paper.setup(id);
    let $this = this;
    this.tool = new Tool();
    this.config = {
        backgroundColor: "#ffffff",
        mode: "draw",
        strokeColor: "#000000",
        strokeCap: "round",
        strokeWidth: 6,
        minStrokeWidth: 1,
        maxStrokeWidth: 9999,
        baseFontSize: 15,
        pathSmoothing: 10,
        cornerSmoothing: 4,
        zoom: 1,
        maxZoom: 16,
        minZoom: .4
    };
    if (typeof config != "undefined") Object.assign(this.config, config);
    this.selector = "#" + id;
    this.backgroundColor = this.config.backgroundColor;
    this.mode = this.config.mode;
    this.strokeColor = this.config.strokeColor;
    this.strokeCap = this.config.strokeCap;
    this.strokeWidth = this.config.strokeWidth;
    this.minStrokeWidth = this.config.minStrokeWidth;
    this.maxStrokeWidth = this.config.maxStrokeWidth;
    this.baseFontSize = this.config.baseFontSize;
    this.pathSmoothing = this.config.pathSmoothing;
    this.cornerSmoothing = this.config.cornerSmoothing;
    view.zoom = this.config.zoom;
    this.maxZoom = this.config.maxZoom;
    this.minZoom = this.config.minZoom;
    this.current = {
        id: 0,
        path: null,
        text: null
    };
    this.mouse = {
        point: null,
        click: null
    };
    this.delete = true;
    this.busy = false;
    this.hold = false;
    this.items = [];
    this.toolNames = [ "brush", "eraser" ];
    this.changeMode = function(mode) {
        $this.resetStats();
        $this.mode = mode;
    };
    this.resetStats = function() {
        if ($this.current.path) $this.current.path.selected = false;
        if ($this.current.text) {
            $this.current.text.selected = false;
            if ($this.current.text.content.trim() != "") {
                $this.current.text.name = "#" + $this.current.id++;
                $this.items.push($this.current.text);
            }
        }
        $this.busy = false;
        $this.current.path = null;
        $this.current.text = null;
        $this.mouse.click = null;
        $this.clearSelection();
    };
    this.resetConfig = function() {
        $this.mode = $this.config.mode;
        $this.strokeWidth = $this.config.strokeWidth;
        $this.strokeColor = $this.config.strokeColor;
        view.zoom = $this.config.zoom;
    };
    this.clear = function() {
        $this.items.forEach(function(path) {
            path.remove();
        });
        $this.items = [];
    };
    this.clearSelection = function() {
        $this.selectActiveLayer(false);
    };
    this.deleteItem = function(name) {
        $this.items.forEach(function(item, index) {
            if (item.name == name) {
                item.remove();
                $this.items.splice(index, 1);
            }
        });
    };
    this.getSelectedItems = function() {
        let selectedItems = [];
        $this.items.forEach(function(item) {
            if (item.selected) selectedItems.push(item);
        });
        return selectedItems;
    };
    this.selectActiveLayer = function(value) {
        project.activeLayer.selected = value;
    };
    this.getCenter = function() {
        return view.center;
    };
    this.getCenterAsArray = function() {
        return [ view.center.x, view.center.y ];
    };
    this.setCenter = function(pos) {
        if (pos instanceof Point) {
            view.center = pos;
        } else if (pos instanceof Array) {
            view.center = new Point(pos[0], pos[1]);
        }
    };
    this.zoomCanvas = function(rate, multiply) {
        let zoomValue = view.zoom * rate;
        multiply = typeof multiply != "undefined" ? multiply : 0;
        if (zoomValue >= $this.minZoom && zoomValue <= $this.maxZoom && (view.zoom < $this.maxZoom && rate > 1 || view.zoom > $this.minZoom && rate < 1)) {
            let direction = rate < 1 ? -1 : 1;
            if (multiply > 0) $this.setCenter(view.center.add($this.mouse.point.subtract(view.center).divide(rate * direction * multiply)));
            view.zoom = zoomValue;
        }
    };
    this.changeSelectedWidth = function(width) {
        width = typeof width == "undefined" || isNaN(width) ? $this.strokeWidth : width;
        if (width < $this.minStrokeWidth) width = $this.minStrokeWidth;
        if (width > $this.maxStrokeWidth) width = $this.maxStrokeWidth;
        $this.getSelectedItems().forEach(function(item) {
            if (item instanceof Path) {
                item.strokeWidth = width;
            } else if (item instanceof PointText) {
                item.fontSize = width + $this.baseFontSize;
            }
        });
    };
    this.changeSelectedColor = function(color) {
        color = typeof color != "undefined" ? color : $this.color;
        $this.getSelectedItems().forEach(function(item) {
            if (item instanceof Path) {
                item.strokeColor = color;
            } else if (item instanceof PointText) {
                item.fillColor = color;
            }
        });
    };
    let rect = null;
    this.addBackground = function() {
        rect = new paper.Path.Rectangle({
            point: [ view.center.x - view.size.width / 2, view.center.y - view.size.height / 2 ],
            size: [ view.size.width, view.size.height ],
            strokeColor: $this.backgroundColor,
            selected: false
        });
        rect.sendToBack();
        rect.fillColor = $this.backgroundColor;
    };
    this.removeBackground = function() {
        if (rect) rect.remove();
    };
    this.getDataAsJSON = function() {
        return JSON.stringify($this.items);
    };
    this.getDataURLAsJPEG = function() {
        return document.querySelector($this.selector).toDataURL("image/jpeg");
    };
    this.getDataURLAsPNG = function() {
        return document.querySelector($this.selector).toDataURL("image/png");
    };
    this.loadDataFromJSON = function(text) {
        try {
            JSON.parse(text).forEach(function(item) {
                let mode = item[0].trim().toLowerCase();
                if (mode == "path") $this.items.push(new Path(item[1])); else if (mode == "pointtext") $this.items.push(new PointText(item[1]));
            });
        } catch (error) {
            alert("Text can't be parsed.");
        }
    };
    this.setDataFromJSON = function(text) {
        $this.clear();
        $this.loadDataFromJSON(text);
    };
    this.tool.onMouseDown = function(event) {
        $this.mouse.click = event.point;
        $this.toolNames.forEach(function(name) {
            let tool = DrawTool.getInstance(name);
            if (tool.active($this)) tool.onMouseDown(event, $this);
        });
    };
    this.tool.onMouseDrag = function(event) {
        $this.toolNames.forEach(function(name) {
            let tool = DrawTool.getInstance(name);
            if (tool.active($this)) tool.onMouseDrag(event, $this);
        });
    };
    this.tool.onMouseMove = function(event) {
        $this.mouse.point = event.point;
        $this.toolNames.forEach(function(name) {
            let tool = DrawTool.getInstance(name);
            if (tool.active($this)) tool.onMouseMove(event, $this);
        });
    };
    this.tool.onMouseUp = function(event) {
        $this.toolNames.forEach(function(name) {
            let tool = DrawTool.getInstance(name);
            if (tool.active($this)) tool.onMouseUp(event, $this);
        });
    };
    this.tool.onKeyDown = function(event) {
        $this.toolNames.forEach(function(name) {
            let tool = DrawTool.getInstance(name);
            if (tool.active($this)) tool.onKeyDown(event, $this);
        });
    };
    this.tool.onKeyUp = function(event) {
        $this.toolNames.forEach(function(name) {
            let tool = DrawTool.getInstance(name);
            if (tool.active($this)) tool.onKeyUp(event, $this);
        });
    };
    document.querySelector(this.selector).addEventListener("wheel", function(event) {
        $this.toolNames.forEach(function(name) {
            let tool = DrawTool.getInstance(name);
            if (tool.active($this)) tool.onWheel(event, $this);
        });
    });
    document.querySelector(this.selector).addEventListener("touchstart", function(event) {
        $this.toolNames.forEach(function(name) {
            let tool = DrawTool.getInstance(name);
            if (tool.active($this)) tool.onTouchStart(event, $this);
        });
    });
    document.querySelector(this.selector).addEventListener("touchmove", function(event) {
        $this.toolNames.forEach(function(name) {
            let tool = DrawTool.getInstance(name);
            if (tool.active($this)) tool.onTouchMove(event, $this);
        });
    });
    document.querySelector(this.selector).addEventListener("touchend", function(event) {
        $this.toolNames.forEach(function(name) {
            let tool = DrawTool.getInstance(name);
            if (tool.active($this)) tool.onTouchEnd(event, $this);
        });
    });
    document.querySelector(this.selector).addEventListener("touchcancel", function(event) {
        $this.toolNames.forEach(function(name) {
            let tool = DrawTool.getInstance(name);
            if (tool.active($this)) tool.onTouchCancel(event, $this);
        });
    });
};

var drawBrush = new DrawTool("brush");

drawBrush.active = function(drawCanvas) {
    return !drawCanvas.hold && drawCanvas.mode == "draw";
};

drawBrush.onMouseDown = function(event, drawCanvas) {
    drawCanvas.busy = true;
    let pathName = "#" + drawCanvas.current.id++;
    drawCanvas.current.path = new Path({
        segments: [ event.point ],
        strokeColor: drawCanvas.strokeColor,
        strokeWidth: drawCanvas.strokeWidth,
        strokeCap: drawCanvas.strokeCap,
        name: pathName
    });
    drawCanvas.current.path.add(event.point);
};

drawBrush.onMouseDrag = function(event, drawCanvas) {
    if (drawCanvas.busy) drawCanvas.current.path.add(event.point);
};

drawBrush.onMouseUp = function(event, drawCanvas) {
    if (drawCanvas.busy && drawCanvas.current.path) {
        if (drawCanvas.current.path.segments.length > 5) {
            drawCanvas.current.path.simplify(drawCanvas.pathSmoothing);
        } else if (drawCanvas.current.path.segments.length <= 2) {
            drawCanvas.current.path.add(event.point.add(.1));
            drawCanvas.current.path.simplify(drawCanvas.pathSmoothing * 5);
        }
        drawCanvas.items.push(drawCanvas.current.path);
        drawCanvas.resetStats();
    }
};

var drawEraser = new DrawTool("eraser");

drawEraser.active = function(drawCanvas) {
    return !drawCanvas.hold && drawCanvas.mode == "del";
};

drawEraser.obj["path"] = null;

drawEraser.obj["removeIntersections"] = function(drawCanvas) {
    drawCanvas.items.forEach(function(item) {
        let intersections = drawEraser.obj.path.getIntersections(item instanceof Path ? item : new Path.Rectangle(item.bounds));
        if (intersections.length > 0) drawCanvas.deleteItem(item.name);
    });
};

drawEraser.onMouseDown = function(event, drawCanvas) {
    drawCanvas.busy = true;
    drawEraser.obj.path = new Path({
        segments: [ event.point ],
        strokeWidth: 1
    });
    drawEraser.obj.path.add(event.point);
    drawEraser.obj.removeIntersections(drawCanvas);
};

drawEraser.onMouseDrag = function(event, drawCanvas) {
    if (drawCanvas.busy) {
        if (event.item) drawCanvas.deleteItem(event.item.name);
        drawEraser.obj.path.add(event.point);
        drawEraser.obj.removeIntersections(drawCanvas);
    }
};

drawEraser.onMouseUp = function(event, drawCanvas) {
    if (drawEraser.obj.path) {
        drawEraser.obj.path.remove();
        drawEraser.obj.path = null;
    }
    drawCanvas.resetStats();
};