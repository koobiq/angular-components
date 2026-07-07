/** Shape of the flag. `rectangle` keeps the default 3:2 ratio, `square`/`circle` expect a 1:1 source. */
export type KbqFlagShape = 'rectangle' | 'square' | 'circle';

/** Inset shadow (hairline) that separates the flag from the background. */
export type KbqFlagShadow = 'inset' | 'none';

/**
 * Predefined integer sizes (width×height in px). Integer dimensions keep the flag edges crisp.
 * Only applies to the default 3:2 `rectangle` shape.
 */
export type KbqFlagSize = '24x16' | '21x14' | '18x12' | '15x10' | '12x8';
