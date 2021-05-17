var drawCircle = new DrawTool('circle');

drawCircle.active = function (drawCanvas) {
    return (!drawCanvas.hold && drawCanvas.mode == 'circle');
};

drawCircle.onMouseDown = function (event, drawCanvas) {
    let clickPoint = drawCanvas.mouse.click;

    drawCanvas.current.path = new Path.Circle({
        center: new Point(
            clickPoint.x - ((clickPoint.x - event.point.x) / 2),
            clickPoint.y - ((clickPoint.y - event.point.y) / 2)
        ),
        radius: new Point(
            (clickPoint.x - event.point.x) / 2,
            (clickPoint.y - event.point.y) / 2
        )
    });

    drawCanvas.current.path.strokeColor = drawCanvas.strokeColor;
    drawCanvas.current.path.strokeWidth = drawCanvas.strokeWidth;
    drawCanvas.current.path.removeOnDrag();
};

drawCircle.onMouseUp = function (event, drawCanvas) {
    if (drawCanvas.current.path) {
        drawCanvas.current.path.name = '#' + drawCanvas.current.id++;
        drawCanvas.items.push(drawCanvas.current.path);
    }
    drawCanvas.resetStats();
};
