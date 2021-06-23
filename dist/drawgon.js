/*!
  * DrawgonJS v1.0.0-alpha.4 (https://github.com/wggb/drawgon-js)
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
        getAll: function() {
            return this.all;
        },
        get: function(name) {
            let tool = null;
            this.all.forEach(function(item) {
                if (item.name == name) tool = item;
            });
            return tool;
        },
        add: function(tool) {
            if (tool instanceof DrawgonTool) this.all.push(tool); else throw new Error("Parameter must be instance of 'DrawgonTool'.");
        },
        remove: function(name) {
            this.all.forEach(function(item, index) {
                if (item.name == name) drawgonTools.all.splice(index, 1);
            });
        }
    };
    var DrawgonTool = function(name) {
        this.name = undefined;
        if (name) {
            drawgonTools.getAll().slice().forEach(function(item) {
                if (item.name == name) throw new Error("The name '" + name + "' already exists.");
            });
            this.name = name;
        }
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
        if (name) drawgonTools.add(this);
    };
    /**
     * @preserve
     * @deprecated Since version 1.0.0-alpha.4. Will be deleted in version 1.0.0. Use get instead.
     */    DrawgonTool.getInstance = function(instanceName) {
        return drawgonTools.get(instanceName);
    };
    /**
     * @preserve
     * @deprecated Since version 1.0.0-alpha.4. Will be deleted in version 1.0.0. Use getAll instead.
     */    DrawgonTool.getInstances = function() {
        return drawgonTools.getAll();
    };
    DrawgonTool.getInstanceNames = function() {
        return drawgonTools.getAllNames();
    };
    DrawgonTool.get = function(name) {
        return drawgonTools.get(name);
    };
    DrawgonTool.getAll = function() {
        return drawgonTools.getAll();
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
        tools: [ "brush", "eraser" ],
        strokeColor: "#000000",
        strokeCap: "round",
        strokeWidth: 6,
        minStrokeWidth: 1,
        maxStrokeWidth: 9999,
        baseFontSize: 15,
        pathSmoothing: 10,
        cornerSmoothing: 4,
        center: [ view.center.x, view.center.y ],
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
    view.center = this.config.center;
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
    /**
     * @preserve
     * @deprecated Since version 1.0.0-alpha.4. Will be deleted in version 1.0.0.
     * Use "tools" in drawgon config object in constructor arguments instead.
     */    this.toolNames = [];
    this.tools = [];
    this.getTools = function() {
        let allTools = $this.tools.slice();
        let existingToolNames = [];
        allTools.forEach(function(tool) {
            if (tool.name) existingToolNames.push(tool.name);
        });
        let newToolNames = $this.config.tools.slice();
        newToolNames = newToolNames.concat($this.toolNames);
        newToolNames.forEach(function(name) {
            if (!existingToolNames.includes(name)) {
                allTools.push(DrawgonTool.get(name));
                existingToolNames.push(name);
            }
        });
        return allTools;
    };
    this.changeMode = function(mode) {
        $this.resetStats();
        $this.mode = mode;
        return $this.mode;
    };
    this.changeStrokeWidth = function(width) {
        width = Number(width);
        if (!isNaN(width) && width >= $this.minStrokeWidth && width <= $this.maxStrokeWidth) $this.strokeWidth = width; else if (!isNaN(width) && width < $this.minStrokeWidth) $this.strokeWidth = $this.minStrokeWidth; else if (!isNaN(width) && width > $this.maxStrokeWidth) $this.strokeWidth = $this.maxStrokeWidth;
        return $this.strokeWidth;
    };
    this.changeStrokeColor = function(color) {
        $this.strokeColor = color;
        return $this.strokeColor;
    };
    this.changeStrokeCap = function(cap) {
        $this.strokeCap = cap;
        return $this.strokeCap;
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
        view.center = $this.config.center;
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
        width = typeof width == "undefined" || isNaN(Number(width)) ? $this.strokeWidth : Number(width);
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
        JSON.parse(text).forEach(function(item) {
            let mode = item[0].trim().toLowerCase();
            if (mode == "path") $this.items.push(new Path(item[1])); else if (mode == "pointtext") $this.items.push(new PointText(item[1])); else if (mode == "raster") $this.items.push(new Raster(item[1]));
        });
    };
    this.setDataFromJSON = function(text) {
        $this.clear();
        return $this.loadDataFromJSON(text);
    };
    this.tool.onMouseDown = function(event) {
        $this.mouse.click = event.point;
        $this.getTools().forEach(function(tool) {
            if (tool.active($this)) tool.onMouseDown(event, $this);
        });
    };
    this.tool.onMouseDrag = function(event) {
        $this.getTools().forEach(function(tool) {
            if (tool.active($this)) tool.onMouseDrag(event, $this);
        });
    };
    this.tool.onMouseMove = function(event) {
        $this.mouse.point = event.point;
        $this.getTools().forEach(function(tool) {
            if (tool.active($this)) tool.onMouseMove(event, $this);
        });
    };
    this.tool.onMouseUp = function(event) {
        $this.getTools().forEach(function(tool) {
            if (tool.active($this)) tool.onMouseUp(event, $this);
        });
    };
    this.tool.onKeyDown = function(event) {
        $this.getTools().forEach(function(tool) {
            if (tool.active($this)) tool.onKeyDown(event, $this);
        });
    };
    this.tool.onKeyUp = function(event) {
        $this.getTools().forEach(function(tool) {
            if (tool.active($this)) tool.onKeyUp(event, $this);
        });
    };
    document.querySelector(this.selector).addEventListener("wheel", function(event) {
        $this.getTools().forEach(function(tool) {
            if (tool.active($this)) tool.onWheel(event, $this);
        });
    });
    document.querySelector(this.selector).addEventListener("touchstart", function(event) {
        $this.getTools().forEach(function(tool) {
            if (tool.active($this)) tool.onTouchStart(event, $this);
        });
    });
    document.querySelector(this.selector).addEventListener("touchmove", function(event) {
        $this.getTools().forEach(function(tool) {
            if (tool.active($this)) tool.onTouchMove(event, $this);
        });
    });
    document.querySelector(this.selector).addEventListener("touchend", function(event) {
        $this.getTools().forEach(function(tool) {
            if (tool.active($this)) tool.onTouchEnd(event, $this);
        });
    });
    document.querySelector(this.selector).addEventListener("touchcancel", function(event) {
        $this.getTools().forEach(function(tool) {
            if (tool.active($this)) tool.onTouchCancel(event, $this);
        });
    });
};

new DrawgonTool("brush").active = function(drawgon) {
    return !drawgon.hold && drawgon.mode == "draw";
};

DrawgonTool.get("brush").onMouseDown = function(event, drawgon) {
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

DrawgonTool.get("brush").onMouseDrag = function(event, drawgon) {
    if (drawgon.busy) drawgon.current.path.add(event.point);
};

DrawgonTool.get("brush").onMouseUp = function(event, drawgon) {
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

new DrawgonTool("circle").active = function(drawgon) {
    return !drawgon.hold && drawgon.mode == "circle";
};

DrawgonTool.get("circle").onMouseDrag = function(event, drawgon) {
    let clickPoint = drawgon.mouse.click;
    drawgon.current.path = new Path.Circle({
        center: new Point(clickPoint.x - (clickPoint.x - event.point.x) / 2, clickPoint.y - (clickPoint.y - event.point.y) / 2),
        radius: new Point((clickPoint.x - event.point.x) / 2, (clickPoint.y - event.point.y) / 2)
    });
    drawgon.current.path.strokeColor = drawgon.strokeColor;
    drawgon.current.path.strokeWidth = drawgon.strokeWidth;
    drawgon.current.path.removeOnDrag();
};

DrawgonTool.get("circle").onMouseUp = function(event, drawgon) {
    if (drawgon.current.path) {
        drawgon.current.path.name = "#" + drawgon.current.id++;
        drawgon.items.push(drawgon.current.path);
    }
    drawgon.resetStats();
};

new DrawgonTool("eraser").active = function(drawgon) {
    return !drawgon.hold && drawgon.mode == "del" && drawgon.delete;
};

DrawgonTool.get("eraser").obj["path"] = null;

DrawgonTool.get("eraser").obj["removeIntersections"] = function(drawgon) {
    drawgon.items.forEach(function(item) {
        let intersections = DrawgonTool.get("eraser").obj.path.getIntersections(item instanceof Path ? item : new Path.Rectangle(item.bounds));
        if (intersections.length > 0) drawgon.deleteItem(item.name);
    });
};

DrawgonTool.get("eraser").onMouseDown = function(event, drawgon) {
    drawgon.busy = true;
    DrawgonTool.get("eraser").obj.path = new Path({
        segments: [ event.point ],
        strokeWidth: 1
    });
    DrawgonTool.get("eraser").obj.path.add(event.point);
    DrawgonTool.get("eraser").obj.removeIntersections(drawgon);
};

DrawgonTool.get("eraser").onMouseDrag = function(event, drawgon) {
    if (drawgon.busy) {
        if (event.item) drawgon.deleteItem(event.item.name);
        DrawgonTool.get("eraser").obj.path.add(event.point);
        DrawgonTool.get("eraser").obj.removeIntersections(drawgon);
    }
};

DrawgonTool.get("eraser").onMouseUp = function(event, drawgon) {
    if (DrawgonTool.get("eraser").obj.path) {
        DrawgonTool.get("eraser").obj.path.remove();
        DrawgonTool.get("eraser").obj.path = null;
    }
    drawgon.resetStats();
};

new DrawgonTool("hand").active = function(drawgon) {
    return !drawgon.hold && drawgon.mode == "move";
};

DrawgonTool.get("hand").onMouseDown = function(event, drawgon) {
    drawgon.busy = true;
};

DrawgonTool.get("hand").onMouseDrag = function(event, drawgon) {
    if (drawgon.busy) view.center = view.center.add(drawgon.mouse.click.subtract(event.point));
};

DrawgonTool.get("hand").onMouseUp = function(event, drawgon) {
    drawgon.busy = false;
};

new DrawgonTool("rectangle").active = function(drawgon) {
    return !drawgon.hold && drawgon.mode == "rect";
};

DrawgonTool.get("rectangle").onMouseDrag = function(event, drawgon) {
    let clickPoint = drawgon.mouse.click;
    let rect = new Rectangle(clickPoint, event.point);
    drawgon.current.path = new Path.Rectangle(rect, drawgon.cornerSmoothing);
    drawgon.current.path.strokeColor = drawgon.strokeColor;
    drawgon.current.path.strokeWidth = drawgon.strokeWidth;
    drawgon.current.path.removeOnDrag();
};

DrawgonTool.get("rectangle").onMouseUp = function(event, drawgon) {
    if (drawgon.current.path) {
        drawgon.current.path.name = "#" + drawgon.current.id++;
        drawgon.items.push(drawgon.current.path);
    }
    drawgon.resetStats();
};

new DrawgonTool("text").active = function(drawgon) {
    return !drawgon.hold && drawgon.mode == "text";
};

DrawgonTool.get("text").obj["enterToSubmit"] = true;

DrawgonTool.get("text").obj["shift"] = false;

DrawgonTool.get("text").obj["id"] = "draw-text-element";

DrawgonTool.get("text").obj["drawgon"] = null;

DrawgonTool.get("text").obj["createTextElement"] = function(id, drawgon) {
    DrawgonTool.get("text").obj.removeTextElement(id);
    let element = document.createElement("textarea");
    element.id = id;
    element.oninput = DrawgonTool.get("text").obj.readTextElement;
    element.style.width = 0;
    element.style.height = 0;
    element.style.opacity = 0;
    element.style.position = "fixed";
    document.body.appendChild(element);
    return element;
};

DrawgonTool.get("text").obj["removeTextElement"] = function() {
    try {
        document.body.removeChild(document.getElementById(DrawgonTool.get("text").obj.id));
    } catch (e) {}
};

DrawgonTool.get("text").obj["readTextElement"] = function() {
    let drawgon = DrawgonTool.get("text").obj.drawgon;
    if (drawgon.busy) drawgon.current.text.content = document.getElementById(DrawgonTool.get("text").obj.id).value;
};

DrawgonTool.get("text").obj["pushCurrentText"] = function(drawgon) {
    if (drawgon.current.text.content.trim() != "") {
        drawgon.current.text.name = "#" + drawgon.current.id++;
        drawgon.items.push(drawgon.current.text);
    }
};

DrawgonTool.get("text").onMouseDown = function(event, drawgon) {
    DrawgonTool.get("text").obj.drawgon = drawgon;
    if (drawgon.current.text) {
        drawgon.current.text.selected = false;
        DrawgonTool.get("text").obj.pushCurrentText(drawgon);
    }
    drawgon.busy = true;
    drawgon.current.text = new PointText({
        content: "",
        point: drawgon.mouse.click,
        fillColor: drawgon.strokeColor,
        fontSize: drawgon.strokeWidth + drawgon.baseFontSize,
        selected: true
    });
    DrawgonTool.get("text").obj.createTextElement(DrawgonTool.get("text").obj.id, drawgon).focus();
};

DrawgonTool.get("text").onKeyDown = function(event, drawgon) {
    if (event.key == "shift") DrawgonTool.get("text").obj.shift = true;
    let submit = DrawgonTool.get("text").obj.enterToSubmit != DrawgonTool.get("text").obj.shift;
    if (drawgon.busy && event.key == "enter" && submit) {
        drawgon.current.text.selected = false;
        DrawgonTool.get("text").obj.removeTextElement();
        drawgon.resetStats();
    }
};

DrawgonTool.get("text").onKeyUp = function(event, drawgon) {
    if (event.key == "shift") DrawgonTool.get("text").obj.shift = false;
};

new DrawgonTool("zoom").active = function(drawgon) {
    return true;
};

DrawgonTool.get("zoom").obj["onPinchDistance"] = null;

DrawgonTool.get("zoom").obj["getEventDistance"] = function(event) {
    let touches = event.touches;
    return Math.sqrt(Math.pow(touches[0].clientX - touches[1].clientX, 2) + Math.pow(touches[0].clientY - touches[1].clientY, 2));
};

DrawgonTool.get("zoom").onWheel = function(event, drawgon) {
    if (event.deltaY < 0) drawgon.zoomCanvas(1.2, 5); else if (event.deltaY > 0) drawgon.zoomCanvas(.8, 5);
};

DrawgonTool.get("zoom").onTouchStart = function(event, drawgon) {
    if (drawgon.mode == "move" && event.touches.length > 1) {
        DrawgonTool.get("zoom").obj.onPinchDistance = DrawgonTool.get("zoom").obj.getEventDistance(event);
    }
};

DrawgonTool.get("zoom").onTouchMove = function(event, drawgon) {
    if (drawgon.mode == "move" && event.touches.length > 1) {
        event.preventDefault();
        let newPinchDistance = DrawgonTool.get("zoom").obj.getEventDistance(event);
        drawgon.zoomCanvas(Math.abs(newPinchDistance / onPinchDistance));
        DrawgonTool.get("zoom").obj.onPinchDistance = newPinchDistance;
    }
};