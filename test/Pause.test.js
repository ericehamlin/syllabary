import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// The sound needs a Web Audio context, an XMLHttpRequest and the running app.
vi.mock('../src/Syllabary.js', () => ({ default: { runController: null } }));

const context = { suspend: vi.fn(), resume: vi.fn(), state: 'running' };

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal('window', { audioContext: context });
  vi.stubGlobal('XMLHttpRequest', class { open() {} send() {} });
  context.suspend.mockClear();
  context.resume.mockClear();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

async function makeSound() {
  const { default: WebAudioAPISound } = await import('../src/WebAudioAPISound.js');
  return new WebAudioAPISound('/audio/1-1-1.mp3');
}

describe('WebAudioAPISound pause', () => {
  it('stands still while paused, so the poem stops scrolling', async () => {
    const sound = await makeSound();
    sound.startTime = new Date();

    vi.advanceTimersByTime(2000);
    sound.pause();
    expect(sound.getElapsedTime()).toBe(2);

    vi.advanceTimersByTime(5000);
    expect(sound.getElapsedTime()).toBe(2);
    expect(context.suspend).toHaveBeenCalledOnce();
  });

  it('carries on from where it was after resuming', async () => {
    const sound = await makeSound();
    sound.startTime = new Date();

    vi.advanceTimersByTime(2000);
    sound.pause();
    vi.advanceTimersByTime(5000);
    sound.resume();
    vi.advanceTimersByTime(1000);

    expect(sound.getElapsedTime()).toBe(3);
    expect(context.resume).toHaveBeenCalledOnce();
  });

  it('is held even if paused before it started', async () => {
    const sound = await makeSound();

    sound.pause();

    expect(sound.held).toBe(true);
    expect(context.suspend).not.toHaveBeenCalled();
  });

  it('un-suspends the audio when cancelled while paused', async () => {
    const sound = await makeSound();
    sound.startTime = new Date();
    vi.advanceTimersByTime(2000);
    sound.pause();

    sound.cancel();

    expect(sound.held).toBe(false);
    expect(context.resume).toHaveBeenCalledOnce();
  });
});
