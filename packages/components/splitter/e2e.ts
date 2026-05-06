import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqSplitterModule } from './splitter.module';

@Component({
    selector: 'e2e-splitter-ghost',
    imports: [
        KbqSplitterModule
    ],
    template: `
        <kbq-splitter style="width: 500px; height: 200px;" [useGhost]="true">
            <div kbq-splitter-area style="flex: 1">first</div>
            <div kbq-splitter-area style="min-width: 50px">second</div>
        </kbq-splitter>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-l);
            padding: var(--kbq-size-s);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eSplitterGhost'
    }
})
export class E2eSplitterGhost {}
