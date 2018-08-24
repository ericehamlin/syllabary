var assert = require('assert');
var mockery = require('mockery');

let Syllabary;
describe('Syllabary', function() {
  beforeEach(() => {
    mockery.enable();
    mockery.registerAllowable('../src/Syllabary');
    mockery.registerMock('SyllabaryDisplay', {});
    mockery.registerMock('Config', {});
    mockery.registerMock('Utils', {});
    mockery.registerMock('Grid', {});
    mockery.registerMock('GlyphLoader', {});
    mockery.registerMock('LoadingDisplay', {});
    mockery.registerMock('RunController', {});
    mockery.registerMock('DebugControls', {});
    mockery.registerMock('WebAudioAPISound', {});

    Syllabary = require('../src/Syllabary').default;

  });
  describe('#indexOf', function() {
    it('should return -1 when the value is not present', function() {
    });
  });
});
