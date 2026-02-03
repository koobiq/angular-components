import { TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconButton } from '@koobiq/components/icon';

/**
 * @title Icon-button style
 */
@Component({
    selector: 'icon-button-style-example',
    imports: [KbqIconButton, TitleCasePipe],
    template: `
        @for (color of colors; track color) {
            <div class="icon-button-style-example__style-container">
                <div class="kbq-text-compact layout-margin-bottom-m icon-button-style-example__style-label">
                    {{ color | titlecase }}
                </div>

                <i kbq-icon-button="kbq-magnifying-glass_16" [color]="color" [small]="false"></i>
            </div>
        }
    `,
    styles: `
        :host {
            flex-wrap: wrap;
            max-width: 448px;
        }

        .icon-button-style-example__style-container {
            width: 128px;
        }

        .icon-button-style-example__style-label {
            color: var(--kbq-foreground-contrast-secondary);
        }

        .kbq-icon-button {
            display: inline-flex;
        }
    `,
    host: {
        class: 'layout-row layout-align-left-center layout-gap-3xl'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconButtonStyleExample {
    colors = [
        KbqComponentColors.Theme,
        KbqComponentColors.Contrast,
        KbqComponentColors.ContrastFade,
        KbqComponentColors.Error,
        KbqComponentColors.Success,
        KbqComponentColors.Warning
    ];
}
