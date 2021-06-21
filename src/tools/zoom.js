new DrawgonTool('zoom').active = function (drawgon) { return true; };

DrawgonTool.get('zoom').obj['onPinchDistance'] = null;

DrawgonTool.get('zoom').obj['getEventDistance'] = function (event) {
    let touches = event.touches;
    return Math.sqrt(
        Math.pow(touches[0].clientX - touches[1].clientX, 2) +
        Math.pow(touches[0].clientY - touches[1].clientY, 2)
    );
};

DrawgonTool.get('zoom').onWheel = function (event, drawgon) {
    if (event.deltaY < 0) drawgon.zoomCanvas(1.2, 5);   // Why 5?
    else if (event.deltaY > 0) drawgon.zoomCanvas(0.8, 5);
};

DrawgonTool.get('zoom').onTouchStart = function (event, drawgon) {
    if (drawgon.mode == 'move' && event.touches.length > 1) {
        DrawgonTool.get('zoom').obj.onPinchDistance = DrawgonTool.get('zoom').obj.getEventDistance(event);
    }
};

DrawgonTool.get('zoom').onTouchMove = function (event, drawgon) {
    if (drawgon.mode == 'move' && event.touches.length > 1) {
        event.preventDefault();
        let newPinchDistance = DrawgonTool.get('zoom').obj.getEventDistance(event);
        drawgon.zoomCanvas(Math.abs(newPinchDistance / onPinchDistance));
        DrawgonTool.get('zoom').obj.onPinchDistance = newPinchDistance;
    }
};
