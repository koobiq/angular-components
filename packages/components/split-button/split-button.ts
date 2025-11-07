import {
    AfterContentInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    ContentChild,
    ContentChildren,
    Input,
    QueryList,
    ViewEncapsulation
} from '@angular/core';
import { KbqButton, KbqButtonStyles } from '@koobiq/components/button';
import { KbqColorDirective, KbqComponentColors, kbqInjectNativeElement, ThemePalette } from '@koobiq/components/core';
import { KbqDropdownTrigger } from '@koobiq/components/dropdown';

@Component({
    standalone: true,
    selector: 'kbq-split-button, [kbq-split-button]',
    templateUrl: './split-button.html',
    styleUrls: ['./split-button.scss'],
    host: {
        class: 'kbq-split-button',
        '[class.kbq-split-button_styles-for-nested]': 'buttons.length > 1'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqSplitButton extends KbqColorDirective implements AfterContentInit {
    private nativeElement = kbqInjectNativeElement();

    /** @docs-private */
    @ContentChildren(KbqButton) protected buttons: QueryList<KbqButton>;
    /** @docs-private */
    @ContentChild(KbqDropdownTrigger) protected dropdownTrigger: KbqDropdownTrigger;

    /** Sets the width of the dropdown to the width of the trigger. Default is false */
    @Input() panelAutoWidth: boolean = false;

    /** component style, will be set for nested buttons */
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
    @Input()
    get color(): KbqComponentColors | ThemePalette | string {
        return this._color;
    }

    set color(value: KbqComponentColors | ThemePalette | string) {
        this._color = value;

        this.updateColor(this.color);
    }

    /** Whether the checkbox is disabled. */
    @Input({ transform: booleanAttribute })
    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(value: boolean) {
        this._disabled = value;

        this.updateDisabledState(this._disabled);
    }

    protected _disabled: boolean;

    constructor() {
        super();

        this.color = KbqComponentColors.ContrastFade;
    }

    ngAfterContentInit(): void {
        this.updateStyle(this._kbqStyle);
        this.updateColor(this.color);
        this.updateDisabledState(this.disabled);
        this.updateDropdownParams();
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
        if (!this.dropdownTrigger) return;

        this.dropdownTrigger.dropdown.xPosition = 'before';

        if (this.panelAutoWidth) {
            // we need to use a timeout of about 50ms to wait for the styles to apply
            setTimeout(() => {
                const { width } = this.nativeElement.getClientRects()[0];

                this.dropdownTrigger.dropdown.triggerWidth = `${Math.round(width)}px`;
            }, 50);
        }
    };
}
