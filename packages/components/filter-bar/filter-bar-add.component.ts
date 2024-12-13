import {
    Component,
    inject
} from '@angular/core';
import { KbqButtonModule } from '../button';
import { KbqIcon } from '../icon';
import { KbqFilterBar } from './filter-bar.component';

@Component({
    standalone: true,
    selector: 'kbq-filter-add',
    template: `
        <button kbq-button [color]="'contrast-fade'" [kbqStyle]="'outline'">
            <i kbq-icon="kbq-plus_16"></i>
            <ng-content />
        </button>
    `,
    host: {
        class: 'kbq-filter-add'
    },
    imports: [
        KbqButtonModule,
        KbqIcon
    ]
})
export class KbqFilterAdd {
    protected readonly filterBar = inject(KbqFilterBar);

    add() {
        this.filterBar.activeFilterChanges.next(null);
    }
}
