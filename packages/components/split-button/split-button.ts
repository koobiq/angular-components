import {
    AfterContentInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    ContentChild,
    ContentChildren,
    ElementRef,
    inject,
    Input,
    QueryList,
    ViewEncapsulation
} from '@angular/core';
import { KbqButton, KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqColorDirective, KbqComponentColors, ThemePalette } from '@koobiq/components/core';
import { KbqDropdownTrigger } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';

@Component({
    standalone: true,
    selector: 'kbq-split-button',
    templateUrl: './split-button.html',
    styleUrls: ['./split-button.scss'],
    host: {
        class: 'kbq-split-button'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        KbqButtonModule,
        KbqIconModule
    ]
})
export class KbqSplitButton extends KbqColorDirective implements AfterContentInit {
    protected nativeElement = inject(ElementRef).nativeElement;

    @ContentChildren(KbqButton) buttons: QueryList<KbqButton>;
    @ContentChild(KbqDropdownTrigger) dropdownTrigger: KbqDropdownTrigger;

    @Input() panelAutoWidth: boolean = true;

    @Input()
    get kbqStyle(): string {
        return `kbq-button_${this._kbqStyle}`;
    }

    set kbqStyle(value: KbqButtonStyles | string) {
        this._kbqStyle = value || KbqButtonStyles.Filled;

        this.updateStyle(this._kbqStyle);
    }

    private _kbqStyle: string | KbqButtonStyles = KbqButtonStyles.Filled;

    @Input()
    get color(): KbqComponentColors | ThemePalette | string {
        return this._color;
    }

    set color(value: KbqComponentColors | ThemePalette | string) {
        this._color = value;

        this.updateColor(this.color);
    }

    @Input({ transform: booleanAttribute })
    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(value: boolean) {
        this._disabled = value;

        this.updateColor(this.color);
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

    protected updateColor(color: KbqComponentColors | ThemePalette | string) {
        this.buttons?.forEach((button: KbqButton) => (button.color = color));
    }

    protected updateStyle(style: KbqButtonStyles | string) {
        this.buttons?.forEach((button: KbqButton) => (button.kbqStyle = style));
    }

    protected updateDisabledState(state: boolean) {
        if (state === undefined) return;

        this.buttons?.forEach((button: KbqButton) => (button.disabled = state));
    }

    private updateDropdownParams = () => {
        if (!this.dropdownTrigger) return;

        this.dropdownTrigger.dropdown.xPosition = 'before';

        if (this.panelAutoWidth) {
            setTimeout(() => {
                const { width } = this.nativeElement.getClientRects()[0];

                this.dropdownTrigger.dropdown.triggerWidth = `${Math.round(width)}px`;
            }, 50);
        }
    };
}
