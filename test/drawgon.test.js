const rewire = require('rewire');

const script = rewire('../src/drawgon');

// Mocks
script.__set__("paper", {
    install: function () { return; },
    setup: function () { return; }
});
script.__set__("window", "");
var querySelectorM = function () {
    this.addEventListener = function () { return; };
};
script.__set__("document", {
    querySelector: function () { return new querySelectorM; }
});
script.__set__("view", { zoom: 0, center: { x: 0, y: 0 } });
script.__set__("Tool", function () { return; });
script.__set__("project", { activeLayer: { selected: null } });

var Drawgon = script.__get__("Drawgon");
var DrawgonTool = script.__get__("DrawgonTool");

// Tests
test('Initial test', function () {
    let draw;
    expect(function () {
        draw = new Drawgon();
        draw = new DrawgonTool();
        isNaN(draw);
    }).not.toThrow();

    expect(function () {
        script.__get__("drawgonTools");
    }).toThrow();
});

test('Default variables test', function () {
    let draw = new Drawgon();

    expect(draw.current.path).toBeNull();
    expect(draw.current.text).toBeNull();
    expect(draw.mouse.point).toBeNull();
    expect(draw.mouse.click).toBeNull();

    expect(draw.busy).toBeFalsy();
});

test('Initial config test', function () {
    let draw = new Drawgon("", {
        backgroundColor: '#ff00ff',
        mode: 'erase',
        strokeColor: '#ff00ff',
        strokeCap: 'square',
        strokeWidth: 16,
        minStrokeWidth: 10,
        maxStrokeWidth: 20,
        baseFontSize: 30,
        pathSmoothing: 40,
        cornerSmoothing: 50,
        maxZoom: 60,
        minZoom: 0.1
    });

    expect(draw.backgroundColor).toBe('#ff00ff');
    expect(draw.mode).toBe('erase');
    expect(draw.strokeColor).toBe('#ff00ff');
    expect(draw.strokeCap).toBe('square');
    expect(draw.strokeWidth).toBe(16);
    expect(draw.minStrokeWidth).toBe(10);
    expect(draw.maxStrokeWidth).toBe(20);
    expect(draw.baseFontSize).toBe(30);
    expect(draw.pathSmoothing).toBe(40);
    expect(draw.cornerSmoothing).toBe(50);
    expect(draw.maxZoom).toBe(60);
    expect(draw.minZoom).toBe(0.1);
});

test('Post initialization config test', function () {
    let draw = new Drawgon();

    let mode = draw.changeMode('test-mode');
    expect(draw.mode).toBe('test-mode');
    expect(draw.mode).toBe(mode);

    let width = draw.changeStrokeWidth(100);
    expect(draw.strokeWidth).toBe(100);
    expect(draw.strokeWidth).toBe(width);

    width = draw.changeStrokeWidth("Hello!");
    expect(draw.strokeWidth).toBe(100);
    expect(draw.strokeWidth).toBe(width);

    width = draw.changeStrokeWidth(draw.minStrokeWidth - 100);
    expect(draw.strokeWidth).toBe(draw.minStrokeWidth);
    expect(draw.strokeWidth).toBe(width);

    width = draw.changeStrokeWidth(draw.maxStrokeWidth + 100);
    expect(draw.strokeWidth).toBe(draw.maxStrokeWidth);
    expect(draw.strokeWidth).toBe(width);

    let color = draw.changeStrokeColor('#ff00ff');
    expect(draw.strokeColor).toBe('#ff00ff');
    expect(draw.strokeColor).toBe(color);

    let cap = draw.changeStrokeCap('square');
    expect(draw.strokeCap).toBe('square');
    expect(draw.strokeCap).toBe(cap);
});
