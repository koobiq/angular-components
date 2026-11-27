import type { KbqSliderMark, KbqSliderThumbCollisionBehavior, KbqSliderValue } from './slider.types';

type SliderSnapDirection = -1 | 0 | 1;

/** @internal */
export type SliderSettings = {
    min: number;
    max: number;
    step: number | null;
    marks: readonly KbqSliderMark[];
    minDistance: number;
};

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

/** @internal */
export const sliderLargeStepMultiplier = (value: number): number => Math.max(1, Math.floor(value));

const fractionDigits = (value: number): number => {
    const [mantissa = '', exponent = '0'] = String(value).split('e');

    return Math.max(0, (mantissa.split('.')[1]?.length ?? 0) - Number(exponent));
};

const roundDecimal = (value: number, precision: number): number =>
    precision <= 100 ? Number(value.toFixed(precision)) : value;

/** @internal */
export function sliderAdd(a: number, b: number): number {
    return roundDecimal(a + b, Math.max(fractionDigits(a), fractionDigits(b)));
}

/** @internal */
export function sliderBounds(settings: SliderSettings): { min: number; max: number; step: number } {
    const min = Number.isFinite(settings.min) ? settings.min : 0;
    const max = Number.isFinite(settings.max) ? Math.max(min, settings.max) : Math.max(min, 100);
    const step = settings.step !== null && Number.isFinite(settings.step) && settings.step > 0 ? settings.step : 1;

    return { min, max, step };
}

/** @internal */
export function sliderStops(settings: SliderSettings): number[] {
    const { min, max } = sliderBounds(settings);

    return [
        ...new Set(settings.marks.map((mark) => mark.value).filter((v) => Number.isFinite(v) && v >= min && v <= max))
    ].sort((a, b) => a - b);
}

/** @internal */
export function sliderSnap(value: number, settings: SliderSettings, direction: SliderSnapDirection = 0): number {
    const { min, max, step } = sliderBounds(settings);
    const safeValue = clamp(Number.isFinite(value) ? value : min, min, max);

    if (settings.step === null) {
        const stops = sliderStops(settings);

        if (!stops.length) return min;
        // A sum such as 0.1 + 0.2 must still include the 0.3 stop in either direction.
        const tolerance = Math.abs(safeValue) * Number.EPSILON;

        if (direction < 0) return stops.findLast((stop) => stop <= safeValue + tolerance) ?? stops[0]!;
        if (direction > 0) return stops.find((stop) => stop >= safeValue - tolerance) ?? stops[stops.length - 1]!;

        return stops.reduce((best, stop) => (Math.abs(stop - safeValue) <= Math.abs(best - safeValue) ? stop : best));
    }

    const precision = Math.max(fractionDigits(min), fractionDigits(step));
    const gridValue = (index: number): number => roundDecimal(min + index * step, precision);
    const index = Math.round(sliderAdd(safeValue, -min) / step);
    const nearest = gridValue(index);

    if (nearest === safeValue) return nearest;

    // The quotient can round across a step or a half-step. Compare the two actual grid values instead.
    const adjacent = gridValue(Math.max(0, index + (nearest < safeValue ? 1 : -1)));
    const lower = Math.min(nearest, adjacent);
    const upper = Math.max(nearest, adjacent);

    if (upper > max || direction < 0) return lower;
    if (direction > 0) return upper;

    return sliderAdd(safeValue, -lower) < sliderAdd(upper, -safeValue) ? lower : upper;
}

/** @internal */
export function sliderGap(settings: SliderSettings): number {
    const lower = sliderSnap(sliderBounds(settings).min, settings);
    const upper = sliderSnap(sliderBounds(settings).max, settings, -1);

    return clamp(Number.isFinite(settings.minDistance) ? settings.minDistance : 0, 0, sliderAdd(upper, -lower));
}

/** @internal */
export function sliderNormalize(value: KbqSliderValue, settings: SliderSettings): KbqSliderValue {
    if (typeof value === 'number') return sliderSnap(value, settings);

    const a = sliderSnap(value[0], settings);
    const b = sliderSnap(value[1], settings);
    const gap = sliderGap(settings);
    const max = sliderSnap(sliderBounds(settings).max, settings, -1);
    const start = sliderSnap(Math.min(a, b, sliderAdd(max, -gap)), settings, -1);
    const end = sliderSnap(Math.max(a, b, sliderAdd(start, gap)), settings, 1);

    return [start, end];
}

/** @internal */
export function sliderMove(
    value: KbqSliderValue,
    index: number,
    next: number,
    settings: SliderSettings,
    collision: KbqSliderThumbCollisionBehavior
): { value: KbqSliderValue; index: number } {
    const normalized = sliderNormalize(value, settings);
    const snapped = sliderSnap(next, settings);

    if (typeof normalized === 'number') return { value: snapped, index: 0 };

    let [start, end] = normalized;
    const gap = sliderGap(settings);
    const { min, max } = sliderBounds(settings);

    if (collision === 'swap' && ((index === 0 && snapped > end) || (index === 1 && snapped < start))) {
        index = 1 - index;
        [start, end] = index === 1 ? [end, snapped] : [snapped, start];
    } else if (collision === 'push') {
        if (index === 0) {
            start = sliderSnap(Math.min(snapped, sliderAdd(sliderSnap(max, settings, -1), -gap)), settings, -1);
            end = sliderSnap(Math.max(end, sliderAdd(start, gap)), settings, 1);
        } else {
            end = sliderSnap(Math.max(snapped, sliderAdd(sliderSnap(min, settings), gap)), settings, 1);
            start = sliderSnap(Math.min(start, sliderAdd(end, -gap)), settings, -1);
        }
    } else if (index === 0) {
        start = sliderSnap(Math.min(snapped, sliderAdd(end, -gap)), settings, -1);
    } else {
        end = sliderSnap(Math.max(snapped, sliderAdd(start, gap)), settings, 1);
    }

    if (sliderAdd(end, -start) < gap) {
        if (index === 0) start = sliderSnap(sliderAdd(end, -gap), settings, -1);
        else end = sliderSnap(sliderAdd(start, gap), settings, 1);
    }

    return { value: sliderNormalize([start, end], settings), index };
}

/** @internal */
export function sliderEqual(a: KbqSliderValue, b: KbqSliderValue): boolean {
    return typeof a === 'number' || typeof b === 'number' ? a === b : a[0] === b[0] && a[1] === b[1];
}
