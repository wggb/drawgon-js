var drawgonCircle = new DrawgonTool('circle');

drawgonCircle.active = function (drawgon) {
    return (!drawgon.hold && drawgon.mode == 'circle');
};

drawgonCircle.onMouseDrag = function (event, drawgon) {
    let clickPoint = drawgon.mouse.click;

    drawgon.current.path = new Path.Circle({
        center: new Point(
            clickPoint.x - ((clickPoint.x - event.point.x) / 2),
            clickPoint.y - ((clickPoint.y - event.point.y) / 2)
        ),
        radius: new Point(
            (clickPoint.x - event.point.x) / 2,
            (clickPoint.y - event.point.y) / 2
        )
    });

    drawgon.current.path.strokeColor = drawgon.strokeColor;
    drawgon.current.path.strokeWidth = drawgon.strokeWidth;
    drawgon.current.path.removeOnDrag();
};

drawgonCircle.onMouseUp = function (event, drawgon) {
    if (drawgon.current.path) {
        drawgon.current.path.name = '#' + drawgon.current.id++;
        drawgon.items.push(drawgon.current.path);
    }
    drawgon.resetStats();
};
