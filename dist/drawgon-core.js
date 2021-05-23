/*!
  * DrawgonJS v1.0.0-alpha (https://github.com/wggb/drawgon-js)
  * Copyright (c) 2021 WhiteGooseGoesBlack
  * @license MIT (https://github.com/wggb/drawgon-js/blob/main/LICENSE)
  */
{
    let drawgonTools = {
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
            if (tool instanceof DrawgonTool) this.all.push(tool); else console.error("Parameter must be instance of 'DrawgonTool'.");
        },
        remove: function(name) {
            this.all.forEach(function(item, index) {
                if (item.name == name) drawgonTools.all.splice(index, 1);
            });
        }
    };
    var DrawgonTool = function(name, error) {
        let unique = true;
        drawgonTools.getAll().forEach(function(item) {
            if (item.name == name && unique) {
                if (typeof error == "undefined" || error) console.error("You have multiple tools with the same name!");
                unique = false;
            }
        });
        this.name = name;
        this.obj = {};
        this.active = function(drawgon) {
            return false;
        };
        this.onMouseDown = function(event, drawgon) {
            return;
        };
        this.onMouseDrag = function(event, drawgon) {
            return;
        };
        this.onMouseMove = function(event, drawgon) {
            return;
        };
        this.onMouseUp = function(event, drawgon) {
            return;
        };
        this.onKeyDown = function(event, drawgon) {
            return;
        };
        this.onKeyUp = function(event, drawgon) {
            return;
        };
        this.onWheel = function(event, drawgon) {
            return;
        };
        this.onTouchStart = function(event, drawgon) {
            return;
        };
        this.onTouchMove = function(event, drawgon) {
            return;
        };
        this.onTouchEnd = function(event, drawgon) {
            return;
        };
        this.onTouchCancel = function(event, drawgon) {
            return;
        };
        if (unique) drawgonTools.add(this);
    };
    DrawgonTool.getInstance = function(instanceName) {
        return drawgonTools.get(instanceName);
    };
    DrawgonTool.getInstances = function() {
        return drawgonTools.getAll();
    };
    DrawgonTool.getInstanceNames = function() {
        return drawgonTools.getAllNames();
    };
}

var Drawgon = function(id, config) {
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
            let tool = DrawgonTool.getInstance(name);
            if (tool.active($this)) tool.onMouseDown(event, $this);
        });
    };
    this.tool.onMouseDrag = function(event) {
        $this.toolNames.forEach(function(name) {
            let tool = DrawgonTool.getInstance(name);
            if (tool.active($this)) tool.onMouseDrag(event, $this);
        });
    };
    this.tool.onMouseMove = function(event) {
        $this.mouse.point = event.point;
        $this.toolNames.forEach(function(name) {
            let tool = DrawgonTool.getInstance(name);
            if (tool.active($this)) tool.onMouseMove(event, $this);
        });
    };
    this.tool.onMouseUp = function(event) {
        $this.toolNames.forEach(function(name) {
            let tool = DrawgonTool.getInstance(name);
            if (tool.active($this)) tool.onMouseUp(event, $this);
        });
    };
    this.tool.onKeyDown = function(event) {
        $this.toolNames.forEach(function(name) {
            let tool = DrawgonTool.getInstance(name);
            if (tool.active($this)) tool.onKeyDown(event, $this);
        });
    };
    this.tool.onKeyUp = function(event) {
        $this.toolNames.forEach(function(name) {
            let tool = DrawgonTool.getInstance(name);
            if (tool.active($this)) tool.onKeyUp(event, $this);
        });
    };
    document.querySelector(this.selector).addEventListener("wheel", function(event) {
        $this.toolNames.forEach(function(name) {
            let tool = DrawgonTool.getInstance(name);
            if (tool.active($this)) tool.onWheel(event, $this);
        });
    });
    document.querySelector(this.selector).addEventListener("touchstart", function(event) {
        $this.toolNames.forEach(function(name) {
            let tool = DrawgonTool.getInstance(name);
            if (tool.active($this)) tool.onTouchStart(event, $this);
        });
    });
    document.querySelector(this.selector).addEventListener("touchmove", function(event) {
        $this.toolNames.forEach(function(name) {
            let tool = DrawgonTool.getInstance(name);
            if (tool.active($this)) tool.onTouchMove(event, $this);
        });
    });
    document.querySelector(this.selector).addEventListener("touchend", function(event) {
        $this.toolNames.forEach(function(name) {
            let tool = DrawgonTool.getInstance(name);
            if (tool.active($this)) tool.onTouchEnd(event, $this);
        });
    });
    document.querySelector(this.selector).addEventListener("touchcancel", function(event) {
        $this.toolNames.forEach(function(name) {
            let tool = DrawgonTool.getInstance(name);
            if (tool.active($this)) tool.onTouchCancel(event, $this);
        });
    });
};

var drawgonBrush = new DrawgonTool("brush");

drawgonBrush.active = function(drawgon) {
    return !drawgon.hold && drawgon.mode == "draw";
};

drawgonBrush.onMouseDown = function(event, drawgon) {
    drawgon.busy = true;
    let pathName = "#" + drawgon.current.id++;
    drawgon.current.path = new Path({
        segments: [ event.point ],
        strokeColor: drawgon.strokeColor,
        strokeWidth: drawgon.strokeWidth,
        strokeCap: drawgon.strokeCap,
        name: pathName
    });
    drawgon.current.path.add(event.point);
};

drawgonBrush.onMouseDrag = function(event, drawgon) {
    if (drawgon.busy) drawgon.current.path.add(event.point);
};

drawgonBrush.onMouseUp = function(event, drawgon) {
    if (drawgon.busy && drawgon.current.path) {
        if (drawgon.current.path.segments.length > 5) {
            drawgon.current.path.simplify(drawgon.pathSmoothing);
        } else if (drawgon.current.path.segments.length <= 2) {
            drawgon.current.path.add(event.point.add(.1));
            drawgon.current.path.simplify(drawgon.pathSmoothing * 5);
        }
        drawgon.items.push(drawgon.current.path);
        drawgon.resetStats();
    }
};

var drawgonEraser = new DrawgonTool("eraser");

drawgonEraser.active = function(drawgon) {
    return !drawgon.hold && drawgon.mode == "del";
};

drawgonEraser.obj["path"] = null;

drawgonEraser.obj["removeIntersections"] = function(drawgon) {
    drawgon.items.forEach(function(item) {
        let intersections = drawgonEraser.obj.path.getIntersections(item instanceof Path ? item : new Path.Rectangle(item.bounds));
        if (intersections.length > 0) drawgon.deleteItem(item.name);
    });
};

drawgonEraser.onMouseDown = function(event, drawgon) {
    drawgon.busy = true;
    drawgonEraser.obj.path = new Path({
        segments: [ event.point ],
        strokeWidth: 1
    });
    drawgonEraser.obj.path.add(event.point);
    drawgonEraser.obj.removeIntersections(drawgon);
};

drawgonEraser.onMouseDrag = function(event, drawgon) {
    if (drawgon.busy) {
        if (event.item) drawgon.deleteItem(event.item.name);
        drawgonEraser.obj.path.add(event.point);
        drawgonEraser.obj.removeIntersections(drawgon);
    }
};

drawgonEraser.onMouseUp = function(event, drawgon) {
    if (drawgonEraser.obj.path) {
        drawgonEraser.obj.path.remove();
        drawgonEraser.obj.path = null;
    }
    drawgon.resetStats();
};