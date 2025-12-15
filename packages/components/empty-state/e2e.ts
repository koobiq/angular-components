import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButton, KbqButtonCssStyler, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors, KbqDefaultSizes } from '@koobiq/components/core';
import { KbqIconItem } from '@koobiq/components/icon';
import {
    KbqEmptyState,
    KbqEmptyStateActions,
    KbqEmptyStateIcon,
    KbqEmptyStateText,
    KbqEmptyStateTitle
} from './empty-state.component';

type EmptyStateState = {
    errorColor: boolean;
    alignTop: boolean;
    size: KbqDefaultSizes;
    withIcon: boolean;
    withHeader: boolean;
    withActions: boolean;
    text: string;
};

@Component({
    selector: 'e2e-empty-state-state-and-style',
    imports: [
        KbqButton,
        KbqButtonCssStyler,
        KbqEmptyState,
        KbqEmptyStateIcon,
        KbqEmptyStateActions,
        KbqEmptyStateText,
        KbqEmptyStateTitle,
        KbqIconItem
    ],
    template: `
        <div>
            <table data-testid="e2eEmptyStateTable">
                @for (row of states; track $index) {
                    <tr>
                        @for (cell of row; track $index) {
                            <td>
                                <kbq-empty-state
                                    [size]="cell.size"
                                    [errorColor]="cell.errorColor"
                                    [alignTop]="cell.alignTop"
                                >
                                    @if (cell.withIcon) {
                                        <i
                                            kbq-empty-state-icon
                                            kbq-icon-item="kbq-triangle-exclamation_16"
                                            [big]="true"
                                            [fade]="true"
                                        ></i>
                                    }
                                    @if (cell.withHeader) {
                                        <div kbq-empty-state-title>EmptyStateTitle</div>
                                    }

                                    <div kbq-empty-state-text>{{ cell.text }}</div>

                                    @if (cell.withActions) {
                                        <div class="layout-row layout-align-center" kbq-empty-state-actions>
                                            <button
                                                class="layout-margin-right-s"
                                                kbq-button
                                                [color]="colors.Contrast"
                                                [kbqStyle]="styles.Filled"
                                            >
                                                Button text 1
                                            </button>

                                            <button kbq-button [color]="colors.ContrastFade" [kbqStyle]="styles.Filled">
                                                Button text 2
                                            </button>
                                        </div>
                                    }
                                </kbq-empty-state>
                            </td>
                        }
                    </tr>
                }
            </table>
        </div>
    `,
    styles: `
        :host {
            .kbq-empty-state {
                min-height: 100px;
                min-width: 200px;
                box-sizing: border-box;
            }

            /* override table cell behavior for testing purposes */
            table tr:last-child td:last-child {
                display: flex;
                height: 400px;
            }

            td {
                border: 1px solid var(--kbq-line-contrast-less);
                border-radius: var(--kbq-size-border-radius);
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-top-l layout-margin-bottom-l layout-column',
        'data-testid': 'e2eEmptyStateStateAndStyle'
    }
})
export class E2eEmptyStateStateAndStyle {
    private defaultText = 'Empty state text' as const;
    private longText =
        'In a distributed denial-of-service attack (DDoS attack), the incoming traffic flooding the victim originates from many different sources. More sophisticated strategies are required to mitigate this type of attack; simply attempting to block a single source is insufficient as there are multiple sources. A DoS or DDoS attack is analogous to a group of people crowding the entry door of a shop, making it hard for legitimate customers to enter, thus disrupting trade and losing the business money. Criminal perpetrators of DoS attacks often target sites or services hosted on high-profile web servers such as banks or credit card payment gateways. Revenge and blackmail, as well as hacktivism, can motivate these attacks.' as const;

    protected readonly states: EmptyStateState[][] = [
        (['compact', 'normal', 'big'] as KbqDefaultSizes[]).map((size) => ({
            size,
            errorColor: false,
            alignTop: false,
            withIcon: false,
            withHeader: false,
            withActions: false,
            text: this.defaultText
        })),

        (['compact', 'normal', 'big'] as KbqDefaultSizes[]).map((size) => ({
            size,
            errorColor: false,
            alignTop: false,
            withIcon: false,
            withHeader: true,
            withActions: false,
            text: this.defaultText
        })),

        (['compact', 'normal', 'big'] as KbqDefaultSizes[]).map((size) => ({
            size,
            errorColor: false,
            alignTop: false,
            withIcon: false,
            withHeader: true,
            withActions: true,
            text: this.defaultText
        })),

        (['compact', 'normal', 'big'] as KbqDefaultSizes[]).map((size) => ({
            size,
            errorColor: false,
            alignTop: false,
            withIcon: true,
            withHeader: true,
            withActions: true,
            text: this.defaultText
        })),

        (['compact', 'normal', 'big'] as KbqDefaultSizes[]).map((size) => ({
            size,
            errorColor: true,
            alignTop: false,
            withIcon: true,
            withHeader: true,
            withActions: true,
            text: this.defaultText
        })),

        [
            {
                size: 'normal',
                errorColor: false,
                alignTop: false,
                withIcon: true,
                withHeader: true,
                withActions: true,
                text: this.longText
            },

            {
                size: 'normal',
                errorColor: false,
                alignTop: true,
                withIcon: true,
                withHeader: true,
                withActions: true,
                text: this.defaultText
            }
        ]

    ];
    protected readonly colors = KbqComponentColors;
    protected readonly styles = KbqButtonStyles;
}
