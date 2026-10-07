import { Directive, ElementRef, inject, input, linkedSignal, Signal, signal, WritableSignal } from '@angular/core';

export interface CanColor {
    readonly color: Signal<KbqComponentColors | ThemePalette | string>;
}

export enum ThemePalette {
    Primary = 'primary',
    Secondary = 'secondary',
    Error = 'error',
    Info = 'info',
    Warning = 'warning',
    Success = 'success',

    Default = 'secondary',
    Empty = ''
}

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

/** Renders the `color` of a component as its `kbq-<color>` host class. */
@Directive({
    host: {
        '[class]': 'colorClassName'
    }
})
export class KbqColorDirective<T extends string = KbqComponentColors | ThemePalette | string> {
    /** @docs-private */
    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    private readonly defaultColorState = signal<T>(KbqComponentColors.Empty as T);

    /** Color used while the `color` input is unset or falsy. */
    protected readonly defaultColor: Signal<T> = this.defaultColorState.asReadonly();

    /** @docs-private */
    readonly colorInput = input<T | null | undefined>(undefined, { alias: 'color' });

    /**
     * Color of the component. Falls back to the default color while the input is unset or falsy.
     * A value set in code holds until the input or the default color changes.
     */
    readonly color: WritableSignal<T> = linkedSignal(() => this.colorInput() || this.defaultColor());

    /** current class name of color */
    get colorClassName(): string {
        return `kbq-${this.color() || this.defaultColor()}`;
    }

    /** this color will be used as a default value. For example [color]="'' | false | undefined | null". */
    setDefaultColor(color: T): void {
        this.defaultColorState.set(color);
    }
}
