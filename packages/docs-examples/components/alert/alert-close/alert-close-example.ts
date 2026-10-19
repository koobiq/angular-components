import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqAlert, KbqAlertCloseButton } from '@koobiq/components/alert';
import { kbqAnimationsDisabled, KbqComponentColors } from '@koobiq/components/core';
import { KbqIcon, KbqIconButton } from '@koobiq/components/icon';

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
                The alert is dismissed with the close icon in the corner; do not duplicate this with a button below the
                message text
                <button
                    kbq-alert-close-button
                    kbq-icon-button="kbq-xmark-s_16"
                    aria-label="Close"
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
export class AlertCloseExample {
    protected readonly animationsDisabled = kbqAnimationsDisabled();
    colors = KbqComponentColors;
    state = true;
}
