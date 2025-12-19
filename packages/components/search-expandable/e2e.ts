import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqSearchExpandableModule } from './search-expandable.module';

@Component({
    selector: 'e2e-search-expandable-states',
    imports: [KbqSearchExpandableModule],
    template: `
        <div data-testid="e2eScreenshotTarget" style="width: 400px">
            <kbq-search-expandable />
            <br />
            <kbq-search-expandable [isOpened]="true" />
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eSearchExpandableStates'
    }
})
export class E2eSearchExpandableStates {}
