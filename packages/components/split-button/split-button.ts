import {
    AfterContentInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChild,
    contentChildren,
    effect,
    Input,
    input,
    isDevMode,
    ViewEncapsulation
} from '@angular/core';
import { KbqButton, KbqButtonColor, KbqButtonStyleInput, KbqButtonStyles } from '@koobiq/components/button';
import { KbqColorDirective, KbqComponentColors, kbqInjectNativeElement } from '@koobiq/components/core';
import { KbqDropdownTrigger } from '@koobiq/components/dropdown';

@Component({
    selector: 'kbq-split-button, [kbq-split-button]',
    template: `
        <ng-content select="[kbq-button]" />
    `,
    styleUrls: ['./split-button.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        // The nested buttons stay separate tab stops and separate actions; the host only ties them
        // together, which is exactly what `group` announces. Consumers name it with `aria-label`.
        role: 'group',
        class: 'kbq-split-button',
        '[class]': 'kbqStyle',
        '[class.kbq-split-button_styles-for-nested]': 'buttons().length > 1',
        '[class.kbq-split-button_first-disabled]': 'firstDisabled',
        '[class.kbq-split-button_second-disabled]': 'secondDisabled'
    }
})
export class KbqSplitButton extends KbqColorDirective implements AfterContentInit {
    private readonly nativeElement = kbqInjectNativeElement();

    /** @docs-private */
    protected readonly buttons = contentChildren(KbqButton);
    /** @docs-private */
    protected readonly dropdownTrigger = contentChild(KbqDropdownTrigger);

    /** Sets the width of the dropdown to the width of the trigger. Default is false */
    readonly panelAutoWidth = input<boolean>(false);

    /**
     * Visual style of the split button, propagated to every nested button. A button that sets its own
     * `kbqStyle` keeps it.
     *
     * Reads back as the resulting host class rather than the value that was set, because the host
     * `[class]` binding is what consumes it.
     */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input()
    get kbqStyle(): string {
        return `kbq-button_${this._kbqStyle}`;
    }

    set kbqStyle(value: KbqButtonStyleInput | null | undefined) {
        this._kbqStyle = value || KbqButtonStyles.Filled;

        this.updateStyle(this._kbqStyle, this.buttons?.());
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

        this.updateColor(this.buttons?.());
    }

    /** Whether `color` was bound from the outside rather than left at the split button's own default. */
    private colorSetExplicitly = false;

    /**
     * Whether the split button is disabled. Disabling it disables every nested button; re-enabling it
     * leaves buttons that are disabled through their own input untouched.
     */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input({ transform: booleanAttribute })
    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(value: boolean) {
        this._disabled = value;

        this.updateDisabledState(this._disabled, this.buttons?.());
    }

    protected _disabled: boolean;

    // Both states are computed rather than read off the query on every pass, and stay getters rather
    // than becoming signals because they are public API, where the call shape has to keep working as
    // a property read.

    /** Whether the leading button is disabled. */
    get firstDisabled(): boolean {
        return this.firstButtonDisabled();
    }

    /** Whether the trailing button is disabled. Stays `false` while the split button holds one button. */
    get secondDisabled(): boolean {
        return this.lastButtonDisabled();
    }

    private readonly firstButtonDisabled = computed(() => !!this.buttons().at(0)?.disabled);

    private readonly lastButtonDisabled = computed(() => {
        const buttons = this.buttons();

        return buttons.length > 1 && !!buttons.at(-1)?.disabled;
    });

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

        effect(() => {
            const buttons = this.buttons();

            this.updateClasses(buttons);
            this.updateColor(buttons);
            this.updateStyle(this._kbqStyle, buttons);
            this.updateDisabledState(this._disabled, buttons);
            this.updateDropdownParams();
        });
    }

    ngAfterContentInit(): void {
        // Dev-mode only: in production a misconfigured template degrades to an empty control instead
        // of aborting the change detection pass of whoever renders it.
        if (isDevMode() && !this.buttons().length) {
            throw new Error('kbq-split-button must contain at least one button');
        }
    }

    private updateClasses(buttons: readonly KbqButton[]) {
        buttons.forEach((button: KbqButton) => {
            button.getHostElement().classList.remove('kbq-split-button_first', 'kbq-split-button_second');
        });

        buttons.at(0)?.getHostElement().classList.add('kbq-split-button_first');
        buttons.at(-1)?.getHostElement().classList.add('kbq-split-button_second');
        buttons.forEach((button: KbqButton) => {
            button.getHostElement().classList.add('kbq-split-button_item');
        });
    }

    /**
     * Propagates the split button's color, or — while the input is unbound — releases every nested
     * button back to the default color of the current style.
     */
    private updateColor(buttons?: readonly KbqButton[]) {
        const color = this.colorSetExplicitly ? this.color : undefined;

        buttons?.forEach((button: KbqButton) => button.setColorFromGroup(color));
    }

    private updateStyle(style: KbqButtonStyleInput, buttons?: readonly KbqButton[]) {
        buttons?.forEach((button: KbqButton) => button.setKbqStyleFromGroup(style));
    }

    private updateDisabledState(state: boolean, buttons?: readonly KbqButton[]) {
        // Stays `undefined` while the input is unbound, and force-enabling every nested button is not
        // the same thing as not being disabled.
        if (state === undefined) return;

        buttons?.forEach((button: KbqButton) => button.setDisabledFromGroup(state));
    }

    private updateDropdownParams(): void {
        const dropdownTrigger = this.dropdownTrigger();

        if (!dropdownTrigger) return;

        dropdownTrigger.dropdown.xPosition = 'before';

        // The trigger is only the chevron button, so the whole control has to be named explicitly.
        // It is measured lazily on open, which is why no wait for styles to apply is needed here.
        dropdownTrigger.widthOrigin = this.panelAutoWidth() ? this.nativeElement : undefined;
    }
}
