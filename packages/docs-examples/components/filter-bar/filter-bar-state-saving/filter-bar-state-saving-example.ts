import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import {
    KbqFilter,
    KbqFilterBar,
    KbqFilterBarModule,
    KbqPipeTemplate,
    KbqPipeTypes
} from '@koobiq/components/filter-bar';

const SELECT_VALUES = [
    { name: 'Option 1', id: '1' },
    { name: 'Option 2', id: '2' },
    { name: 'Option 3', id: '3' }
];

/**
 * @title filter-bar-state-saving
 */
@Component({
    selector: 'filter-bar-state-saving-example',
    imports: [KbqFilterBarModule, KbqButtonModule],
    template: `
        <kbq-filter-bar
            stateSavingKey="filter-bar-state-saving-example"
            [pipeTemplates]="pipeTemplates"
            [(filter)]="activeFilter"
        >
            <kbq-filters [filters]="filters" />

            @for (pipe of activeFilter?.pipes; track pipe) {
                <ng-container *kbqPipe="pipe" />
            }

            <kbq-pipe-add />
        </kbq-filter-bar>

        <div class="example-filter-bar-state-saving__footer">
            <button kbq-button type="button" (click)="filterBar().clearSavedState()">Reset saved state</button>
        </div>
    `,
    styles: `
        .example-filter-bar-state-saving__footer {
            margin-top: var(--kbq-size-l);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterBarStateSavingExample {
    protected readonly filterBar = viewChild.required(KbqFilterBar);

    /**
     * Pick a filter, change a pipe or add one, then reload the page — the selection and the edits come
     * back. What is stored is the filter's name and the values of its pipes, so an application that
     * renames or deletes a saved filter simply gets nothing restored for it.
     */
    protected activeFilter: KbqFilter | null = null;

    protected filters: KbqFilter[] = [
        {
            name: 'Errors',
            readonly: false,
            disabled: false,
            changed: false,
            saved: true,
            pipes: [
                {
                    name: 'Select',
                    type: KbqPipeTypes.Select,
                    value: SELECT_VALUES[0],
                    cleanable: true,
                    removable: true,
                    disabled: false
                }
            ]
        },
        {
            name: 'Everything else',
            readonly: false,
            disabled: false,
            changed: false,
            saved: true,
            pipes: [
                {
                    name: 'Text',
                    type: KbqPipeTypes.Text,
                    value: 'Angular',
                    cleanable: true,
                    removable: true,
                    disabled: false
                }
            ]
        }
    ];

    protected pipeTemplates: KbqPipeTemplate[] = [
        {
            name: 'Select',
            type: KbqPipeTypes.Select,
            values: SELECT_VALUES,
            cleanable: true,
            removable: true,
            disabled: false
        },
        {
            name: 'Text',
            type: KbqPipeTypes.Text,
            cleanable: true,
            removable: true,
            disabled: false
        }
    ];
}
