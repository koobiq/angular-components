import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqSearchExpandableModule } from './search-expandable.module';

@Component({
    selector: 'e2e-search-expandable-states',
    imports: [KbqSearchExpandableModule, FormsModule],
    template: `
        <div data-testid="e2eScreenshotTarget" style="width: 400px">
            <kbq-search-expandable [(ngModel)]="search" />
            <br />
            <kbq-search-expandable [isOpened]="true" [(ngModel)]="search" />
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eSearchExpandableStates'
    }
})
export class E2eSearchExpandableStates {
    search: string;
}
