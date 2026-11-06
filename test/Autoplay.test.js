import { describe, expect, it, vi } from 'vitest';

// RunController pulls in the whole display layer, which needs a browser.
vi.mock('../src/SyllabaryDisplay.js', () => ({ default: {} }));
vi.mock('../src/Grid.js', () => ({ default: {} }));
vi.mock('hammerjs', () => ({}));

import RunController from '../src/RunController.js';

// Only the methods are needed, not a whole controller.
function makeController(overrides = {}) {
  return {
    autoplay: true,
    readingSyllable: { pause: vi.fn(), resume: vi.fn() },
    isPaused: () => false,
    ...overrides,
  };
}

describe('RunController autoplay', () => {
  it('pauses the poem being read when autoplay stops', () => {
    const controller = makeController();

    RunController.prototype.stopAutoplay.call(controller);

    expect(controller.autoplay).toBe(false);
    expect(controller.readingSyllable.pause).toHaveBeenCalledOnce();
  });

  it('resumes the poem when autoplay starts again', () => {
    const controller = makeController({ autoplay: false });

    RunController.prototype.startAutoplay.call(controller);

    expect(controller.autoplay).toBe(true);
    expect(controller.readingSyllable.resume).toHaveBeenCalledOnce();
  });

  it('leaves the poem paused while the info sheet is open', () => {
    const controller = makeController({ autoplay: false, isPaused: () => true });

    RunController.prototype.startAutoplay.call(controller);

    expect(controller.readingSyllable.resume).not.toHaveBeenCalled();
  });

  it('copes with nothing being read', () => {
    const controller = makeController({ readingSyllable: null });

    expect(() => RunController.prototype.stopAutoplay.call(controller)).not.toThrow();
    expect(() => RunController.prototype.startAutoplay.call(controller)).not.toThrow();
  });
});
