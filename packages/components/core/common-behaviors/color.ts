import { Directive, ElementRef, inject, input, linkedSignal, Signal, signal, WritableSignal } from '@angular/core';

export enum KbqComponentColors {
    Theme = 'theme',
    ThemeFade = 'theme-fade',
    Contrast = 'contrast',
    ContrastFade = 'contrast-fade',

    Error = 'error',
    Warning = 'warning',
    Success = 'success',

    Default = 'contrast',
    Empty = 'empty'
}

/**
 * A color read through `read` and written into `target`, so that a value set in code outlives a change of what
 * `read` falls back to.
 */
function writableColor<T>(read: () => T, target: WritableSignal<T | null | undefined>): WritableSignal<T> {
    const color = linkedSignal(read);

    color.set = (value) => target.set(value);
    color.update = (updateFn) => target.set(updateFn(color()));

    return color;
}

/** Renders the `color` of a component as its `kbq-<color>` host class. */
@Directive({
    host: {
        '[class]': 'colorClassName'
    }
})
export class KbqColorDirective<T extends string = KbqComponentColors | string> {
    /** @docs-private */
    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    private readonly defaultColorState = signal<T>(KbqComponentColors.Empty as T);

    /** Color used while neither the `color` input nor a value set in code gives one. */
    protected readonly defaultColor: Signal<T> = this.defaultColorState.asReadonly();

    /** @docs-private */
    readonly colorInput = input<T | null | undefined>(undefined, { alias: 'color' });

    /** Color set in code. A new value of the input drops it. */
    private readonly colorSetInCode = linkedSignal<T | null | undefined, T | null | undefined>({
        source: this.colorInput,
        computation: () => undefined
    });

    /**
     * Color of the component. A value set in code holds until the input changes, and the default color is used
     * while both are unset or falsy.
     */
    readonly color: WritableSignal<T> = writableColor(
        () => this.colorSetInCode() || this.colorInput() || this.defaultColor(),
        this.colorSetInCode
    );

    /** current class name of color */
    get colorClassName(): string {
        return `kbq-${this.color() || this.defaultColor()}`;
    }

    /** this color will be used as a default value. For example [color]="'' | false | undefined | null". */
    setDefaultColor(color: T): void {
        this.defaultColorState.set(color);
    }
}
