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
import { KbqButton, KbqButtonColor, KbqButtonStyleInput, KbqButtonStyles } from '@koobiq/components/button';
import { KbqColorDirective, KbqComponentColors, kbqInjectNativeElement } from '@koobiq/components/core';
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

    set kbqStyle(value: KbqButtonStyleInput | null | undefined) {
        this._kbqStyle = value || KbqButtonStyles.Filled;

        this.updateStyle(this._kbqStyle);
    }

    private _kbqStyle: KbqButtonStyleInput = KbqButtonStyles.Filled;

    /**
     * component color, will be set for nested buttons
     *
     * Left unbound, nothing is propagated and every nested button follows the default color of the
     * current style.
     */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input()
    get color(): KbqButtonColor {
        return this._color as KbqButtonColor;
    }

    set color(value: KbqButtonColor | null | undefined) {
        this.colorSetExplicitly = !!value;

        // A falsy value means the input is (back to being) unbound: it falls back to `defaultColor`,
        // the split button's own color, which is not propagated — see the constructor.
        super.color = value!;

        this.updateColor();
    }

    /** Whether `color` was bound from the outside rather than left at the split button's own default. */
    private colorSetExplicitly = false;

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

        // `KbqColorDirective`'s constructor assigns `this.color`, which dispatches to the setter
        // above and flips the flag. Reset it here rather than relying on the field initializer
        // happening to run after `super()`.
        this.colorSetExplicitly = false;

        // Applied through `super` so that the split button's own default does not count as an
        // explicit color: it styles the host element but is not propagated, so every nested button
        // is free to follow the default color of the current style.
        super.color = KbqComponentColors.ContrastFade;
        this.setDefaultColor(KbqComponentColors.ContrastFade);
    }

    ngAfterContentInit(): void {
        this.updateClasses();
        this.updateStyle(this._kbqStyle);
        this.updateColor();
        this.updateDisabledState(this.disabled);
        this.updateDropdownParams();

        if (!this.buttons.length) {
            throw new Error(`kbq-split-button must contain at least one button`);
        }

        this.buttons.changes.pipe(delay(0)).subscribe(() => {
            this.updateClasses();
            this.updateStyle(this._kbqStyle);
            this.updateColor();
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

    /**
     * Propagates the split button's color, or — while the input is unbound — releases every nested
     * button back to the default color of the current style.
     */
    private updateColor() {
        const color = this.colorSetExplicitly ? this.color : undefined;

        this.buttons?.forEach((button: KbqButton) => (button.color = color));
    }

    private updateStyle(style: KbqButtonStyleInput) {
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
