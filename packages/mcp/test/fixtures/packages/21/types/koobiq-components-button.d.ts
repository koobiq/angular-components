import * as i0 from '@angular/core';
import { OnChanges, OnDestroy, AfterViewInit, AfterViewChecked, ElementRef, SimpleChanges } from '@angular/core';
import { KbqColorDirective, KbqEnumValues, KbqComponentColors, KbqTitleTextRef } from '@koobiq/components/core';

declare enum KbqButtonStyles {
    Filled = "filled",
    Outline = "outline",
    Transparent = "transparent"
}
/** Visual style of a button, as an enum member or its plain string form. */
type KbqButtonStyle = KbqEnumValues<KbqButtonStyles>;
type KbqButtonStyleInput = KbqButtonStyle | (string & {});
/**
 * Colors a button can be rendered in, as an enum member or its plain string form.
 */
type KbqButtonColor = KbqEnumValues<KbqComponentColors.Theme | KbqComponentColors.ThemeFade | KbqComponentColors.Contrast | KbqComponentColors.ContrastFade>;
declare class KbqButton extends KbqColorDirective<KbqButtonColor> implements OnChanges, OnDestroy, AfterViewInit, AfterViewChecked, KbqTitleTextRef {
    private focusMonitor;
    private readonly changeDetectorRef;
    hasFocus: boolean;
    /**
     * Visual style of the button. Setting it to a value marks that value as owned by the button, so
     * a surrounding `KbqButtonGroupRoot` no longer overrides it.
     */
    get kbqStyle(): string;
    set kbqStyle(value: KbqButtonStyleInput | null | undefined);
    private _kbqStyle;
    /** @docs-private */
    readonly kbqStyleInput: i0.InputSignal<KbqButtonStyleInput | null | undefined>;
    /** @docs-private */
    readonly disabledInput: i0.InputSignalWithTransform<boolean | undefined, string | boolean | null | undefined>;
    ngOnChanges(changes: SimpleChanges): void;
    constructor();
    ngAfterViewInit(): void;
    ngAfterViewChecked(): void;
    ngOnDestroy(): void;
    focus(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<KbqButton, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<KbqButton, "[kbq-button]", never, { "kbqStyleInput": { "alias": "kbqStyle"; "required": false; "isSignal": true; }; "disabledInput": { "alias": "disabled"; "required": false; "isSignal": true; }; }, {}, never, ["[kbqButtonPrefix]", "*", "[kbqButtonSuffix]"], true, never>;
}

export { KbqButton, KbqButtonStyles };
export type { KbqButtonColor, KbqButtonStyle, KbqButtonStyleInput };
