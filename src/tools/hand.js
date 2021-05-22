var drawgonHand = new DrawgonTool('hand');

drawgonHand.active = function (drawgon) {
    return (!drawgon.hold && drawgon.mode == 'move');
};

drawgonHand.onMouseDown = function (event, drawgon) {
    drawgon.busy = true;
};

drawgonHand.onMouseDrag = function (event, drawgon) {
    if (drawgon.busy)
        view.center = view.center.add(drawgon.mouse.click.subtract(event.point));
};

drawgonHand.onMouseUp = function (event, drawgon) {
    drawgon.busy = false;
};
