var drawZoom = new DrawTool('zoom');

drawZoom.active = function (drawCanvas) { return true; };

drawZoom.obj['onPinchDistance'] = null;

drawZoom.obj['getEventDistance'] = function (event) {
    let touches = event.touches;
    return Math.sqrt(
        Math.pow(touches[0].clientX - touches[1].clientX, 2) +
        Math.pow(touches[0].clientY - touches[1].clientY, 2)
    );
};

drawZoom.onWheel = function (event, drawCanvas) {
    if (event.deltaY < 0) drawCanvas.zoomCanvas(1.2, 5);   // Why 5?
    else if (event.deltaY > 0) drawCanvas.zoomCanvas(0.8, 5);
};

drawZoom.onTouchStart = function (event, drawCanvas) {
    if (drawCanvas.mode == 'move' && event.touches.length > 1) {
        drawZoom.obj.onPinchDistance = drawZoom.obj.getEventDistance(event);
    }
};

drawZoom.onTouchMove = function (event, drawCanvas) {
    if (drawCanvas.mode == 'move' && event.touches.length > 1) {
        event.preventDefault();
        let newPinchDistance = drawZoom.obj.getEventDistance(event);
        draw.zoomCanvas(Math.abs(newPinchDistance / onPinchDistance));
        drawZoom.obj.onPinchDistance = newPinchDistance;
    }
};
