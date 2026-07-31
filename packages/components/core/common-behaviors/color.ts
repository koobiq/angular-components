import { Directive, ElementRef, inject, Input } from '@angular/core';

export interface CanColor {
    color: KbqComponentColors | ThemePalette | string;
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

@Directive()
export class KbqColorDirective {
    /** @docs-private */
    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    /** @docs-private */
    protected defaultColor: KbqComponentColors | ThemePalette | string;

    /** current class name of color */
    get colorClassName(): KbqComponentColors | ThemePalette | string {
        return `kbq-${this._color}`;
    }

    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
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
