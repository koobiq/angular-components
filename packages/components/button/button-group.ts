import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    contentChildren,
    Directive,
    effect,
    Input,
    input,
    ViewEncapsulation
} from '@angular/core';
import { KbqColorDirective, KbqComponentColors, KbqOrientation, ThemePalette } from '@koobiq/components/core';
import { KbqButton, KbqButtonStyles } from './button.component';

/**
 * Root directive that groups related buttons,
 * propagating a shared style, color, and disabled state to every nested button
 */
@Directive({
    selector: '[kbqButtonGroupRoot]',
    host: {
        '[class]': 'kbqStyle'
    }
})
export class KbqButtonGroupRoot extends KbqColorDirective {
    private readonly buttons = contentChildren(KbqButton);
    /**
     * Style applied to the group and propagated to every nested button.
     * individual button's style preserved but updated when group input changed.
     */
    @Input()
    get kbqStyle(): string {
        return this._kbqStyle && `kbq-button-group-root_${this._kbqStyle}`;
    }

    set kbqStyle(value: KbqButtonStyles | string) {
        this._kbqStyle = value || KbqButtonStyles.Filled;

        this.updateStyle(this._kbqStyle, this.buttons?.());
    }

    private _kbqStyle: string | KbqButtonStyles = '';

    /**
     * Color applied to the group and propagated to every nested button.
     * individual button's color preserved but updated when group input changed.
     */
    @Input()
    get color(): KbqComponentColors | ThemePalette | string {
        return this._color;
    }

    set color(value: KbqComponentColors | ThemePalette | string) {
        if (!value) return;

        super.color = value;

        this.updateColor(this.color, this.buttons?.());
    }

    /** Whether the root is disabled. */
    @Input({ transform: booleanAttribute })
    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(value: boolean) {
        this._disabled = value;

        this.updateDisabledState(this._disabled, this.buttons?.());
    }

    /** @docs-private */
    protected _disabled: boolean;

    constructor() {
        super();

        this.color = KbqComponentColors.ContrastFade;
        this.setDefaultColor(KbqComponentColors.ContrastFade);

        effect(() => {
            const buttons = this.buttons();

            this.updateColor(this.color, buttons);
            this.updateStyle(this._kbqStyle, buttons);
            this.updateDisabledState(this.disabled, buttons);
        });
    }

    private updateColor(color: KbqComponentColors | ThemePalette | string, buttons?: readonly KbqButton[]) {
        buttons?.forEach((button: KbqButton) => (button.color = color));
    }

    private updateStyle(style: KbqButtonStyles | string, buttons?: readonly KbqButton[]) {
        buttons?.forEach((button: KbqButton) => (button.kbqStyle = style));
    }

    private updateDisabledState(state: boolean, buttons?: readonly KbqButton[]) {
        if (state === undefined) return;

        buttons?.forEach((button: KbqButton) => (button.disabled = state));
    }
}

/** Groups and styling related `KbqButton`s into a single visual unit. */
@Component({
    selector: 'kbq-button-group, [kbq-button-group]',
    template: `
        <ng-content />
    `,
    styleUrls: ['./button-group.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        role: 'group',
        class: 'kbq-button-group',
        '[class]': '"kbq-button-group_" + orientation()',
        '[attr.aria-orientation]': 'orientation()'
    },
    hostDirectives: [
        { directive: KbqButtonGroupRoot, inputs: ['color', 'kbqStyle', 'disabled'] }]
})
export class KbqButtonGroup {
    /**
     * Layout direction: `'horizontal'` or `'vertical'`
     * @default 'horizontal'
     */
    readonly orientation = input<KbqOrientation>('horizontal');
}
