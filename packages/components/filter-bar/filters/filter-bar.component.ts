import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'kbq-filter-bar, [kbq-filter-bar]',
    template: '<ng-content />',
    styleUrls: ['filter-bar.component.scss', 'filter-bar-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-filter-bar'
    }
})
export class KbqFilterBar {
}
