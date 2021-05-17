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
        if (tool instanceof DrawTool) {
            this.all.push(tool);
        } else {
            console.error('Parameter must be type of \'DrawTool\'.');
        }
    },
    remove: function (name) {
        this.all.forEach(function (item, index) {
            if (item.name == name) drawTools.all.splice(index, 1);
        });
    }
};

var DrawTool = function (name, error) {
    let unique = true;
    if (typeof error == 'undefined' || error) {
        drawTools.getAll().forEach(function (item) {
            if (item.name == name && unique) {
                console.error('You have multiple tools with the same name!');
                unique = false;
            }
        });
    }

    this.name = name;

    this.obj = {};

    this.active = function (drawCanvas) { return false; };

    this.onMouseDown = function (event, drawCanvas) { return; };
    this.onMouseDrag = function (event, drawCanvas) { return; };
    this.onMouseMove = function (event, drawCanvas) { return; };
    this.onMouseUp = function (event, drawCanvas) { return; };
    this.onKeyDown = function (event, drawCanvas) { return; };
    this.onKeyUp = function (event, drawCanvas) { return; };

    if (unique) drawTools.add(this);
};

var DrawCanvas = function (id, defaults) {
    paper.install(window);
    paper.setup(id);  // Should be called on load

    let draw = this;
    this.tool = new Tool();

    this.defaults = {
        mode: 'draw',
        strokeColor: '#000000',
        strokeCap: 'round',
        strokeWidth: 6,
        zoom: 1
    };
    if (typeof error != 'undefined') this.defaults = defaults;

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
    this.enableShortcuts = false;
    this.specialKey = false;
    this.lockZoom = false;

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

    this.getEventDistance = function (event) {
        let touches = event.touches;
        return Math.sqrt(
            Math.pow(touches[0].clientX - touches[1].clientX, 2) +
            Math.pow(touches[0].clientY - touches[1].clientY, 2)
        );
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
                    draw.mouse.point.subtract(
                        view.center).divide(rate * direction * multiply)
                );
            view.zoom = zoomValue;
        }
    };

    $(this.selector)[0].addEventListener('wheel', function (event) {
        if (!draw.lockZoom) {
            if (event.deltaY < 0) draw.zoomCanvas(1.2, 5);   // Why 5?
            else if (event.deltaY > 0) draw.zoomCanvas(0.8, 5);
        }
    });

    let onPinchDistance = null;
    $(this.selector)[0].addEventListener('touchstart', function (event) {
        if (draw.mode == 'move' && event.touches.length > 1) {
            onPinchDistance = draw.getEventDistance(event);
        }
    });

    $(this.selector)[0].addEventListener('touchmove', function (event) {
        if (draw.mode == 'move' && event.touches.length > 1) {
            event.preventDefault();
            let newPinchDistance = draw.getEventDistance(event);
            draw.zoomCanvas(Math.abs(newPinchDistance / onPinchDistance));
            onPinchDistance = newPinchDistance;
        }
    });

    this.tool.onMouseDown = function (event) {
        draw.tools.forEach(function (name) {
            let tool = drawTools.get(name);
            if (tool.active(draw)) tool.onMouseDown(event, draw);
        });
    }

    this.tool.onMouseDrag = function (event) {
        draw.tools.forEach(function (name) {
            let tool = drawTools.get(name);
            if (tool.active(draw)) tool.onMouseDrag(event, draw);
        });
    }

    this.tool.onMouseMove = function (event) {
        draw.tools.forEach(function (name) {
            let tool = drawTools.get(name);
            if (tool.active(draw)) tool.onMouseMove(event, draw);
        });
    }

    this.tool.onMouseUp = function (event) {
        draw.tools.forEach(function (name) {
            let tool = drawTools.get(name);
            if (tool.active(draw)) tool.onMouseUp(event, draw);
        });
    }

    this.tool.onKeyDown = function (event) {
        draw.tools.forEach(function (name) {
            let tool = drawTools.get(name);
            if (tool.active(draw)) tool.onKeyDown(event, draw);
        });
    }

    this.tool.onKeyUp = function (event) {
        draw.tools.forEach(function (name) {
            let tool = drawTools.get(name);
            if (tool.active(draw)) tool.onKeyUp(event, draw);
        });
    }
};
