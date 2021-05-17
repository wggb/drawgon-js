var drawHand = new DrawTool('hand');

drawHand.active = function (drawCanvas) {
    return (!drawCanvas.hold && drawCanvas.mode == 'move');
};

drawHand.onMouseDown = function (event, drawCanvas) {
    drawCanvas.busy = true;
};

drawHand.onMouseDrag = function (event, drawCanvas) {
    if (drawCanvas.busy)
        view.center = view.center.add(drawCanvas.mouse.click.subtract(event.point));
};

drawHand.onMouseUp = function (event, drawCanvas) {
    drawCanvas.busy = false;
};
