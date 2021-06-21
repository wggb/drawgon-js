new DrawgonTool('hand').active = function (drawgon) {
    return (!drawgon.hold && drawgon.mode == 'move');
};

DrawgonTool.get('hand').onMouseDown = function (event, drawgon) {
    drawgon.busy = true;
};

DrawgonTool.get('hand').onMouseDrag = function (event, drawgon) {
    if (drawgon.busy)
        view.center = view.center.add(drawgon.mouse.click.subtract(event.point));
};

DrawgonTool.get('hand').onMouseUp = function (event, drawgon) {
    drawgon.busy = false;
};
