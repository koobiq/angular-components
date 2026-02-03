import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconButton } from '@koobiq/components/icon';

/**
 * @title Icon-button custom size
 */
@Component({
    selector: 'icon-button-custom-size-example',
    imports: [KbqIconButton],
    template: `
        <div>
            <div class="kbq-text-compact layout-margin-bottom-m icon-button-style-example__style-label">Compact</div>

            <i
                kbq-icon-button="kbq-magnifying-glass_16"
                class="custom-icon-button_compact"
                [color]="colors.Theme"
                [small]="true"
            ></i>
        </div>

        <div>
            <div class="kbq-text-compact layout-margin-bottom-m icon-button-style-example__style-label">Normal</div>

            <i kbq-icon-button="kbq-magnifying-glass_24" class="custom-icon-button_normal" [color]="colors.Theme"></i>
        </div>
    `,
    styles: `
        .icon-button-style-example__style-label {
            color: var(--kbq-foreground-contrast-secondary);
        }

        .custom-icon-button_compact {
            --kbq-icon-button-size-small-vertical-padding: var(--kbq-size-xs);
            --kbq-icon-button-size-small-horizontal-padding: var(--kbq-size-xs);
        }

        .custom-icon-button_normal {
            --kbq-icon-button-size-normal-vertical-padding: var(--kbq-size-xxs);
            --kbq-icon-button-size-normal-horizontal-padding: var(--kbq-size-xxs);
        }
    `,
    host: {
        class: 'layout-row layout-align-left-center layout-gap-3xl'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconButtonCustomSizeExample {
    colors = KbqComponentColors;
}
