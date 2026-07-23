import {
    AfterContentInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    contentChild,
    ContentChildren,
    Input,
    input,
    QueryList,
    ViewEncapsulation
} from '@angular/core';
import { KbqButton, KbqButtonStyles } from '@koobiq/components/button';
import { KbqColorDirective, KbqComponentColors, kbqInjectNativeElement, ThemePalette } from '@koobiq/components/core';
import { KbqDropdownTrigger } from '@koobiq/components/dropdown';
import { delay } from 'rxjs/operators';

@Component({
    selector: 'kbq-split-button, [kbq-split-button]',
    template: `
        <ng-content select="[kbq-button]" />

        <ng-content select="[kbq-button]" />
    `,
    styleUrls: ['./split-button.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-split-button',
        '[class]': 'kbqStyle',
        '[class.kbq-split-button_styles-for-nested]': 'buttons.length > 1',
        '[class.kbq-split-button_first-disabled]': 'firstDisabled',
        '[class.kbq-split-button_second-disabled]': 'secondDisabled'
    }
})
export class KbqSplitButton extends KbqColorDirective implements AfterContentInit {
    private nativeElement = kbqInjectNativeElement();

    /** @docs-private */
    @ContentChildren(KbqButton) protected buttons: QueryList<KbqButton>;
    /** @docs-private */
    protected readonly dropdownTrigger = contentChild(KbqDropdownTrigger);

    /** Sets the width of the dropdown to the width of the trigger. Default is false */
    readonly panelAutoWidth = input<boolean>(false);

    /** component style, will be set for nested buttons */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input()
    get kbqStyle(): string {
        return `kbq-button_${this._kbqStyle}`;
    }

    set kbqStyle(value: KbqButtonStyles | string) {
        this._kbqStyle = value || KbqButtonStyles.Filled;

        this.updateStyle(this._kbqStyle);
    }

    private _kbqStyle: string | KbqButtonStyles = KbqButtonStyles.Filled;

    /** component color, will be set for nested buttons */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input()
    get color(): KbqComponentColors | ThemePalette | string {
        return this._color;
    }

    set color(value: KbqComponentColors | ThemePalette | string) {
        if (!value) return;

        super.color = value;

        this.updateColor(this.color);
    }

    /** Whether the checkbox is disabled. */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input({ transform: booleanAttribute })
    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(value: boolean) {
        this._disabled = value;

        this.updateDisabledState(this._disabled);
    }

    protected _disabled: boolean;

    get firstDisabled(): boolean {
        return this.buttons.first?.disabled;
    }

    get secondDisabled(): boolean {
        return this.buttons.length > 1 && this.buttons.last?.disabled;
    }

    constructor() {
        super();

        this.color = KbqComponentColors.ContrastFade;
    }

    ngAfterContentInit(): void {
        this.updateClasses();
        this.updateStyle(this._kbqStyle);
        this.updateColor(this.color);
        this.updateDisabledState(this.disabled);
        this.updateDropdownParams();

        if (!this.buttons.length) {
            throw new Error(`kbq-split-button must contain at least one button`);
        }

        this.buttons.changes.pipe(delay(0)).subscribe(() => {
            this.updateClasses();
            this.updateStyle(this._kbqStyle);
            this.updateColor(this.color);
            this.updateDropdownParams();
        });
    }

    private updateClasses() {
        this.buttons.forEach((button: KbqButton) => {
            button.getHostElement().classList.remove(`kbq-split-button_first`, `kbq-split-button_second`);
        });

        this.buttons.first?.getHostElement().classList.add(`kbq-split-button_first`);
        this.buttons.last?.getHostElement().classList.add(`kbq-split-button_second`);
        this.buttons.forEach((button: KbqButton) => {
            button.getHostElement().classList.add(`kbq-split-button_item`);
        });
    }

    private updateColor(color: KbqComponentColors | ThemePalette | string) {
        this.buttons?.forEach((button: KbqButton) => (button.color = color));
    }

    private updateStyle(style: KbqButtonStyles | string) {
        this.buttons?.forEach((button: KbqButton) => (button.kbqStyle = style));
    }

    private updateDisabledState(state: boolean) {
        if (state === undefined) return;

        this.buttons?.forEach((button: KbqButton) => (button.disabled = state));
    }

    private updateDropdownParams = () => {
        const dropdownTrigger = this.dropdownTrigger();

        if (!dropdownTrigger) return;

        dropdownTrigger.dropdown.xPosition = 'before';

        // The trigger is only the chevron button, so the whole control has to be named explicitly.
        // It is measured lazily on open, which is why no wait for styles to apply is needed here.
        dropdownTrigger.widthOrigin = this.panelAutoWidth() ? this.nativeElement : undefined;
    };
}
