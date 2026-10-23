import * as i0 from '@angular/core';
import { ElementRef } from '@angular/core';

interface CanColor {
    color: KbqComponentColors | ThemePalette | string;
}
type CanColorCtor = Constructor<CanColor> & AbstractConstructor<CanColor>;
interface HasElementRef {
    elementRef: ElementRef;
}
declare enum ThemePalette {
    Primary = "primary",
    Secondary = "secondary",
    Error = "error",
    Info = "info",
    Warning = "warning",
    Success = "success",
    Default = "secondary",
    Empty = ""
}
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
/** Mixin to augment a directive with a `color` property. */
declare function mixinColor<T extends AbstractConstructor<HasElementRef>>(base: T, defaultColor?: KbqComponentColors | ThemePalette): CanColorCtor & T;
declare class KbqColorDirective {
    /** @docs-private */
    readonly elementRef: ElementRef<HTMLElement>;
    /** @docs-private */
    protected defaultColor: KbqComponentColors | ThemePalette | string;
    /** current class name of color */
    get colorClassName(): KbqComponentColors | ThemePalette | string;
    get color(): KbqComponentColors | ThemePalette | string;
    set color(value: KbqComponentColors | ThemePalette | string);
    protected _color: KbqComponentColors | ThemePalette | string;
    constructor();
    /** this color will be used as a default value. For example [color]="'' | false | undefined | null". */
    setDefaultColor(color: KbqComponentColors | ThemePalette | string): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<KbqColorDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<KbqColorDirective, never, never, { "color": { "alias": "color"; "required": false; }; }, {}, never, never, true, never>;
}

export { KbqColorDirective, KbqComponentColors, ThemePalette, mixinColor };
export type { CanColor, CanColorCtor, HasElementRef };
