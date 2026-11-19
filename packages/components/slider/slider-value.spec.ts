import { sliderMove, sliderNormalize, type SliderSettings, sliderSnap } from './slider-value';

const settings: SliderSettings = { min: 0, max: 100, step: 1, minDistance: 0, marks: [] };

describe('slider values', () => {
    it.each([
        [0.1 + 0.2, 0, 1, 0.1, 0.3],
        [0.35, 0.05, 1, 0.1, 0.35],
        [3e-7, 0, 1e-6, 1e-7, 3e-7],
        [10, 0, 10, 3, 9],
        [-200, -100, 100, 1, -100],
        [NaN, 0, 100, 1, 0],
        [50, 10, 0, 1, 10]
    ])('snaps %s on the min-anchored grid', (value, min, max, step, expected) => {
        expect(sliderSnap(value, { ...settings, min, max, step })).toBe(expected);
    });

    it('uses marks only when step is null', () => {
        const marks = [{ value: 10 }, { value: 80 }, { value: 80 }, { value: NaN }, { value: 200 }];

        expect(sliderSnap(45, { ...settings, marks, step: null })).toBe(80);
        expect(sliderSnap(45, { ...settings, marks })).toBe(45);
        expect(sliderSnap(80, { ...settings, step: null })).toBe(0);
    });

    it('normalizes unordered external ranges and impossible gaps', () => {
        expect(sliderNormalize([90, 20], settings)).toEqual([20, 90]);
        expect(sliderNormalize([90, 20], { ...settings, minDistance: 200 })).toEqual([0, 100]);
        expect(sliderNormalize([40, 50], { ...settings, step: 30, minDistance: 31 })).toEqual([30, 90]);
    });

    it.each([
        ['none', 0, 90, [50, 60], 0],
        ['none', 1, 10, [20, 30], 1],
        ['push', 0, 90, [90, 100], 0],
        ['push', 1, 0, [0, 10], 1],
        ['swap', 0, 90, [60, 90], 1],
        ['swap', 1, 0, [0, 20], 0]
    ] as const)('resolves %s collisions', (collision, index, value, expected, active) => {
        expect(sliderMove([20, 60], index, value, { ...settings, minDistance: 10 }, collision)).toEqual({
            value: expected,
            index: active
        });
    });

    it('maintains the gap and an idempotent selection when swapping near a bound', () => {
        const config = { ...settings, minDistance: 30 };
        const result = sliderMove([20, 80], 0, 90, config, 'swap');

        expect(result).toEqual({ value: [70, 100], index: 1 });
        expect(sliderNormalize(result.value, config)).toEqual(result.value);
    });

    it('keeps push values and gap on a fractional grid', () => {
        const config = { ...settings, min: 0.05, max: 1, step: 0.1, minDistance: 0.25 };

        expect(sliderMove([0.15, 0.45], 0, 0.85, config, 'push').value).toEqual([0.65, 0.95]);
    });
});
