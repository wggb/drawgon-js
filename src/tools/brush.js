var drawgonBrush = new DrawgonTool('brush');

drawgonBrush.active = function (drawgon) {
    return (!drawgon.hold && drawgon.mode == 'draw');
};

drawgonBrush.onMouseDown = function (event, drawgon) {
    drawgon.busy = true;

    let pathName = '#' + drawgon.current.id++;
    drawgon.current.path = new Path({
        segments: [event.point],
        strokeColor: drawgon.strokeColor,
        strokeWidth: drawgon.strokeWidth,
        strokeCap: drawgon.strokeCap,
        name: pathName
    });
    drawgon.current.path.add(event.point);
};

drawgonBrush.onMouseDrag = function (event, drawgon) {
    if (drawgon.busy)
        drawgon.current.path.add(event.point);
};

drawgonBrush.onMouseUp = function (event, drawgon) {
    if (drawgon.busy && drawgon.current.path) {
        if (drawgon.current.path.segments.length > 5) {
            drawgon.current.path.simplify(drawgon.pathSmoothing);
        } else if (drawgon.current.path.segments.length <= 2) {
            drawgon.current.path.add(event.point.add(0.1));
            drawgon.current.path.simplify(drawgon.pathSmoothing * 5);
        }
        drawgon.items.push(drawgon.current.path);

        drawgon.resetStats();
    }
};
