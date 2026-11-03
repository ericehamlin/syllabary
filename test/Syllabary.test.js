import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Syllabary pulls in the whole display layer, which needs a browser. Replace
// everything except Config and Logger so these tests only exercise start().
vi.mock('../src/Grid.js', () => ({ default: { init: vi.fn() } }));
vi.mock('../src/Style.js', () => ({ default: { addRules: vi.fn() } }));
vi.mock('../src/GlyphLoader.js', () => ({ default: {} }));
vi.mock('../src/LoadingDisplay.js', () => ({ default: {} }));
vi.mock('../src/SyllabaryDisplay.js', () => ({ default: {} }));
vi.mock('../src/RunController.js', () => ({ default: class {} }));
vi.mock('../src/WebAudioAPISound.js', () => ({ default: class {} }));
vi.mock('../src/DebugControls.js', () => ({ default: class {} }));

import Syllabary from '../src/Syllabary.js';
import Grid from '../src/Grid.js';
import Config from '../src/Config.js';

describe('Syllabary.start', () => {
  const originalNavQueueLength = Config.navQueueLength;

  beforeEach(() => {
    vi.spyOn(Syllabary, 'initialize').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Grid.init.mockClear();
    Config.navQueueLength = originalNavQueueLength;
  });

  it('remembers the container id and initializes', () => {
    Syllabary.start({ containerId: 'my-container' });

    expect(Syllabary.containerId).toBe('my-container');
    expect(Syllabary.initialize).toHaveBeenCalledOnce();
  });

  it('passes the starting position to the grid', () => {
    Syllabary.start({ containerId: 'c', xPosition: 3, yPosition: 4, zPosition: 5 });

    expect(Grid.init).toHaveBeenCalledWith(3, 4, 5);
  });

  it('leaves the starting position unset when none is given', () => {
    Syllabary.start({ containerId: 'c' });

    expect(Grid.init).toHaveBeenCalledWith(null, null, null);
  });

  it('applies known options to Config and ignores unknown ones', () => {
    Syllabary.start({ containerId: 'c', navQueueLength: 9, notAnOption: 1 });

    expect(Config.navQueueLength).toBe(9);
    expect(Config).not.toHaveProperty('notAnOption');
  });
});
