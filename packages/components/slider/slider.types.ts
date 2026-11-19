/** A single value or the ordered lower and upper bounds of a range. */
export type KbqSliderValue = number | readonly [number, number];

/** How a range thumb behaves when it reaches its neighbour. */
export type KbqSliderCollision = 'none' | 'push' | 'swap';

/** The portion of the scale highlighted by the slider. */
export type KbqSliderFill = 'start' | 'end' | 'outside' | 'origin' | 'none';

/** A visual mark. Marks become selectable stops only when `step` is `null`. */
export interface KbqSliderMark {
    /** Position in value units. */
    value: number;
    /** Optional caption below the scale. */
    label?: string;
}

/** Monotonic, mutually inverse mappings for a non-linear scale. */
export interface KbqSliderScale {
    /** Maps a value to a fraction between zero and one. */
    toPosition: (value: number) => number;
    /** Maps a fraction between zero and one to a value. */
    toValue: (position: number) => number;
}

/** A completed user interaction. Programmatic writes and cancelled gestures do not emit it. */
export interface KbqSliderCommit {
    /** Final selected value. */
    value: KbqSliderValue;
    /** Input method that completed the change. */
    source: 'pointer' | 'keyboard' | 'input';
}
