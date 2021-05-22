var drawgonZoom = new DrawgonTool('zoom');

drawgonZoom.active = function (drawgon) { return true; };

drawgonZoom.obj['onPinchDistance'] = null;

drawgonZoom.obj['getEventDistance'] = function (event) {
    let touches = event.touches;
    return Math.sqrt(
        Math.pow(touches[0].clientX - touches[1].clientX, 2) +
        Math.pow(touches[0].clientY - touches[1].clientY, 2)
    );
};

drawgonZoom.onWheel = function (event, drawgon) {
    if (event.deltaY < 0) drawgon.zoomCanvas(1.2, 5);   // Why 5?
    else if (event.deltaY > 0) drawgon.zoomCanvas(0.8, 5);
};

drawgonZoom.onTouchStart = function (event, drawgon) {
    if (drawgon.mode == 'move' && event.touches.length > 1) {
        drawgonZoom.obj.onPinchDistance = drawgonZoom.obj.getEventDistance(event);
    }
};

drawgonZoom.onTouchMove = function (event, drawgon) {
    if (drawgon.mode == 'move' && event.touches.length > 1) {
        event.preventDefault();
        let newPinchDistance = drawgonZoom.obj.getEventDistance(event);
        drawgon.zoomCanvas(Math.abs(newPinchDistance / onPinchDistance));
        drawgonZoom.obj.onPinchDistance = newPinchDistance;
    }
};
