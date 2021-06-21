new DrawgonTool('brush').active = function (drawgon) {
    return (!drawgon.hold && drawgon.mode == 'draw');
};

DrawgonTool.get('brush').onMouseDown = function (event, drawgon) {
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

DrawgonTool.get('brush').onMouseDrag = function (event, drawgon) {
    if (drawgon.busy)
        drawgon.current.path.add(event.point);
};

DrawgonTool.get('brush').onMouseUp = function (event, drawgon) {
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
