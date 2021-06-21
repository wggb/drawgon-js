/*!
  * DrawgonJS v1.0.0-alpha.3 (https://github.com/wggb/drawgon-js)
  * Copyright (c) 2021 WhiteGooseGoesBlack
  * @license MIT (https://github.com/wggb/drawgon-js/blob/main/LICENSE)
  */

{
    let drawgonTools = {
        all: [],
        getAllNames: function () {
            let names = [];
            this.all.forEach(function (tool) {
                names.push(tool.name);
            });
            return names.slice();  // Copy the value
        },
        getAll: function () {
            return this.all;
        },
        get: function (name) {
            let tool = null;
            this.all.forEach(function (item) {
                if (item.name == name) tool = item;
            });
            return tool;
        },
        add: function (tool) {
            if (tool instanceof DrawgonTool) this.all.push(tool);
            else throw new Error('Parameter must be instance of \'DrawgonTool\'.');
        },
        remove: function (name) {
            this.all.forEach(function (item, index) {
                if (item.name == name) drawgonTools.all.splice(index, 1);
            });
        }
    };

    var DrawgonTool = function (name) {
        this.name = undefined;
        if (name) {
            drawgonTools.getAll().slice().forEach(function (item) {
                if (item.name == name)
                    throw new Error('The name \'' + name + '\' already exists.');
            });

            this.name = name;
        }

        this.obj = {};

        this.active = function (drawgon) { return false; };

        this.onMouseDown = function (event, drawgon) { return; };
        this.onMouseDrag = function (event, drawgon) { return; };
        this.onMouseMove = function (event, drawgon) { return; };
        this.onMouseUp = function (event, drawgon) { return; };
        this.onKeyDown = function (event, drawgon) { return; };
        this.onKeyUp = function (event, drawgon) { return; };
        this.onWheel = function (event, drawgon) { return; };
        this.onTouchStart = function (event, drawgon) { return; };
        this.onTouchMove = function (event, drawgon) { return; };
        this.onTouchEnd = function (event, drawgon) { return; };
        this.onTouchCancel = function (event, drawgon) { return; };

        if (name) drawgonTools.add(this);
    };

    /**
     * @preserve
     * @deprecated Since version 1.0.0-alpha.4. Will be deleted in version 1.0.0. Use get instead.
     */
    DrawgonTool.getInstance = function (instanceName) {
        return drawgonTools.get(instanceName);
    };


    /**
     * @preserve
     * @deprecated Since version 1.0.0-alpha.4. Will be deleted in version 1.0.0. Use getAll instead.
     */
    DrawgonTool.getInstances = function () {
        return drawgonTools.getAll();
    };

    DrawgonTool.getInstanceNames = function () {
        return drawgonTools.getAllNames();
    };

    DrawgonTool.get = function (name) {
        return drawgonTools.get(name);
    };

    DrawgonTool.getAll = function () {
        return drawgonTools.getAll();
    };
}

var Drawgon = function (id, config) {
    paper.install(window);
    paper.setup(id);  // Better to be called on load

    let $this = this;
    this.tool = new Tool();

    this.config = {
        backgroundColor: '#ffffff',
        mode: 'draw',
        tools: ['brush', 'eraser'],
        strokeColor: '#000000',
        strokeCap: 'round',
        strokeWidth: 6,
        minStrokeWidth: 1,  // >= 1
        maxStrokeWidth: 9999,
        baseFontSize: 15,
        pathSmoothing: 10,
        cornerSmoothing: 4,
        center: [view.center.x, view.center.y],
        zoom: 1,
        maxZoom: 16,
        minZoom: 0.4
    };
    if (typeof config != 'undefined') Object.assign(this.config, config);

    this.selector = '#' + id;

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
     */
    this.toolNames = [];

    this.tools = [];

    this.getTools = function () {
        let allTools = $this.tools.slice();
        let existingToolNames = [];
        allTools.forEach(function (tool) {
            if (tool.name) existingToolNames.push(tool.name);
        });

        let newToolNames = $this.config.tools.slice();
        newToolNames = newToolNames.concat($this.toolNames);  // Delete this line in v1.0.0.
        newToolNames.forEach(function (name) {
            if (!existingToolNames.includes(name)) {
                allTools.push(DrawgonTool.get(name));
                existingToolNames.push(name);
            }
        });

        return allTools;
    };


    // ----- MODE CONFIG -----

    this.changeMode = function (mode) {
        $this.resetStats();
        $this.mode = mode;
        return $this.mode;
    };


    // ----- STROKE CONFIG -----

    this.changeStrokeWidth = function (width) {
        width = Number(width);
        if (!isNaN(width) && width >= $this.minStrokeWidth && width <= $this.maxStrokeWidth)
            $this.strokeWidth = width;
        else if (!isNaN(width) && width < $this.minStrokeWidth)
            $this.strokeWidth = $this.minStrokeWidth;
        else if (!isNaN(width) && width > $this.maxStrokeWidth)
            $this.strokeWidth = $this.maxStrokeWidth;
        return $this.strokeWidth;
    };

    this.changeStrokeColor = function (color) {
        $this.strokeColor = color;
        return $this.strokeColor;
    };

    this.changeStrokeCap = function (cap) {
        $this.strokeCap = cap;
        return $this.strokeCap;
    };


    // ----- CLEAR/RESET -----

    this.resetStats = function () {
        if ($this.current.path)
            $this.current.path.selected = false;
        if ($this.current.text) {
            $this.current.text.selected = false;

            // Push text to items if current text item was not empty
            // This part needs to be changed (later...)
            if ($this.current.text.content.trim() != '') {
                $this.current.text.name = '#' + $this.current.id++;
                $this.items.push($this.current.text);
            }
        }
        $this.busy = false;
        $this.current.path = null;
        $this.current.text = null;
        $this.mouse.click = null;

        $this.clearSelection();
    };

    this.resetConfig = function () {
        $this.mode = $this.config.mode;
        $this.strokeWidth = $this.config.strokeWidth;
        $this.strokeColor = $this.config.strokeColor;
        view.center = $this.config.center;
        view.zoom = $this.config.zoom;
    };

    this.clear = function () {
        $this.items.forEach(function (path) {
            path.remove()
        });
        $this.items = [];
    };

    this.clearSelection = function () {
        $this.selectActiveLayer(false);
    };

    this.deleteItem = function (name) {
        $this.items.forEach(function (item, index) {
            if (item.name == name) {
                item.remove();
                $this.items.splice(index, 1);
            }
        });
    };


    // ----- SELECTED ITEMS -----

    this.getSelectedItems = function () {
        let selectedItems = [];
        $this.items.forEach(function (item) {
            if (item.selected) selectedItems.push(item);
        });
        return selectedItems;
    };


    // ----- VIEW CONFIG -----

    this.selectActiveLayer = function (value) {
        project.activeLayer.selected = value;
    };

    this.getCenter = function () {
        return view.center;
    };

    this.getCenterAsArray = function () {
        return [view.center.x, view.center.y];
    };

    this.setCenter = function (pos) {
        if (pos instanceof Point) {
            view.center = pos;
        } else if (pos instanceof Array) {
            view.center = new Point(pos[0], pos[1]);
        }
    };

    this.zoomCanvas = function (rate, multiply) {
        let zoomValue = view.zoom * rate;
        multiply = (typeof multiply != 'undefined') ? multiply : 0;
        if (zoomValue >= $this.minZoom && zoomValue <= $this.maxZoom &&
            ((view.zoom < $this.maxZoom && rate > 1) ||
                (view.zoom > $this.minZoom && rate < 1))) {
            let direction = (rate < 1) ? -1 : 1;
            if (multiply > 0)
                $this.setCenter(
                    view.center.add($this.mouse.point.subtract(view.center)
                        .divide(rate * direction * multiply))
                );
            view.zoom = zoomValue;
        }
    };


    // ----- CHANGE SELECTED COLOR/WIDTH -----

    this.changeSelectedWidth = function (width) {
        width = (typeof width == 'undefined' || isNaN(Number(width)))
            ? $this.strokeWidth : Number(width);
        if (width < $this.minStrokeWidth) width = $this.minStrokeWidth;
        if (width > $this.maxStrokeWidth) width = $this.maxStrokeWidth;
        $this.getSelectedItems().forEach(function (item) {
            if (item instanceof Path) {
                item.strokeWidth = width;
            } else if (item instanceof PointText) {
                item.fontSize = width + $this.baseFontSize;
            }
        });
    };

    this.changeSelectedColor = function (color) {
        color = (typeof color != 'undefined') ? color : $this.color;
        $this.getSelectedItems().forEach(function (item) {
            if (item instanceof Path) {
                item.strokeColor = color;
            } else if (item instanceof PointText) {
                item.fillColor = color;
            }
        });
    };


    // ----- ADD/REMOVE BACKGROUND -----
    // Can be used to create a background before exporting
    // images (like jpeg format) and etc.

    let rect = null;
    this.addBackground = function () {
        rect = new paper.Path.Rectangle({
            point: [
                view.center.x - (view.size.width / 2),
                view.center.y - (view.size.height / 2)
            ],
            size: [view.size.width, view.size.height],
            strokeColor: $this.backgroundColor,
            selected: false
        });
        rect.sendToBack();
        rect.fillColor = $this.backgroundColor;
    };

    this.removeBackground = function () {
        if (rect) rect.remove();
    };


    // ----- SAVE/LOAD -----

    this.getDataAsJSON = function () {
        return JSON.stringify($this.items);
    };

    this.getDataURLAsJPEG = function () {
        return document.querySelector($this.selector).toDataURL('image/jpeg');
    };

    this.getDataURLAsPNG = function () {
        return document.querySelector($this.selector).toDataURL('image/png');
    };

    this.loadDataFromJSON = function (text) {
        JSON.parse(text).forEach(function (item) {
            let mode = item[0].trim().toLowerCase();
            if (mode == 'path')
                $this.items.push(new Path(item[1]));
            else if (mode == 'pointtext')
                $this.items.push(new PointText(item[1]));
            else if (mode == 'raster')
                $this.items.push(new Raster(item[1]));
        });
    };

    this.setDataFromJSON = function (text) {
        $this.clear();
        return $this.loadDataFromJSON(text);
    }


    // ----- EVENTS -----

    this.tool.onMouseDown = function (event) {
        $this.mouse.click = event.point;
        $this.getTools().forEach(function (tool) {
            if (tool.active($this)) tool.onMouseDown(event, $this);
        });
    };

    this.tool.onMouseDrag = function (event) {
        $this.getTools().forEach(function (tool) {
            if (tool.active($this)) tool.onMouseDrag(event, $this);
        });
    };

    this.tool.onMouseMove = function (event) {
        $this.mouse.point = event.point;
        $this.getTools().forEach(function (tool) {
            if (tool.active($this)) tool.onMouseMove(event, $this);
        });
    };

    this.tool.onMouseUp = function (event) {
        $this.getTools().forEach(function (tool) {
            if (tool.active($this)) tool.onMouseUp(event, $this);
        });
    };

    this.tool.onKeyDown = function (event) {
        $this.getTools().forEach(function (tool) {
            if (tool.active($this)) tool.onKeyDown(event, $this);
        });
    };

    this.tool.onKeyUp = function (event) {
        $this.getTools().forEach(function (tool) {
            if (tool.active($this)) tool.onKeyUp(event, $this);
        });
    };

    document.querySelector(this.selector).addEventListener('wheel', function (event) {
        $this.getTools().forEach(function (tool) {
            if (tool.active($this)) tool.onWheel(event, $this);
        });
    });

    document.querySelector(this.selector).addEventListener('touchstart', function (event) {
        $this.getTools().forEach(function (tool) {
            if (tool.active($this)) tool.onTouchStart(event, $this);
        });
    });

    document.querySelector(this.selector).addEventListener('touchmove', function (event) {
        $this.getTools().forEach(function (tool) {
            if (tool.active($this)) tool.onTouchMove(event, $this);
        });
    });

    document.querySelector(this.selector).addEventListener('touchend', function (event) {
        $this.getTools().forEach(function (tool) {
            if (tool.active($this)) tool.onTouchEnd(event, $this);
        });
    });

    document.querySelector(this.selector).addEventListener('touchcancel', function (event) {
        $this.getTools().forEach(function (tool) {
            if (tool.active($this)) tool.onTouchCancel(event, $this);
        });
    });
};
