import { inject, InjectionToken, type Provider } from '@angular/core';
import type {
    KbqSliderCollision,
    KbqSliderFill,
    KbqSliderMark,
    KbqSliderScale,
    KbqSliderThumbAlignment
} from './slider.types';

/** Default input values for sliders in an injector scope. */
export type KbqSliderOptions = {
    /** Lower bound of the scale. */
    min: number;
    /** Upper bound of the scale. */
    max: number;
    /** Step between selectable values, or `null` to select only marks. */
    step: number | null;
    /** Marks shown on the scale. */
    marks: readonly KbqSliderMark[];
    /** Minimum distance between range thumbs. */
    minDistance: number;
    /** How range thumbs interact when they meet. */
    collision: KbqSliderCollision;
    /** Whether the slider is disabled. Angular forms can override this state. */
    disabled: boolean;
    /** Whether the slider is read-only. */
    readonly: boolean;
    /** Whether the form field shows the slider as required. */
    required: boolean;
    /** Formats a value for tooltips and assistive technology. */
    displayWith?: (value: number) => string;
    /** Whether a standalone slider is vertical. The input slider has a horizontal track. */
    vertical: boolean;
    /** Whether the scale direction is reversed. */
    reversed: boolean;
    /** Thumb alignment at the ends of the track. */
    thumbAlignment: KbqSliderThumbAlignment;
    /** Portion of the track highlighted by the slider. */
    fill: KbqSliderFill;
    /** Starting value for the origin fill. */
    fillOrigin: number;
    /** Mapping between values and positions on a non-linear scale. */
    scale?: KbqSliderScale;
    /** Whether hovering or dragging shows the value tooltip. */
    showTooltip: boolean;
    /** Whether focusing a thumb shows the value tooltip. */
    tooltipOnFocus: boolean;
    /** Number of steps moved by Page Up or Page Down. */
    pageStep: number;
    /** Unit displayed beside each numeric field in an input slider. */
    unit: string;
    /** Whether a single-value input slider shows stepper buttons. */
    showStepper: boolean;
};

const KBQ_SLIDER_DEFAULT_OPTIONS: KbqSliderOptions = {
    min: 0,
    max: 100,
    step: 1,
    marks: [],
    minDistance: 0,
    collision: 'none',
    disabled: false,
    readonly: false,
    required: false,
    vertical: false,
    reversed: false,
    thumbAlignment: 'contain',
    fill: 'start',
    fillOrigin: 0,
    showTooltip: false,
    tooltipOnFocus: false,
    pageStep: 10,
    unit: '',
    showStepper: true
};

/** Injection token holding the current slider defaults. */
export const KBQ_SLIDER_OPTIONS = new InjectionToken<KbqSliderOptions>('KBQ_SLIDER_OPTIONS', {
    factory: () => KBQ_SLIDER_DEFAULT_OPTIONS
});

/** Overrides selected slider defaults for this injector and its descendants. */
export function kbqSliderOptionsProvider(options: Partial<KbqSliderOptions>): Provider {
    return {
        provide: KBQ_SLIDER_OPTIONS,
        useFactory: () => ({
            ...(inject(KBQ_SLIDER_OPTIONS, { skipSelf: true, optional: true }) ?? KBQ_SLIDER_DEFAULT_OPTIONS),
            ...options
        })
    };
}
