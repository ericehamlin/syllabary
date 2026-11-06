import { describe, expect, it } from 'vitest';

import { toDisplayable } from '../src/Utils.js';

describe('toDisplayable', () => {
  it('replaces an en dash with a hyphen', () => {
    expect(toDisplayable("here it's – rendered down")).toBe("here it's - rendered down");
  });

  it('replaces an ellipsis with three periods', () => {
    expect(toDisplayable('and so on…')).toBe('and so on...');
  });

  it('replaces every occurrence', () => {
    expect(toDisplayable('a – b – c')).toBe('a - b - c');
  });

  it('leaves characters the font can draw alone', () => {
    const text = 'café ’quoted’ — ok';
    expect(toDisplayable(text)).toBe(text);
  });

  it('passes through null and undefined', () => {
    expect(toDisplayable(null)).toBe(null);
    expect(toDisplayable(undefined)).toBe(undefined);
  });
});
