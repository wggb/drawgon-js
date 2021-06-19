const { Tool } = require('paper/dist/paper-core');
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
test('Creating new tool', function () {
    let drawTool;
    expect(function () {
        drawTool = new DrawgonTool();
        new DrawgonTool('test-tool');
        isNaN(drawTool);
    }).not.toThrow();

    expect(function () {
        drawTool = new DrawgonTool();
        drawTool = new DrawgonTool('test-tool-2');
    }).not.toThrow();
    expect(drawTool.active()).toBeFalsy();

    let falsyDrawTool;
    expect(function () {
        falsyDrawTool = new DrawgonTool('test-tool');
    }).toThrow();
    expect(falsyDrawTool).toBeFalsy();

    expect(DrawgonTool.getAll().length).toBe(2);
});

test('Getting tools by name', function () {
    let drawTool = DrawgonTool.get('test-tool');
    expect(function () {
        drawTool = DrawgonTool.get('test-tool');
    }).not.toThrow();

    expect(drawTool).not.toBeFalsy();
});

test('Setting drawgon instance tools', function () {
    let draw = new Drawgon('', { tools: [] });
    expect(draw.getTools().length).toBe(0);

    expect(function () {
        draw.tools.push(DrawgonTool.get('test-tool'));
    }).not.toThrow();
    expect(draw.getTools().length).toBe(1);

    expect(function () {
        draw.tools.push(new DrawgonTool());
    }).not.toThrow();
    expect(draw.getTools().length).toBe(2);

    expect(function () {
        draw.tools = DrawgonTool.getAll();
    }).not.toThrow();
    expect(DrawgonTool.getAll().length).not.toBe(0);
    expect(draw.getTools().length).toBe(DrawgonTool.getAll().length);

    draw = new Drawgon('', { tools: ['test-tool', 'test-tool'] });
    expect(draw.getTools().length).toBe(1);
});
