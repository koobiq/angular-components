import { afterNextRender, ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { enUSLocaleData } from '@koobiq/components/core';
import { KbqClampedText } from './clamped-text';
import { kbqClampedTextDefaultMaxRows, kbqClampedTextLocaleConfigurationProvider } from './constants';

type ClampedTextState = {
    rows: number;
    isCollapsed?: boolean;
};

@Component({
    selector: 'e2e-clamped-text-state-and-style',
    imports: [KbqClampedText],
    template: `
        <div>
            <table data-testid="e2eClampedTextTable">
                @for (row of states(); track $index) {
                    <tr>
                        @for (cell of row; track $index) {
                            <td style="max-width: 300px;">
                                <kbq-clamped-text [rows]="cell.rows" [isCollapsed]="cell.isCollapsed">
                                    {{ text }}
                                </kbq-clamped-text>
                            </td>
                        }
                    </tr>
                }
            </table>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [kbqClampedTextLocaleConfigurationProvider(enUSLocaleData.clampedText)],
    host: {
        'data-testid': 'e2eClampedTextStateAndStyle'
    }
})
export class E2eClampedTextStateAndStyle {
    protected readonly text =
        'In a distributed denial-of-service attack (DDoS attack), the incoming traffic flooding the victim originates from many different sources. More sophisticated strategies are required to mitigate this type of attack; simply attempting to block a single source is insufficient as there are multiple sources. A DoS or DDoS attack is analogous to a group of people crowding the entry door of a shop, making it hard for legitimate customers to enter, thus disrupting trade and losing the business money. Criminal perpetrators of DoS attacks often target sites or services hosted on high-profile web servers such as banks or credit card payment gateways. Revenge and blackmail, as well as hacktivism, can motivate these attacks.';

    constructor() {
        afterNextRender(() => {
            this.states.set([
                [{ isCollapsed: true, rows: kbqClampedTextDefaultMaxRows }],
                [{ isCollapsed: false, rows: kbqClampedTextDefaultMaxRows }],
                [{ rows: 3 }]
            ]);
        });
    }

    protected readonly states = signal<ClampedTextState[][]>([
        [{ rows: kbqClampedTextDefaultMaxRows }],
        [{ rows: kbqClampedTextDefaultMaxRows }],
        [{ rows: 3 }]
    ]);
}
