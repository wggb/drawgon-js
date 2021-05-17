var drawEraser = new DrawTool('eraser');

drawEraser.active = function (drawCanvas) {
    return (drawCanvas.mode == 'del');
};

drawEraser.obj['path'] = null;

drawEraser.obj['removeIntersections'] = function (drawCanvas) {
    drawCanvas.items.forEach(function (item) {
        let intersections = drawEraser.obj.path.getIntersections(
            (item instanceof Path) ? item : new Path.Rectangle(item.bounds)
        );
        if (intersections.length > 0) drawCanvas.deleteItem(item.name);
    });
}

drawEraser.onMouseDown = function (event, drawCanvas) {
    drawCanvas.busy = true;

    drawEraser.obj.path = new Path({
        segments: [event.point],
        strokeWidth: 1
    });
    drawEraser.obj.path.add(event.point);
    drawEraser.obj.removeIntersections(drawCanvas);
};

drawEraser.onMouseDrag = function (event, drawCanvas) {
    if (drawCanvas.busy) {
        if (event.item) drawCanvas.deleteItem(event.item.name);

        drawEraser.obj.path.add(event.point);
        drawEraser.obj.removeIntersections(drawCanvas);
    }
};

drawEraser.onMouseUp = function (event, drawCanvas) {
    if (drawEraser.obj.path) {
        drawEraser.obj.path.remove();
        drawEraser.obj.path = null;
    }

    drawCanvas.resetStats();
};
