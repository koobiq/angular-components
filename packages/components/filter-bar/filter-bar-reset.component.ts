import {
    Component,
    inject
} from '@angular/core';
import { KbqButtonModule } from '../button';
import { KbqFilterBar } from './filter-bar.component';

@Component({
    standalone: true,
    selector: 'kbq-filter-reset',
    template: `
        <button kbq-button [color]="'theme'" [kbqStyle]="'transparent'" (click)="reset()">
            <ng-content />
        </button>`,
    host: {
        class: 'kbq-filter-bar-reset'
    },
    imports: [
        KbqButtonModule
    ]
})
export class KbqFilterReset {
    protected readonly filterBar = inject(KbqFilterBar);

    reset() {
        this.filterBar.activeFilterChanges.next(null);
    }
}
