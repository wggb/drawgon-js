new DrawgonTool('eraser').active = function (drawgon) {
    return (!drawgon.hold && drawgon.mode == 'del' && drawgon.delete);
};

DrawgonTool.get('eraser').obj['path'] = null;

DrawgonTool.get('eraser').obj['removeIntersections'] = function (drawgon) {
    drawgon.items.forEach(function (item) {
        let intersections = DrawgonTool.get('eraser').obj.path.getIntersections(
            (item instanceof Path) ? item : new Path.Rectangle(item.bounds)
        );
        if (intersections.length > 0) drawgon.deleteItem(item.name);
    });
}

DrawgonTool.get('eraser').onMouseDown = function (event, drawgon) {
    drawgon.busy = true;

    DrawgonTool.get('eraser').obj.path = new Path({
        segments: [event.point],
        strokeWidth: 1
    });
    DrawgonTool.get('eraser').obj.path.add(event.point);
    DrawgonTool.get('eraser').obj.removeIntersections(drawgon);
};

DrawgonTool.get('eraser').onMouseDrag = function (event, drawgon) {
    if (drawgon.busy) {
        if (event.item) drawgon.deleteItem(event.item.name);

        DrawgonTool.get('eraser').obj.path.add(event.point);
        DrawgonTool.get('eraser').obj.removeIntersections(drawgon);
    }
};

DrawgonTool.get('eraser').onMouseUp = function (event, drawgon) {
    if (DrawgonTool.get('eraser').obj.path) {
        DrawgonTool.get('eraser').obj.path.remove();
        DrawgonTool.get('eraser').obj.path = null;
    }

    drawgon.resetStats();
};
