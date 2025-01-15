import { Component, inject } from '@angular/core';
import { KbqButtonModule } from '../button';
import { KbqDropdownModule } from '../dropdown';
import { KbqIcon } from '../icon';
import { KbqFilterBar } from './filter-bar.component';
import { KbqPipeTemplate } from './filter-bar.types';

@Component({
    standalone: true,
    selector: 'kbq-filter-add',
    template: `
        <button [color]="'contrast-fade'" [kbqStyle]="'outline'" [kbqDropdownTriggerFor]="newPipes" kbq-button>
            <i kbq-icon="kbq-plus_16"></i>
            <ng-content />
        </button>

        <kbq-dropdown #newPipes="kbqDropdown">
            @for (pipe of filterBar.templates; track pipe) {
                <button (click)="add(pipe)" kbq-dropdown-item>{{ pipe.name }}</button>
            }
        </kbq-dropdown>
    `,
    host: {
        class: 'kbq-filter-add'
    },
    imports: [
        KbqDropdownModule,
        KbqButtonModule,
        KbqIcon
    ]
})
export class KbqFilterAdd {
    protected readonly filterBar = inject(KbqFilterBar);

    add(pipe: KbqPipeTemplate) {
        this.filterBar.onAddPipe.next(pipe);
    }
}
