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
            <ng-content>
                <i kbq-icon="kbq-plus_16"></i>
            </ng-content>
        </button>

        <kbq-dropdown #newPipes="kbqDropdown">
            @for (template of filterBar.pipeTemplates; track template) {
                <button (click)="addPipeFromTemplate(template)" kbq-dropdown-item>{{ template.name }}</button>
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

    addPipeFromTemplate(template: KbqPipeTemplate) {
        if (!this.filterBar.activeFilter) {
            this.filterBar.activeFilter = Object.assign({}, this.filterTemplate, { pipes: [] });
        }

        this.filterBar.activeFilter.changed = true;
        this.filterBar.activeFilter.pipes.push(Object.assign({}, template, { values: undefined }));

        this.onAddPipe.next(template);
        this.filterBar.onFilterChange.emit(this.filterBar.activeFilter);
    }
}
