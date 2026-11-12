import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconButton } from '@koobiq/components/icon';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title Icon-button size
 */
@Component({
    selector: 'icon-button-size-example',
    imports: [KbqIconButton],
    template: `
        <div>
            <div class="kbq-text-compact layout-margin-bottom-m icon-button-style-example__style-label">Normal</div>

            <i kbq-icon-button="kbq-magnifying-glass_24" [attr.aria-label]="t().search" [color]="colors.Theme"></i>
        </div>

        <div>
            <div class="kbq-text-compact layout-margin-bottom-m icon-button-style-example__style-label">Compact</div>

            <i
                kbq-icon-button="kbq-magnifying-glass_16"
                size="compact"
                [attr.aria-label]="t().search"
                [color]="colors.Theme"
            ></i>
        </div>
    `,
    styles: `
        .icon-button-style-example__style-label {
            color: var(--kbq-foreground-contrast-secondary);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-row layout-align-left-center layout-gap-3xl'
    }
})
export class IconButtonSizeExample extends BaseLocalizedExample<ExampleTranslation> {
    colors = KbqComponentColors;

    constructor() {
        super(TRANSLATIONS);
    }
}
