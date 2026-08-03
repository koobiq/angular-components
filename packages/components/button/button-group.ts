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
     * A button that sets its own `kbqStyle` keeps it.
     */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
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
     * A button that sets its own `color` keeps it.
     */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input()
    get color(): KbqComponentColors | ThemePalette | string {
        return this._color;
    }

    set color(value: KbqComponentColors | ThemePalette | string) {
        if (!value) return;

        super.color = value;

        this.updateColor(this.color, this.buttons?.());
    }

    /**
     * Whether the root is disabled. Disabling the group disables every nested button; re-enabling it
     * leaves buttons that are disabled through their own input untouched.
     *
     * Stays `undefined` while the input is unbound so that nested buttons are not force-enabled.
     */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input({ transform: booleanAttribute })
    get disabled(): boolean | undefined {
        return this._disabled;
    }

    set disabled(value: boolean) {
        this._disabled = value;

        this.updateDisabledState(this._disabled, this.buttons?.());
    }

    /** @docs-private */
    protected _disabled: boolean | undefined;

    constructor() {
        super();

        this.color = KbqComponentColors.ContrastFade;
        this.setDefaultColor(KbqComponentColors.ContrastFade);

        effect(() => {
            const buttons = this.buttons();

            this.updateColor(this.color, buttons);
            this.updateStyle(this._kbqStyle, buttons);
            this.updateDisabledState(this._disabled, buttons);
        });
    }

    private updateColor(color: KbqComponentColors | ThemePalette | string, buttons?: readonly KbqButton[]) {
        buttons?.forEach((button: KbqButton) => button.setColorFromGroup(color));
    }

    private updateStyle(style: KbqButtonStyles | string, buttons?: readonly KbqButton[]) {
        buttons?.forEach((button: KbqButton) => button.setKbqStyleFromGroup(style));
    }

    private updateDisabledState(state: boolean | undefined, buttons?: readonly KbqButton[]) {
        if (state === undefined) return;

        buttons?.forEach((button: KbqButton) => button.setDisabledFromGroup(state));
    }
}

/** Groups and styling related `KbqButton`s into a single visual unit. */
@Component({
    selector: 'kbq-button-group, [kbq-button-group]',
    template: `
        <ng-content />
    `,
    styleUrls: ['./button-group.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        role: 'group',
        class: 'kbq-button-group',
        '[class]': '"kbq-button-group_" + orientation()',
        '[attr.aria-orientation]': 'orientation()'
    },
    hostDirectives: [
        { directive: KbqButtonGroupRoot, inputs: ['color', 'kbqStyle', 'disabled'] }
    ]
})
export class KbqButtonGroup {
    /**
     * Layout direction: `'horizontal'` or `'vertical'`
     * @default 'horizontal'
     */
    readonly orientation = input<KbqOrientation>('horizontal');
}
