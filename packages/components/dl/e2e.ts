import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqBadge } from '@koobiq/components/badge';
import { KbqDlModule } from './dl.module';

@Component({
    selector: 'e2e-dl-states',
    imports: [KbqBadge, KbqDlModule],
    template: `
        <div>
            <!-- Base -->
            <kbq-dl [minWidth]="150">
                <kbq-dt>dt</kbq-dt>
                <kbq-dd>dd</kbq-dd>
                <kbq-dt>dt</kbq-dt>
                <kbq-dd>Multiline description definition</kbq-dd>
                <kbq-dt>Multiline term</kbq-dt>
                <kbq-dd>dt</kbq-dd>
                <kbq-dt>Multiline term</kbq-dt>
                <kbq-dd>Multiline description definition</kbq-dd>
            </kbq-dl>
        </div>

        <div>
            <!-- Wide -->
            <kbq-dl [minWidth]="150" [wide]="true">
                <kbq-dt>dt</kbq-dt>
                <kbq-dd>dd</kbq-dd>
                <kbq-dt>dt</kbq-dt>
                <kbq-dd>Multiline description definition</kbq-dd>
                <kbq-dt>Multiline description term</kbq-dt>
                <kbq-dd>dt</kbq-dd>
                <kbq-dt>Multiline description term</kbq-dt>
                <kbq-dd>Multiline description definition</kbq-dd>
            </kbq-dl>
        </div>

        <div>
            <!-- Vertical alignment: center -->
            <kbq-dl verticalAlign="center" [minWidth]="150">
                <kbq-dt>center</kbq-dt>
                <kbq-dd>
                    <kbq-badge badgeColor="fade-theme">Badge</kbq-badge>
                </kbq-dd>
                <kbq-dt>center</kbq-dt>
                <kbq-dd>Multiline description definition</kbq-dd>
            </kbq-dl>
        </div>

        <div>
            <!-- Vertical alignment: end -->
            <kbq-dl verticalAlign="end" [minWidth]="150">
                <kbq-dt>Multiline description term</kbq-dt>
                <kbq-dd>end</kbq-dd>
                <kbq-dt>end</kbq-dt>
                <kbq-dd>Multiline description definition</kbq-dd>
            </kbq-dl>
        </div>

        <div>
            <!-- Horizontal alignment: center -->
            <kbq-dl horizontalAlign="center" [minWidth]="150">
                <kbq-dt>center</kbq-dt>
                <kbq-dd>dd</kbq-dd>
                <kbq-dt>center</kbq-dt>
                <kbq-dd>definition</kbq-dd>
            </kbq-dl>
        </div>

        <div>
            <!-- Horizontal alignment: end -->
            <kbq-dl horizontalAlign="end" [minWidth]="150">
                <kbq-dt>end</kbq-dt>
                <kbq-dd>definition</kbq-dd>
                <kbq-dt>end</kbq-dt>
                <kbq-dd>Multiline description definition</kbq-dd>
            </kbq-dl>
        </div>

        <div>
            <!-- Vertical -->
            <kbq-dl [vertical]="true">
                <kbq-dt>dt</kbq-dt>
                <kbq-dd>dd</kbq-dd>
                <kbq-dt>Multiline description term multiline description term</kbq-dt>
                <kbq-dd>dd</kbq-dd>
                <kbq-dt>Multiline description term multiline description term</kbq-dt>
                <kbq-dd>Multiline description definition</kbq-dd>
            </kbq-dl>
        </div>

        <div>
            <!-- Vertical and wide -->
            <kbq-dl [vertical]="true" [wide]="true">
                <kbq-dt>dt</kbq-dt>
                <kbq-dd>dd</kbq-dd>
                <kbq-dt>Multiline description term multiline description term</kbq-dt>
                <kbq-dd>Multiline description definition</kbq-dd>
            </kbq-dl>
        </div>
    `,
    styles: `
        :host {
            display: inline-grid;
            grid-template-columns: repeat(3, 250px);
            gap: var(--kbq-size-m);
            padding: var(--kbq-size-xxs);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eDlStates'
    }
})
export class E2eDlStates {}
