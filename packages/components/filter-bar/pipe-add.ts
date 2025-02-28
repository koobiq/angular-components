import { NgClass } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, ViewChild } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqOption, KbqOptionModule, KbqSelectMatcher } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqSelect, KbqSelectModule } from '@koobiq/components/select';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { KbqFilterBar } from './filter-bar';
import { KbqFilter, KbqPipe, KbqPipeTemplate } from './filter-bar.types';

@Component({
    standalone: true,
    selector: 'kbq-pipe-add',
    template: `
        <kbq-select #select [tabIndex]="-1" [multiple]="true" [value]="addedPipes" [compareWith]="compareWith">
            <button
                [color]="'contrast-fade'"
                [kbqStyle]="'outline'"
                [ngClass]="{ 'kbq-active': select.panelOpen }"
                kbq-button
                kbqTooltip="Добавить фильтр"
                kbq-select-matcher
            >
                <i kbq-icon="kbq-plus_16"></i>
            </button>

            @for (template of filterBar.pipeTemplates; track template) {
                <kbq-option
                    #option
                    [userSelect]="true"
                    [value]="template"
                    [showCheckbox]="false"
                    (click)="addPipeFromTemplate(option)"
                >
                    {{ template.name }}
                </kbq-option>
            }
        </kbq-select>
    `,
    host: {
        class: 'kbq-pipe-add'
    },
    imports: [
        KbqDropdownModule,
        KbqToolTipModule,
        KbqButtonModule,
        KbqIcon,
        KbqOptionModule,
        KbqSelectMatcher,
        KbqSelectModule,
        NgClass
    ]
})
export class KbqPipeAdd {
    protected readonly filterBar = inject(KbqFilterBar);

    @ViewChild(KbqSelect) select: KbqSelect;

    @Output() readonly onAddPipe = new EventEmitter<KbqPipeTemplate>();

    @Input() filterTemplate: KbqFilter = {
        name: '',
        pipes: [],

        readonly: false,
        disabled: false,
        changed: false,
        saved: false
    };

    addedPipes: (string | number)[] = [];

    constructor() {
        this.filterBar.changes.subscribe(() => {
            if (this.filterBar?.filter) {
                this.addedPipes = this.filterBar.filter.pipes.map((pipe: KbqPipe) => pipe.id || pipe.name);
            }
        });
    }

    addPipeFromTemplate(option: KbqOption) {
        if (option.selected) {
            this.filterBar.openPipe.next(option.value.id || option.value.name);
        } else {
            option.select();

            if (!this.filterBar.filter) {
                this.filterBar.filter = structuredClone(this.filterTemplate);
            }

            this.filterBar.filter.changed = true;
            this.filterBar.filter.pipes.push(
                Object.assign({}, option.value, { values: undefined, valueTemplate: undefined, openOnAdd: true })
            );

            this.onAddPipe.next(option.value);
            this.filterBar.filterChange.emit(this.filterBar.filter);
        }

        this.select.close();
    }

    compareWith(o1: KbqPipe, o2: string): boolean {
        return (o1.id || o1.name) === o2;
    }
}
