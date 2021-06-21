new DrawgonTool('text').active = function (drawgon) {
    return (!drawgon.hold && drawgon.mode == 'text');
};

DrawgonTool.get('text').obj['enterToSubmit'] = true;

DrawgonTool.get('text').obj['shift'] = false;

DrawgonTool.get('text').obj['id'] = 'draw-text-element';

DrawgonTool.get('text').obj['drawgon'] = null;

DrawgonTool.get('text').obj['createTextElement'] = function (id, drawgon) {
    DrawgonTool.get('text').obj.removeTextElement(id);
    let element = document.createElement('textarea');
    element.id = id;
    element.oninput = DrawgonTool.get('text').obj.readTextElement;
    element.style.width = 0;
    element.style.height = 0;
    element.style.opacity = 0;
    element.style.position = 'fixed';
    document.body.appendChild(element);
    return element;
};

DrawgonTool.get('text').obj['removeTextElement'] = function () {
    try {
        document.body.removeChild(
            document.getElementById(DrawgonTool.get('text').obj.id)
        );
    } catch (e) { }
};

DrawgonTool.get('text').obj['readTextElement'] = function () {
    let drawgon = DrawgonTool.get('text').obj.drawgon;
    if (drawgon.busy) drawgon.current.text.content =
        document.getElementById(DrawgonTool.get('text').obj.id).value;
};

DrawgonTool.get('text').obj['pushCurrentText'] = function (drawgon) {
    if (drawgon.current.text.content.trim() != '') {
        drawgon.current.text.name = '#' + drawgon.current.id++;
        drawgon.items.push(drawgon.current.text);
    }
};

DrawgonTool.get('text').onMouseDown = function (event, drawgon) {
    DrawgonTool.get('text').obj.drawgon = drawgon;
    if (drawgon.current.text) {
        drawgon.current.text.selected = false;
        DrawgonTool.get('text').obj.pushCurrentText(drawgon);
    }

    drawgon.busy = true;
    drawgon.current.text = new PointText({
        content: '',
        point: drawgon.mouse.click,
        fillColor: drawgon.strokeColor,
        fontSize: drawgon.strokeWidth + drawgon.baseFontSize,
        selected: true
    });
    DrawgonTool.get('text').obj.createTextElement(
        DrawgonTool.get('text').obj.id,
        drawgon
    ).focus();
};

DrawgonTool.get('text').onKeyDown = function (event, drawgon) {
    if (event.key == 'shift') DrawgonTool.get('text').obj.shift = true;

    // if enterToSubmit is true => shift must be false to submit.
    // if enterToSubmit is false => shift must be true to submit.
    let submit = DrawgonTool.get('text').obj.enterToSubmit != DrawgonTool.get('text').obj.shift;

    if (drawgon.busy && event.key == 'enter' && submit) {
        drawgon.current.text.selected = false;
        DrawgonTool.get('text').obj.removeTextElement();
        drawgon.resetStats();
    }
};

DrawgonTool.get('text').onKeyUp = function (event, drawgon) {
    if (event.key == 'shift') DrawgonTool.get('text').obj.shift = false;
};
