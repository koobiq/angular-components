import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqButtonModule } from '../button';

@Component({
    standalone: true,
    selector: 'kbq-filters',
    template: '<button kbq-button><ng-content /></button>',
    styleUrls: ['filters.component.scss', 'filter-bar-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-filters'
    },
    imports: [
        KbqButtonModule
    ]

})
export class KbqFilters {
}
