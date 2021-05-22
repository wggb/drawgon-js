var drawgonRect = new DrawgonTool('rectangle');

drawgonRect.active = function (drawgon) {
    return (!drawgon.hold && drawgon.mode == 'rect');
};

drawgonRect.onMouseDrag = function (event, drawgon) {
    let clickPoint = drawgon.mouse.click;
    let rect = new Rectangle(clickPoint, event.point);

    drawgon.current.path = new Path.Rectangle(rect, drawgon.cornerSmoothing);

    drawgon.current.path.strokeColor = drawgon.strokeColor;
    drawgon.current.path.strokeWidth = drawgon.strokeWidth;
    drawgon.current.path.removeOnDrag();
};

drawgonRect.onMouseUp = function (event, drawgon) {
    if (drawgon.current.path) {
        drawgon.current.path.name = '#' + drawgon.current.id++;
        drawgon.items.push(drawgon.current.path);
    }
    drawgon.resetStats();
};
