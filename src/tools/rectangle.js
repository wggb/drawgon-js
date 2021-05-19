var drawRect = new DrawTool('rectangle');

drawRect.active = function (drawCanvas) {
    return (!drawCanvas.hold && drawCanvas.mode == 'rect');
};

drawRect.onMouseDrag = function (event, drawCanvas) {
    let clickPoint = drawCanvas.mouse.click;
    let rect = new Rectangle(clickPoint, event.point);

    drawCanvas.current.path = new Path.Rectangle(rect, drawCanvas.cornerSmoothing);

    drawCanvas.current.path.strokeColor = drawCanvas.strokeColor;
    drawCanvas.current.path.strokeWidth = drawCanvas.strokeWidth;
    drawCanvas.current.path.removeOnDrag();
};

drawRect.onMouseUp = function (event, drawCanvas) {
    if (drawCanvas.current.path) {
        drawCanvas.current.path.name = '#' + drawCanvas.current.id++;
        drawCanvas.items.push(drawCanvas.current.path);
    }
    drawCanvas.resetStats();
};
