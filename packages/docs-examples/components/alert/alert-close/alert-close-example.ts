import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqAlert, KbqAlertCloseButton } from '@koobiq/components/alert';
import { kbqAnimationsDisabled, KbqComponentColors } from '@koobiq/components/core';
import { KbqIcon, KbqIconButton } from '@koobiq/components/icon';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title Alert close
 */
@Component({
    selector: 'alert-close-example',
    imports: [
        KbqAlert,
        KbqAlertCloseButton,
        KbqIcon,
        KbqIconButton
    ],
    template: `
        @if (state) {
            <kbq-alert
                animate.leave="example-alert_leave"
                class="flex-100"
                [class.kbq-animations-disabled]="animationsDisabled"
                [compact]="true"
                (closed)="state = false"
            >
                <i aria-hidden="true" kbq-icon="kbq-circle-info_16"></i>
                {{ t().closeHint }}
                <button
                    kbq-alert-close-button
                    kbq-icon-button="kbq-xmark-s_16"
                    [attr.aria-label]="t().close"
                    [color]="colors.ContrastFade"
                ></button>
            </kbq-alert>
        }
    `,
    styles: `
        .example-alert_leave {
            animation: example-alert-fade-out 0.2s forwards;
        }

        .example-alert_leave.kbq-animations-disabled {
            animation: none;
        }

        @media (prefers-reduced-motion: reduce) {
            .example-alert_leave {
                animation: none;
            }
        }

        @keyframes example-alert-fade-out {
            to {
                opacity: 0;
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertCloseExample extends BaseLocalizedExample<ExampleTranslation> {
    protected readonly animationsDisabled = kbqAnimationsDisabled();
    colors = KbqComponentColors;
    state = true;

    constructor() {
        super(TRANSLATIONS);
    }
}
