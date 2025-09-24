import { Directive, ElementRef, inject, Input } from '@angular/core';
import { AbstractConstructor, Constructor } from './constructor';

export interface CanColor {
    color: KbqComponentColors | ThemePalette | string;
}

/** @docs-private */
export type CanColorCtor = Constructor<CanColor> & AbstractConstructor<CanColor>;

export interface HasElementRef {
    elementRef: ElementRef;
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

/** Mixin to augment a directive with a `color` property. */
export function mixinColor<T extends AbstractConstructor<HasElementRef>>(
    base: T,
    defaultColor?: KbqComponentColors | ThemePalette
): CanColorCtor & T;

export function mixinColor<T extends Constructor<HasElementRef>>(
    base: T,
    defaultColor: KbqComponentColors | ThemePalette = KbqComponentColors.Empty
): CanColorCtor & T {
    return class extends base {
        get color(): KbqComponentColors | ThemePalette {
            return this._color;
        }
        set color(value: KbqComponentColors | ThemePalette) {
            const colorPalette = value || defaultColor;

            if (colorPalette !== this._color) {
                if (this._color) {
                    this.elementRef.nativeElement.classList.remove(`kbq-${this._color}`);
                }

                if (colorPalette) {
                    this.elementRef.nativeElement.classList.add(`kbq-${colorPalette}`);
                }

                this._color = colorPalette;
            }
        }

        private _color: KbqComponentColors | ThemePalette;

        constructor(...args: any[]) {
            super(...args);

            this.color = defaultColor;

            console.warn('mixinColor deprecated and will be deleted in next major release');
        }
    };
}

@Directive({ standalone: true })
export class KbqColorDirective {
    /**
     * @docs-private
     */
    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    protected defaultColor: KbqComponentColors | ThemePalette | string;

    get colorClassName(): KbqComponentColors | ThemePalette | string {
        return `kbq-${this._color}`;
    }

    @Input()
    get color(): KbqComponentColors | ThemePalette | string {
        return this._color;
    }

    set color(value: KbqComponentColors | ThemePalette | string) {
        const color = value || this.defaultColor;

        if (color !== this._color) {
            if (this._color) {
                this.elementRef.nativeElement.classList.remove(`kbq-${this._color}`);
            }

            if (color) {
                this.elementRef.nativeElement.classList.add(`kbq-${color}`);
            }

            this._color = color;
        }
    }

    protected _color: KbqComponentColors | ThemePalette | string;

    constructor() {
        this.color = KbqComponentColors.Empty;
    }

    /** this color will be used as a default value. For example [color]="'' | false | undefined | null". */
    setDefaultColor(color: KbqComponentColors | ThemePalette | string) {
        this.defaultColor = color;
    }
}
