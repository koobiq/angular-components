import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { KbqButtonModule } from '../button';
import { KbqDropdownModule } from '../dropdown';
import { KbqIcon } from '../icon';
import { KbqFilterBar } from './filter-bar';
import { KbqFilter, KbqPipeTemplate } from './filter-bar.types';

@Component({
    standalone: true,
    selector: 'kbq-pipe-add',
    template: `
        <button [color]="'contrast-fade'" [kbqStyle]="'outline'" [kbqDropdownTriggerFor]="newPipes" kbq-button>
            <i kbq-icon="kbq-plus_16"></i>
            <ng-content />
        </button>

        <kbq-dropdown #newPipes="kbqDropdown">
            @for (pipe of filterBar.pipeTemplates; track pipe) {
                <button (click)="addPipeFromTemplate(pipe)" kbq-dropdown-item>{{ pipe.name }}</button>
            }
        </kbq-dropdown>
    `,
    host: {
        class: 'kbq-pipe-add'
    },
    imports: [
        KbqDropdownModule,
        KbqButtonModule,
        KbqIcon
    ]
})
export class KbqPipeAdd {
    protected readonly filterBar = inject(KbqFilterBar);

    @Output() readonly onAddPipe = new EventEmitter<KbqPipeTemplate>();
    @Input() filterTemplate: KbqFilter = {
        name: '',
        pipes: [],

        readonly: false,
        disabled: false,
        changed: false,
        saved: false
    };

    addPipeFromTemplate(pipe: KbqPipeTemplate) {
        if (!this.filterBar.activeFilter) {
            this.filterBar.activeFilter = { ...this.filterTemplate, pipes: [] };
        }

        this.filterBar.activeFilter.changed = true;
        this.filterBar.activeFilter.pipes.push(pipe);

        this.onAddPipe.next(pipe);
        this.filterBar.onFilterChange.emit(this.filterBar.activeFilter);
    }
}
