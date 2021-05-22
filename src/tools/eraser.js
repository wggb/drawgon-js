var drawgonEraser = new DrawgonTool('eraser');

drawgonEraser.active = function (drawgon) {
    return (!drawgon.hold && drawgon.mode == 'del');
};

drawgonEraser.obj['path'] = null;

drawgonEraser.obj['removeIntersections'] = function (drawgon) {
    drawgon.items.forEach(function (item) {
        let intersections = drawgonEraser.obj.path.getIntersections(
            (item instanceof Path) ? item : new Path.Rectangle(item.bounds)
        );
        if (intersections.length > 0) drawgon.deleteItem(item.name);
    });
}

drawgonEraser.onMouseDown = function (event, drawgon) {
    drawgon.busy = true;

    drawgonEraser.obj.path = new Path({
        segments: [event.point],
        strokeWidth: 1
    });
    drawgonEraser.obj.path.add(event.point);
    drawgonEraser.obj.removeIntersections(drawgon);
};

drawgonEraser.onMouseDrag = function (event, drawgon) {
    if (drawgon.busy) {
        if (event.item) drawgon.deleteItem(event.item.name);

        drawgonEraser.obj.path.add(event.point);
        drawgonEraser.obj.removeIntersections(drawgon);
    }
};

drawgonEraser.onMouseUp = function (event, drawgon) {
    if (drawgonEraser.obj.path) {
        drawgonEraser.obj.path.remove();
        drawgonEraser.obj.path = null;
    }

    drawgon.resetStats();
};
