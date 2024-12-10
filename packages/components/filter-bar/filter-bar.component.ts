import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    standalone: true,
    selector: 'kbq-filter-bar, [kbq-filter-bar]',
    template: `
        <div class="kbq-filter-bar__left">
            <ng-content />
        </div>

        <ng-content select="kbq-filter-bar-actions, [kbq-filter-bar-actions]" />
    `,
    styleUrls: ['filter-bar.component.scss', 'filter-bar-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-filter-bar'
    }
})
export class KbqFilterBar {}
