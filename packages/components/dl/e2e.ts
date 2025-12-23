import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqDlModule } from './dl.module';

@Component({
    selector: 'e2e-dl-states',
    imports: [KbqDlModule],
    template: `
        <!-- Base -->
        <kbq-dl [minWidth]="150">
            <kbq-dt>dt</kbq-dt>
            <kbq-dd>dd</kbq-dd>
            <kbq-dt>dt</kbq-dt>
            <kbq-dd>Multiline description definition multiline description definition</kbq-dd>
            <kbq-dt>Multiline description term</kbq-dt>
            <kbq-dd>dt</kbq-dd>
            <kbq-dt>Multiline description term</kbq-dt>
            <kbq-dd>Multiline description definition multiline description definition</kbq-dd>
        </kbq-dl>

        <!-- Wide -->
        <kbq-dl [minWidth]="150" [wide]="true">
            <kbq-dt>dt</kbq-dt>
            <kbq-dd>dd</kbq-dd>
            <kbq-dt>dt</kbq-dt>
            <kbq-dd>Multiline description definition multiline description definition</kbq-dd>
            <kbq-dt>Multiline description term</kbq-dt>
            <kbq-dd>dt</kbq-dd>
            <kbq-dt>Multiline description term</kbq-dt>
            <kbq-dd>Multiline description definition multiline description definition</kbq-dd>
        </kbq-dl>

        <!-- Vertical -->
        <kbq-dl [vertical]="true">
            <kbq-dt>dt</kbq-dt>
            <kbq-dd>dd</kbq-dd>
            <kbq-dt>Multiline description term multiline description term</kbq-dt>
            <kbq-dd>dd</kbq-dd>
            <kbq-dt>Multiline description term multiline description term</kbq-dt>
            <kbq-dd>Multiline description definition multiline description definition</kbq-dd>
        </kbq-dl>

        <!-- Vertical and wide -->
        <kbq-dl [vertical]="true" [wide]="true">
            <kbq-dt>dt</kbq-dt>
            <kbq-dd>dd</kbq-dd>
            <kbq-dt>Multiline description term multiline description term</kbq-dt>
            <kbq-dd>Multiline description definition multiline description definition</kbq-dd>
        </kbq-dl>
    `,
    styles: `
        :host {
            display: inline-flex;
            flex-direction: column;
            gap: var(--kbq-size-m);
            padding: var(--kbq-size-xxs);
            width: 300px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eDlStates'
    }
})
export class E2eDlStates {}
