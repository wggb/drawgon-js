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
