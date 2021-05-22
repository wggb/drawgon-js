var drawgonText = new DrawgonTool('text');

drawgonText.active = function (drawgon) {
    return (!drawgon.hold && drawgon.mode == 'text');
};

drawgonText.obj['shift'] = false;

drawgonText.obj['id'] = 'draw-text-element';

drawgonText.obj['drawgon'] = null;

drawgonText.obj['createTextElement'] = function (id, drawgon) {
    drawgonText.obj.removeTextElement(id);
    let element = document.createElement('textarea');
    element.id = id;
    element.oninput = drawgonText.obj.readTextElement;
    element.style.width = 0;
    element.style.height = 0;
    element.style.opacity = 0;
    element.style.position = 'fixed';
    document.body.appendChild(element);
    return element;
};

drawgonText.obj['removeTextElement'] = function () {
    try {
        document.body.removeChild(document.getElementById(drawgonText.obj.id));
    } catch (e) { }
};

drawgonText.obj['readTextElement'] = function () {
    let drawgon = drawgonText.obj.drawgon;
    if (drawgon.busy) drawgon.current.text.content =
        document.getElementById(drawgonText.obj.id).value;
};

drawgonText.obj['pushCurrentText'] = function (drawgon) {
    if (drawgon.current.text.content.trim() != '') {
        drawgon.current.text.name = '#' + drawgon.current.id++;
        drawgon.items.push(drawgon.current.text);
    }
};

drawgonText.onMouseDown = function (event, drawgon) {
    drawgonText.obj.drawgon = drawgon;
    if (drawgon.current.text) {
        drawgon.current.text.selected = false;
        drawgonText.obj.pushCurrentText(drawgon);
    }

    drawgon.busy = true;
    drawgon.current.text = new PointText({
        content: '',
        point: drawgon.mouse.click,
        fillColor: drawgon.strokeColor,
        fontSize: drawgon.strokeWidth + drawgon.baseFontSize,
        selected: true
    });
    drawgonText.obj.createTextElement(drawgonText.obj.id, drawgon).focus();
};

drawgonText.onKeyDown = function (event, drawgon) {
    if (event.key == 'shift') drawgonText.obj.shift = true;
    if (drawgon.busy && event.key == 'enter' && !drawgonText.obj.shift) {
        drawgon.current.text.selected = false;
        drawgonText.obj.removeTextElement();
        drawgon.resetStats();
    }
};

drawgonText.onKeyUp = function (event, drawgon) {
    if (event.key == 'shift') drawgonText.obj.shift = false;
};
