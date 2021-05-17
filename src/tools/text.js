var drawText = new DrawTool('text');

drawText.active = function (drawCanvas) {
    return (!drawCanvas.hold && drawCanvas.mode == 'text');
};

drawText.obj['shift'] = false;

drawText.obj['id'] = 'draw-text-element';

drawText.obj['createTextElement'] = function (id) {
    drawText.obj.removeTextElement(id);
    let element = document.createElement('textarea');
    element.id = id;
    element.oninput = drawText.obj.readTextElement;
    element.style.width = 0;
    element.style.height = 0;
    element.style.opacity = 0;
    element.style.position = 'fixed';
    document.body.appendChild(element);
    return element;
};

drawText.obj['removeTextElement'] = function () {
    try {
        document.body.removeChild(document.getElementById(drawText.obj.id));
    } catch (e) { }
};

drawText.obj['readTextElement'] = function (drawCanvas) {
    if (dradrawCanvas.busy) drawCanvas.current.text.content =
        document.getElementById(drawText.obj.id).value;
};

drawText.obj['pushCurrentText'] = function (drawCanvas) {
    if (drawCanvas.current.text.content.trim() != '') {
        drawCanvas.current.text.name = '#' + drawCanvas.current.id++;
        drawCanvas.items.push(drawCanvas.current.text);
    }
};

drawText.onMouseDown = function (event, drawCanvas) {
    if (drawCanvas.current.text) drawText.obj.pushCurrentText();
    drawCanvas.busy = true;
    drawCanvas.current.text = new PointText({
        content: '',
        point: drawCanvas.mouse.click,
        fillColor: drawCanvas.strokeColor,
        fontSize: drawCanvas.strokeWidth + 16,  // Change this
        selected: true
    });
    drawText.obj.createTextElement(drawText.obj.id).focus();
};

drawText.onKeyDown = function (event, drawCanvas) {
    if (event.key == 'shift') drawText.obj.shift = true;
    if (drawCanvas.busy && event.key == 'enter' && !drawText.obj.shift) {
        drawCanvas.current.text.selected = false;
        drawText.obj.removeTextElement();
        drawCanvas.resetStats();
    }
};

drawText.onKeyUp = function (event, drawCanvas) {
    if (event.key == 'shift') drawText.obj.shift = false;
};
