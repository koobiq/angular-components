import { ElementRef } from '@angular/core';
import { AbstractConstructor, Constructor } from './constructor';

// tslint:disable-next-line:naming-convention
export interface CanColor {
    color: KbqComponentColors | ThemePalette | string;
}

/** @docs-private */
export type CanColorCtor = Constructor<CanColor> & AbstractConstructor<CanColor>;

// tslint:disable-next-line:naming-convention
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
    Empty = '',
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
    Empty = '',
}

/** Mixin to augment a directive with a `color` property. */
export function mixinColor<T extends AbstractConstructor<HasElementRef>>(
    base: T,
    defaultColor?: KbqComponentColors | ThemePalette,
): CanColorCtor & T;

export function mixinColor<T extends Constructor<HasElementRef>>(
    base: T,
    defaultColor: KbqComponentColors | ThemePalette = KbqComponentColors.Empty,
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
        }
    };
}
