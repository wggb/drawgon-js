/*!
  * Draw-JS v0.1.0 (https://github.com/wggb/draw-js)
  * Copyright (c) 2021 WhiteGooseGoesBlack
  * @license MIT (https://github.com/wggb/draw-js/blob/main/LICENSE)
  */

var drawTools = {
    all: [],
    allNames: function () {
        let names = [];
        this.all.forEach(function (tool) {
            names.push(tool.name);
        });
        return names.slice();
    },
    getAll: function (name) {
        if (typeof name == 'undefined') {
            return this.all.slice();  // Copy the value
        } else {
            let tools = [];
            this.all.forEach(function (item) {
                if (item.name == name) tools.push(item);
            });
            return tools.slice();
        }
    },
    get: function (name) {
        let tools = this.getAll(name);
        if (tools.length > 0) return tools[0];
        else return null;
    },
    add: function (tool) {
        if (tool instanceof DrawTool) this.all.push(tool);
        else console.error('Parameter must be instance of \'DrawTool\'.');
    },
    remove: function (name) {
        this.all.forEach(function (item, index) {
            if (item.name == name) drawTools.all.splice(index, 1);
        });
    }
};

var DrawTool = function (name, error) {
    let unique = true;
    drawTools.getAll().forEach(function (item) {
        if (item.name == name && unique) {
            if (typeof error == 'undefined' || error)
                console.error('You have multiple tools with the same name!');
            unique = false;
        }
    });

    this.name = name;

    this.obj = {};

    this.active = function (drawCanvas) { return false; };

    this.onMouseDown = function (event, drawCanvas) { return; };
    this.onMouseDrag = function (event, drawCanvas) { return; };
    this.onMouseMove = function (event, drawCanvas) { return; };
    this.onMouseUp = function (event, drawCanvas) { return; };
    this.onKeyDown = function (event, drawCanvas) { return; };
    this.onKeyUp = function (event, drawCanvas) { return; };
    this.onWheel = function (event, drawCanvas) { return; };
    this.onTouchStart = function (event, drawCanvas) { return; };
    this.onTouchMove = function (event, drawCanvas) { return; };
    this.onTouchEnd = function (event, drawCanvas) { return; };
    this.onTouchCancel = function (event, drawCanvas) { return; };

    if (unique) drawTools.add(this);
};

var DrawCanvas = function (id, defaults) {
    paper.install(window);
    paper.setup(id);  // Better to be called on load

    let draw = this;
    this.tool = new Tool();

    // There might be a better way
    this.defaults = {
        mode: 'draw',
        strokeColor: '#000000',
        strokeCap: 'round',
        strokeWidth: 6,
        zoom: 1
    };
    if (typeof defaults != 'undefined') this.defaults = defaults;

    this.selector = '#' + id;
    this.mode = this.defaults.mode;
    this.strokeColor = this.defaults.strokeColor;
    this.backgroundColor = '#ffffff';
    this.strokeWidth = this.defaults.strokeWidth;
    this.strokeCap = this.defaults.strokeCap;

    this.minStrokeWidth = 1;  // >= 1
    this.maxStrokeWidth = 9999;
    this.maxZoom = 16;
    this.minZoon = 0.4;

    this.pathSmoothing = 10;
    this.cornerSmoothing = 4;

    view.zoom = this.defaults.zoom;

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
    this.tools = ['brush', 'eraser'];

    this.reset = function () {
        draw.mode = draw.defaults.mode;
        draw.strokeWidth = draw.defaults.strokeWidth;
        draw.strokeColor = draw.defaults.strokeColor;
        view.zoom = draw.defaults.zoom;
    };

    this.resetStats = function () {
        if (draw.current.path)
            draw.current.path.selected = false;
        if (draw.current.text) {
            draw.current.text.selected = false;

            // Push text to items if current text item was not empty
            // This part needs to be changed (later...)
            if (draw.current.text.content.trim() != '') {
                draw.current.text.name = '#' + draw.current.id++;
                draw.items.push(draw.current.text);
            }
        }
        draw.busy = false;
        draw.current.path = null;
        draw.current.text = null;
        draw.mouse.click = null;
    };

    this.clear = function () {
        draw.items.forEach(function (path) {
            path.remove()
        });
        draw.items = [];
    };

    this.deleteItem = function (name) {
        draw.items.forEach(function (item, index) {
            if (item.name == name) {
                item.remove();
                draw.items.splice(index, 1);
            }
        });
    };

    this.getSelectedItems = function () {
        let selectedItems = [];
        draw.items.forEach(function (item) {
            if (item.selected) selectedItems.push(item);
        });
        return selectedItems;
    };

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

    this.loadItems = function (text) {
        draw.clear();

        try {
            JSON.parse(text).forEach(function (item) {
                let mode = item[0].trim().toLowerCase();
                if (mode == 'path')
                    draw.items.push(new Path(item[1]));
                else if (mode == 'pointtext')
                    draw.items.push(new PointText(item[1]));
            });
        } catch (error) { alert('Text can\'t be parsed.'); }
    };

    this.updateSelectedWidth = function (width) {
        width = (typeof width == 'undefined' || isNaN(width)) ? draw.strokeWidth : width;
        if (width < draw.minStrokeWidth) width = draw.minStrokeWidth;
        if (width > draw.maxStrokeWidth) width = draw.maxStrokeWidth;
        draw.getSelectedItems().forEach(function (item) {
            if (item instanceof Path) {
                item.strokeWidth = width;
            } else if (item instanceof PointText) {
                item.fontSize = width + 16;
            }
        });
    };

    this.updateSelectedColor = function (color) {
        color = (typeof color != 'undefined') ? color : draw.color;
        draw.getSelectedItems().forEach(function (item) {
            if (item instanceof Path) {
                item.strokeColor = color;
            } else if (item instanceof PointText) {
                item.fillColor = color;
            }
        });
    };

    this.zoomCanvas = function (rate, multiply) {
        let zoomValue = view.zoom * rate;
        multiply = (typeof multiply != 'undefined') ? multiply : 0;
        if (zoomValue >= draw.minZoom && zoomValue <= draw.maxZoom &&
            ((view.zoom < draw.maxZoom && rate > 1) ||
                (view.zoom > draw.minZoom && rate < 1))) {
            let direction = (rate < 1) ? -1 : 1;
            if (multiply > 0)
                view.center = view.center.add(
                    draw.mouse.point.subtract(view.center)
                        .divide(rate * direction * multiply)
                );
            view.zoom = zoomValue;
        }
    };

    this.tool.onMouseDown = function (event) {
        draw.mouse.click = event.point;
        draw.tools.forEach(function (name) {
            let tool = drawTools.get(name);
            if (tool.active(draw)) tool.onMouseDown(event, draw);
        });
    };

    this.tool.onMouseDrag = function (event) {
        draw.tools.forEach(function (name) {
            let tool = drawTools.get(name);
            if (tool.active(draw)) tool.onMouseDrag(event, draw);
        });
    };

    this.tool.onMouseMove = function (event) {
        draw.mouse.point = event.point;
        draw.tools.forEach(function (name) {
            let tool = drawTools.get(name);
            if (tool.active(draw)) tool.onMouseMove(event, draw);
        });
    };

    this.tool.onMouseUp = function (event) {
        draw.tools.forEach(function (name) {
            let tool = drawTools.get(name);
            if (tool.active(draw)) tool.onMouseUp(event, draw);
        });
    };

    this.tool.onKeyDown = function (event) {
        draw.tools.forEach(function (name) {
            let tool = drawTools.get(name);
            if (tool.active(draw)) tool.onKeyDown(event, draw);
        });
    };

    this.tool.onKeyUp = function (event) {
        draw.tools.forEach(function (name) {
            let tool = drawTools.get(name);
            if (tool.active(draw)) tool.onKeyUp(event, draw);
        });
    };

    document.querySelector(this.selector).addEventListener('wheel', function (event) {
        draw.tools.forEach(function (name) {
            let tool = drawTools.get(name);
            if (tool.active(draw)) tool.onWheel(event, draw);
        });
    });

    document.querySelector(this.selector).addEventListener('touchstart', function (event) {
        draw.tools.forEach(function (name) {
            let tool = drawTools.get(name);
            if (tool.active(draw)) tool.onTouchStart(event, draw);
        });
    });

    document.querySelector(this.selector).addEventListener('touchmove', function (event) {
        draw.tools.forEach(function (name) {
            let tool = drawTools.get(name);
            if (tool.active(draw)) tool.onTouchMove(event, draw);
        });
    });

    document.querySelector(this.selector).addEventListener('touchend', function (event) {
        draw.tools.forEach(function (name) {
            let tool = drawTools.get(name);
            if (tool.active(draw)) tool.onTouchEnd(event, draw);
        });
    });

    document.querySelector(this.selector).addEventListener('touchcancel', function (event) {
        draw.tools.forEach(function (name) {
            let tool = drawTools.get(name);
            if (tool.active(draw)) tool.onTouchCancel(event, draw);
        });
    });

    let rect = null;
    this.AddBackground = function () {
        rect = new paper.Path.Rectangle({
            point: [
                view.center.x - (view.size.width / 2),
                view.center.y - (view.size.height / 2)
            ],
            size: [view.size.width, view.size.height],
            strokeColor: draw.backgroundColor,
            selected: false
        });
        rect.sendToBack();
        rect.fillColor = draw.backgroundColor;
    };

    this.RemoveBackground = function () {
        if (rect) rect.remove();
    };

    this.getDataAsJSON = function () {
        // TODO: Return items as json
    };

    this.getDataURLAsJPEG = function () {
        return document.querySelector(draw.selector).toDataURL('image/jpeg');
    };

    this.getDataURLAsPNG = function () {
        return document.querySelector(draw.selector).toDataURL('image/png');
    };
};
