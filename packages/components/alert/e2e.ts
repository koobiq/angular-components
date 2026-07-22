import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButton, KbqButtonCssStyler } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIcon, KbqIconButton, KbqIconItem } from '@koobiq/components/icon';
import { KbqLink } from '@koobiq/components/link';
import {
    KbqAlert,
    KbqAlertCloseButton,
    KbqAlertColors,
    KbqAlertControl,
    KbqAlertStyles,
    KbqAlertTitle
} from './alert.component';

@Component({
    selector: 'e2e-alert-state-and-style',
    imports: [
        KbqIconButton,
        KbqIconItem,
        KbqIcon,
        KbqLink,
        KbqAlert,
        KbqAlertTitle,
        KbqAlertCloseButton,
        KbqAlertControl,
        KbqButton,
        KbqButtonCssStyler
    ],
    template: `
        <div>
            <table data-testid="e2eAlertTable">
                <!-- Default alerts without a status icon: color is inert, so each state is shown once -->
                <tr>
                    <td>
                        <kbq-alert [alertStyle]="alertStyle.Default">Alert text</kbq-alert>
                    </td>
                    <td>
                        <kbq-alert [compact]="true" [alertStyle]="alertStyle.Default">Alert text</kbq-alert>
                    </td>
                    <td>
                        <kbq-alert [alertStyle]="alertStyle.Default">
                            Alert text
                            <button
                                kbq-alert-close-button
                                kbq-icon-button="kbq-xmark-s_16"
                                aria-label="Close"
                                [color]="colors.ContrastFade"
                            ></button>
                        </kbq-alert>
                    </td>
                    <td>
                        <kbq-alert [compact]="true" [alertStyle]="alertStyle.Default">
                            Alert text
                            <button
                                kbq-alert-close-button
                                kbq-icon-button="kbq-xmark-s_16"
                                aria-label="Close"
                                [color]="colors.ContrastFade"
                            ></button>
                        </kbq-alert>
                    </td>
                </tr>

                <!-- Icon WITHOUT a title (exercises the no-title icon padding branch) -->
                <tr>
                    @for (alertColor of alertDefaultStyleRows; track $index) {
                        <td>
                            <kbq-alert [alertColor]="alertColor" [alertStyle]="alertStyle.Default">
                                <i kbq-icon-item="kbq-circle-info_16"></i>
                                Alert text without a title
                            </kbq-alert>
                        </td>
                    }
                </tr>

                <!-- Icon WITHOUT a title, compact -->
                <tr>
                    @for (alertColor of alertDefaultStyleRows; track $index) {
                        <td>
                            <kbq-alert [compact]="true" [alertColor]="alertColor" [alertStyle]="alertStyle.Default">
                                <i kbq-icon="kbq-circle-info_16"></i>
                                Alert text without a title
                            </kbq-alert>
                        </td>
                    }
                </tr>

                <!-- Alerts with icon, header, and long content text -->
                <tr>
                    @for (alertColor of alertDefaultStyleRows; track $index) {
                        <td>
                            <kbq-alert [alertColor]="alertColor" [alertStyle]="alertStyle.Default">
                                <i kbq-icon-item="kbq-circle-info_16"></i>
                                <div kbq-alert-title>Header</div>
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed iaculis risus ac varius
                                ultricies. Aenean maximus ex at ornare tempus. Pellentesque habitant morbi tristique
                                senectus et netus et malesuada fames ac turpis egestas.
                                <button
                                    kbq-alert-close-button
                                    kbq-icon-button="kbq-xmark-s_16"
                                    aria-label="Close"
                                    [color]="colors.ContrastFade"
                                ></button>
                            </kbq-alert>
                        </td>
                    }
                </tr>

                <!-- Compact alerts with icon, header, and short content text -->
                <tr>
                    @for (alertColor of alertDefaultStyleRows; track $index) {
                        <td>
                            <kbq-alert [compact]="true" [alertColor]="alertColor" [alertStyle]="alertStyle.Default">
                                <i kbq-icon-item="kbq-circle-info_16"></i>
                                <div kbq-alert-title>Header</div>
                                Alert text
                                <button
                                    kbq-alert-close-button
                                    kbq-icon-button="kbq-xmark-s_16"
                                    aria-label="Close"
                                    [color]="colors.ContrastFade"
                                ></button>
                            </kbq-alert>
                        </td>
                    }
                </tr>

                <!-- Default-style alerts with action buttons (verifies the default-style button stack) -->
                <tr>
                    @for (alertColor of alertDefaultStyleRows; track $index) {
                        <td>
                            <kbq-alert [alertColor]="alertColor" [alertStyle]="alertStyle.Default">
                                <i kbq-icon-item="kbq-circle-info_16"></i>
                                <div kbq-alert-title>Header</div>
                                Alert text
                                <button kbq-alert-control kbq-button [color]="colors.Contrast">Button1</button>
                                <button
                                    kbq-alert-control
                                    kbq-button
                                    [color]="colors.Contrast"
                                    [kbqStyle]="'transparent'"
                                >
                                    Button2
                                </button>
                            </kbq-alert>
                        </td>
                    }
                </tr>

                <!-- Default-style alerts with pseudo-link controls (verifies the link button stack padding) -->
                <tr>
                    @for (alertColor of alertDefaultStyleRows; track $index) {
                        <td>
                            <kbq-alert [alertColor]="alertColor" [alertStyle]="alertStyle.Default">
                                <i kbq-icon-item="kbq-circle-info_16"></i>
                                <div kbq-alert-title>Header</div>
                                Alert text
                                <a kbq-alert-control kbq-link [pseudo]="true">Link1</a>
                                <a kbq-alert-control kbq-link [pseudo]="true">Link2</a>
                            </kbq-alert>
                        </td>
                    }
                </tr>

                <!-- Colored style alerts with icon, header, and content -->
                <tr>
                    @for (alertColor of alertDefaultStyleRows; track $index) {
                        <td>
                            <kbq-alert [alertColor]="alertColor" [alertStyle]="alertStyle.Colored">
                                <i kbq-icon-item="kbq-circle-info_16"></i>
                                <div kbq-alert-title>Header</div>
                                Alert text
                                <button
                                    kbq-alert-close-button
                                    kbq-icon-button="kbq-xmark-s_16"
                                    aria-label="Close"
                                    [color]="colors.ContrastFade"
                                ></button>
                            </kbq-alert>
                        </td>
                    }
                </tr>

                <!-- Compact colored alerts with action buttons -->
                <tr>
                    @for (alertColor of alertDefaultStyleRows; track $index) {
                        <td>
                            <kbq-alert [alertColor]="alertColor" [alertStyle]="alertStyle.Colored" [compact]="true">
                                <i kbq-icon-item="kbq-circle-info_16"></i>
                                <div kbq-alert-title>Header</div>
                                Alert text
                                <button
                                    kbq-alert-close-button
                                    kbq-icon-button="kbq-xmark-s_16"
                                    aria-label="Close"
                                    [color]="colors.ContrastFade"
                                ></button>

                                <!-- Action buttons: standard and transparent styles -->
                                <button kbq-alert-control kbq-button [color]="colors.Contrast">Button1</button>
                                <button
                                    kbq-alert-control
                                    kbq-button
                                    [color]="colors.Contrast"
                                    [kbqStyle]="'transparent'"
                                >
                                    Button2
                                </button>
                            </kbq-alert>
                        </td>
                    }
                </tr>

                <!-- Colored alerts with action buttons (non-compact) -->
                <tr>
                    @for (alertColor of alertDefaultStyleRows; track $index) {
                        <td>
                            <kbq-alert [alertColor]="alertColor" [alertStyle]="alertStyle.Colored">
                                <i kbq-icon-item="kbq-circle-info_16"></i>
                                <div kbq-alert-title>Header</div>
                                Alert text
                                <button
                                    kbq-alert-close-button
                                    kbq-icon-button="kbq-xmark-s_16"
                                    aria-label="Close"
                                    [color]="colors.ContrastFade"
                                ></button>

                                <!-- Action buttons: standard and transparent styles -->
                                <button kbq-alert-control kbq-button [color]="colors.Contrast">Button1</button>
                                <button
                                    kbq-alert-control
                                    kbq-button
                                    [color]="colors.Contrast"
                                    [kbqStyle]="'transparent'"
                                >
                                    Button2
                                </button>
                            </kbq-alert>
                        </td>
                    }
                </tr>
            </table>
        </div>
    `,
    styles: `
        :host {
            .kbq-alert {
                min-width: 300px;
            }

            td {
                vertical-align: top;
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-top-l layout-margin-bottom-l layout-column',
        'data-testid': 'e2eAlertStateAndStyle'
    }
})
export class E2eAlertStateAndStyle {
    protected readonly alertDefaultStyleRows = Array.from(new Set(Object.values(KbqAlertColors)).values());

    protected readonly colors = KbqComponentColors;
    protected readonly alertStyle = KbqAlertStyles;
}
