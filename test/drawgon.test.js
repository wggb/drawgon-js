const { Drawgon, DrawgonTool } = require('../src/drawgon');

test('initial test', function () {
    let draw;
    expect(function () {
        draw = Drawgon;
        draw = DrawgonTool;
    }).not.toThrow();

    expect(function () {
        draw = drawgonTools;
        isNaN(draw);
    }).toThrow();
});
