import * as i0 from '@angular/core';
import { Signal, ElementRef, WritableSignal } from '@angular/core';

declare enum KbqComponentColors {
    Theme = "theme",
    ThemeFade = "theme-fade",
    Contrast = "contrast",
    ContrastFade = "contrast-fade",
    Error = "error",
    Warning = "warning",
    Success = "success",
    Default = "contrast",
    Empty = "empty"
}
/** Renders the `color` of a component as its `kbq-<color>` host class. */
declare class KbqColorDirective<T extends string = KbqComponentColors | string> {
    /** @docs-private */
    readonly elementRef: ElementRef<HTMLElement>;
    private readonly defaultColorState;
    /** Color used while neither the `color` input nor a value set in code gives one. */
    protected readonly defaultColor: Signal<T>;
    /** @docs-private */
    readonly colorInput: i0.InputSignal<T | null | undefined>;
    /** Color set in code. A new value of the input drops it. */
    private readonly colorSetInCode;
    /**
     * Color of the component. A value set in code holds until the input changes, and the default color is used
     * while both are unset or falsy.
     */
    readonly color: WritableSignal<T>;
    /** current class name of color */
    get colorClassName(): string;
    /** this color will be used as a default value. For example [color]="'' | false | undefined | null". */
    setDefaultColor(color: T): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<KbqColorDirective<any>, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<KbqColorDirective<any>, never, never, { "colorInput": { "alias": "color"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

export { KbqColorDirective, KbqComponentColors };
