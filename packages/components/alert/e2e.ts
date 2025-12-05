import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButton, KbqButtonCssStyler } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLink } from '@koobiq/components/link';
import {
    KbqAlert,
    KbqAlertCloseButton,
    KbqAlertColors,
    KbqAlertControl,
    KbqAlertStyles,
    KbqAlertTitle
} from './alert.component';

type AlertState = {
    alertColor: KbqAlertColors;
    alertStyle: KbqAlertStyles;
    withText: string;
    compact?: boolean;
    withIcon?: boolean;
    withTitle?: boolean;
    withCloseButton?: boolean;
    buttonStack?: ('button' | 'link')[];
};

@Component({
    selector: 'e2e-alert-state-and-style',
    imports: [
        KbqIconModule,
        KbqAlert,
        KbqAlertTitle,
        KbqAlertCloseButton,
        KbqAlertControl,
        KbqButton,
        KbqButtonCssStyler,
        KbqLink
    ],
    template: `
        <div>
            <table data-testid="e2eAlertTable">
                @for (row of alertRows; track $index) {
                    <tr>
                        @for (cell of row; track $index) {
                            <td>
                                <kbq-alert [alertColor]="cell.alertColor" [alertStyle]="cell.alertStyle">
                                    @if (cell.withTitle) {
                                        <div kbq-alert-title>Header</div>
                                    }
                                    @if (cell.withIcon) {
                                        @if (cell.compact) {
                                            <i kbq-icon="kbq-info-circle_16"></i>
                                        } @else {
                                            <i kbq-icon-item="kbq-info-circle_16"></i>
                                        }
                                    }
                                    @if (cell.withText) {
                                        {{ cell.withText }}
                                    }
                                    @if (cell.withCloseButton) {
                                        <i
                                            kbq-alert-close-button
                                            kbq-icon-button="kbq-xmark-s_16"
                                            [color]="colors.ContrastFade"
                                        ></i>
                                    }
                                    @if (cell.buttonStack) {
                                        @for (item of cell.buttonStack; track item) {
                                            @switch (item) {
                                                @case ('button') {
                                                    <button kbq-alert-control kbq-button>{{ item }}</button>
                                                }
                                                @case ('link') {
                                                    <a href="" kbq-link>{{ item }}</a>
                                                }
                                            }
                                        }
                                    }
                                </kbq-alert>
                            </td>
                        }
                    </tr>
                }
            </table>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-top-l layout-margin-bottom-l layout-column',
        'data-testid': 'e2eAlertStateAndStyle'
    }
})
export class E2eAlertStateAndStyle {
    protected readonly alertRows: AlertState[][] = [
        [
            {
                alertColor: KbqAlertColors.Error,
                alertStyle: KbqAlertStyles.Default,
                compact: false,
                withIcon: false,
                withTitle: false,
                withText: 'Alert text',
                withCloseButton: false
            },
            {
                alertColor: KbqAlertColors.Error,
                alertStyle: KbqAlertStyles.Colored,
                compact: false,
                withIcon: false,
                withTitle: false,
                withText: 'Alert text',
                withCloseButton: false
            },
            {
                alertColor: KbqAlertColors.Error,
                alertStyle: KbqAlertStyles.Default,
                compact: true,
                withIcon: true,
                withTitle: true,
                withText: 'Alert text',
                withCloseButton: true
            },
            {
                alertColor: KbqAlertColors.Error,
                alertStyle: KbqAlertStyles.Default,
                compact: true,
                withIcon: true,
                withTitle: true,
                withText:
                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed iaculis risus ac varius ultricies. Aenean maximus ex at ornare tempus. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.',
                withCloseButton: true
            },
            {
                alertColor: KbqAlertColors.Error,
                alertStyle: KbqAlertStyles.Default,
                compact: true,
                withIcon: true,
                withTitle: true,
                withText: 'Alert text',
                withCloseButton: true,
                buttonStack: [
                    'button',
                    'button'
                ]
            },
            {
                alertColor: KbqAlertColors.Error,
                alertStyle: KbqAlertStyles.Default,
                compact: true,
                withIcon: true,
                withTitle: true,
                withText: 'Alert text',
                withCloseButton: true,
                buttonStack: [
                    'link',
                    'link'
                ]
            }
        ],
        [
            {
                alertColor: KbqAlertColors.Warning,
                alertStyle: KbqAlertStyles.Default,
                compact: false,
                withIcon: false,
                withTitle: false,
                withText: 'Alert text',
                withCloseButton: false
            },
            {
                alertColor: KbqAlertColors.Warning,
                alertStyle: KbqAlertStyles.Colored,
                compact: false,
                withIcon: false,
                withTitle: false,
                withText: 'Alert text',
                withCloseButton: false
            },
            {
                alertColor: KbqAlertColors.Warning,
                alertStyle: KbqAlertStyles.Default,
                compact: true,
                withIcon: true,
                withTitle: true,
                withText: 'Alert text',
                withCloseButton: true
            },
            {
                alertColor: KbqAlertColors.Warning,
                alertStyle: KbqAlertStyles.Default,
                compact: true,
                withIcon: true,
                withTitle: true,
                withText:
                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed iaculis risus ac varius ultricies. Aenean maximus ex at ornare tempus. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.',
                withCloseButton: true
            },
            {
                alertColor: KbqAlertColors.Warning,
                alertStyle: KbqAlertStyles.Default,
                compact: true,
                withIcon: true,
                withTitle: true,
                withText: 'Alert text',
                withCloseButton: true,
                buttonStack: [
                    'button',
                    'button'
                ]
            },
            {
                alertColor: KbqAlertColors.Warning,
                alertStyle: KbqAlertStyles.Default,
                compact: true,
                withIcon: true,
                withTitle: true,
                withText: 'Alert text',
                withCloseButton: true,
                buttonStack: [
                    'link',
                    'link'
                ]
            }
        ],
        [
            {
                alertColor: KbqAlertColors.Success,
                alertStyle: KbqAlertStyles.Default,
                compact: false,
                withIcon: false,
                withTitle: false,
                withText: 'Alert text',
                withCloseButton: false
            },
            {
                alertColor: KbqAlertColors.Success,
                alertStyle: KbqAlertStyles.Colored,
                compact: false,
                withIcon: false,
                withTitle: false,
                withText: 'Alert text',
                withCloseButton: false
            },
            {
                alertColor: KbqAlertColors.Success,
                alertStyle: KbqAlertStyles.Default,
                compact: true,
                withIcon: true,
                withTitle: true,
                withText: 'Alert text',
                withCloseButton: true
            },
            {
                alertColor: KbqAlertColors.Success,
                alertStyle: KbqAlertStyles.Default,
                compact: true,
                withIcon: true,
                withTitle: true,
                withText:
                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed iaculis risus ac varius ultricies. Aenean maximus ex at ornare tempus. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.',
                withCloseButton: true
            },
            {
                alertColor: KbqAlertColors.Success,
                alertStyle: KbqAlertStyles.Default,
                compact: true,
                withIcon: true,
                withTitle: true,
                withText: 'Alert text',
                withCloseButton: true,
                buttonStack: [
                    'button',
                    'button'
                ]
            },
            {
                alertColor: KbqAlertColors.Success,
                alertStyle: KbqAlertStyles.Default,
                compact: true,
                withIcon: true,
                withTitle: true,
                withText: 'Alert text',
                withCloseButton: true,
                buttonStack: [
                    'link',
                    'link'
                ]
            }
        ],
        [
            {
                alertColor: KbqAlertColors.Info,
                alertStyle: KbqAlertStyles.Default,
                compact: false,
                withIcon: false,
                withTitle: false,
                withText: 'Alert text',
                withCloseButton: false
            },
            {
                alertColor: KbqAlertColors.Info,
                alertStyle: KbqAlertStyles.Colored,
                compact: false,
                withIcon: false,
                withTitle: false,
                withText: 'Alert text',
                withCloseButton: false
            },
            {
                alertColor: KbqAlertColors.Info,
                alertStyle: KbqAlertStyles.Default,
                compact: true,
                withIcon: true,
                withTitle: true,
                withText: 'Alert text',
                withCloseButton: true
            },
            {
                alertColor: KbqAlertColors.Info,
                alertStyle: KbqAlertStyles.Default,
                compact: true,
                withIcon: true,
                withTitle: true,
                withText:
                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed iaculis risus ac varius ultricies. Aenean maximus ex at ornare tempus. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.',
                withCloseButton: true
            },
            {
                alertColor: KbqAlertColors.Info,
                alertStyle: KbqAlertStyles.Default,
                compact: true,
                withIcon: true,
                withTitle: true,
                withText: 'Alert text',
                withCloseButton: true,
                buttonStack: [
                    'button',
                    'button'
                ]
            },
            {
                alertColor: KbqAlertColors.Info,
                alertStyle: KbqAlertStyles.Default,
                compact: true,
                withIcon: true,
                withTitle: true,
                withText: 'Alert text',
                withCloseButton: true,
                buttonStack: [
                    'link',
                    'link'
                ]
            }
        ],
        [
            {
                alertColor: KbqAlertColors.Contrast,
                alertStyle: KbqAlertStyles.Default,
                compact: false,
                withIcon: false,
                withTitle: false,
                withText: 'Alert text',
                withCloseButton: false
            },
            {
                alertColor: KbqAlertColors.Contrast,
                alertStyle: KbqAlertStyles.Colored,
                compact: false,
                withIcon: false,
                withTitle: false,
                withText: 'Alert text',
                withCloseButton: false
            },
            {
                alertColor: KbqAlertColors.Contrast,
                alertStyle: KbqAlertStyles.Default,
                compact: true,
                withIcon: true,
                withTitle: true,
                withText: 'Alert text',
                withCloseButton: true
            },
            {
                alertColor: KbqAlertColors.Contrast,
                alertStyle: KbqAlertStyles.Default,
                compact: true,
                withIcon: true,
                withTitle: true,
                withText:
                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed iaculis risus ac varius ultricies. Aenean maximus ex at ornare tempus. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.',
                withCloseButton: true
            },
            {
                alertColor: KbqAlertColors.Contrast,
                alertStyle: KbqAlertStyles.Default,
                compact: true,
                withIcon: true,
                withTitle: true,
                withText: 'Alert text',
                withCloseButton: true,
                buttonStack: [
                    'button',
                    'button'
                ]
            },
            {
                alertColor: KbqAlertColors.Contrast,
                alertStyle: KbqAlertStyles.Default,
                compact: true,
                withIcon: true,
                withTitle: true,
                withText: 'Alert text',
                withCloseButton: true,
                buttonStack: [
                    'link',
                    'link'
                ]
            }
        ]

    ];
    protected readonly colors = KbqComponentColors;
}
