var drawBrush = new DrawTool('brush');

drawBrush.active = function (drawCanvas) {
    return (!drawCanvas.hold && drawCanvas.mode == 'draw');
};

drawBrush.onMouseDown = function (event, drawCanvas) {
    drawCanvas.busy = true;

    let pathName = '#' + drawCanvas.current.id++;
    drawCanvas.current.path = new Path({
        segments: [event.point],
        strokeColor: drawCanvas.strokeColor,
        strokeWidth: drawCanvas.strokeWidth,
        strokeCap: drawCanvas.strokeCap,
        name: pathName
    });
    drawCanvas.current.path.add(event.point);
};

drawBrush.onMouseDrag = function (event, drawCanvas) {
    if (drawCanvas.busy)
        drawCanvas.current.path.add(event.point);
};

drawBrush.onMouseUp = function (event, drawCanvas) {
    if (drawCanvas.busy && drawCanvas.current.path) {
        if (drawCanvas.current.path.segments.length > 5) {
            drawCanvas.current.path.simplify(drawCanvas.pathSmoothing);
        } else if (drawCanvas.current.path.segments.length <= 2) {
            drawCanvas.current.path.add(event.point.add(0.1));
            drawCanvas.current.path.simplify(drawCanvas.pathSmoothing * 5);
        }
        drawCanvas.items.push(drawCanvas.current.path);

        drawCanvas.resetStats();
    }
};
