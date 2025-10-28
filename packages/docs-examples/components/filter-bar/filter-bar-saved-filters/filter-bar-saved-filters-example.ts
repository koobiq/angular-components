import { ChangeDetectionStrategy, Component, inject, TemplateRef, ViewChild } from '@angular/core';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import {
    KbqFilter,
    KbqFilterBar,
    KbqFilterBarModule,
    KbqPipeTemplate,
    KbqPipeTypes,
    KbqSaveFilterEvent,
    KbqSaveFilterStatuses
} from '@koobiq/components/filter-bar';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqToastData, KbqToastService, KbqToastStyle } from '@koobiq/components/toast';

interface ExampleFilter extends KbqFilter {
    id?: number;
}

/**
 * @title filter-bar-saved-filters
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'filter-bar-saved-filters-example',
    imports: [
        KbqFilterBarModule,
        LuxonDateModule,
        KbqLinkModule
    ],
    template: `
        <kbq-filter-bar [filter]="activeFilter" [pipeTemplates]="pipeTemplates" (filterChange)="onFilterChange($event)">
            <kbq-filters
                [filters]="filters"
                (onSave)="onSaveFilter($event)"
                (onResetFilterChanges)="onResetFilterChanges($event)"
                (onRemoveFilter)="onDeleteFilter($event)"
            />

            @for (pipe of activeFilter?.pipes; track pipe) {
                <ng-container *kbqPipe="pipe" />
            }

            <kbq-pipe-add />

            @if (activeFilter?.name !== defaultFilter?.name || activeFilter?.changed) {
                <kbq-filter-reset (onResetFilter)="onResetFilter()" />
            }

            <kbq-filter-search />
        </kbq-filter-bar>

        <ng-template #toastErrorTitleTemplate let-toast>
            {{ toast.data.text }}
            <span class="kbq-text-normal-strong">{{ toast.data.filter.name }}</span>
        </ng-template>

        <ng-template #errorToastActions let-toast>
            <a kbq-link [pseudo]="true" (click)="toast.close()">Повторить</a>
        </ng-template>
    `
})
export class FilterBarSavedFiltersExample {
    readonly toastService = inject(KbqToastService);

    @ViewChild(KbqFilterBar) filterBar: KbqFilterBar;
    @ViewChild('errorToastActions') errorToastActionsTemplate: TemplateRef<any>;
    @ViewChild('toastErrorTitleTemplate') toastErrorTitleTemplate: TemplateRef<any>;

    filters: ExampleFilter[] = [
        {
            name: 'Saved Filter 1',
            id: 1,
            readonly: false,
            disabled: false,
            changed: true,
            saved: true,
            pipes: [
                {
                    name: 'Datetime',
                    value: {
                        name: 'Последние 7 дней',
                        start: { days: -7 },
                        end: null
                    },
                    type: KbqPipeTypes.Datetime,

                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'Select',
                    value: { name: 'Option 6', id: '6' },
                    type: KbqPipeTypes.Select,

                    cleanable: false,
                    removable: true,
                    disabled: false
                },
                {
                    name: 'Text',
                    value: 'Text: Edited filter with unsaved changes',
                    type: KbqPipeTypes.Text,

                    cleanable: false,
                    removable: true,
                    disabled: false
                }
            ]
        },
        {
            name: 'Saved Filter 2 (save Error)',
            id: 2,
            readonly: false,
            disabled: false,
            changed: false,
            saved: true,
            pipes: [
                {
                    name: 'Datetime',
                    value: {
                        name: 'Последний год',
                        start: { years: -1 },
                        end: null
                    },
                    type: KbqPipeTypes.Datetime,

                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'MultiSelect',
                    value: [
                        { name: 'Option 1', id: '1' },
                        { name: 'Option 3', id: '3' },
                        { name: 'Option 4', id: '4' }
                    ],
                    type: KbqPipeTypes.MultiSelect,

                    cleanable: false,
                    removable: true,
                    disabled: false
                },
                {
                    name: 'Date',
                    value: {
                        name: 'Последние 7 дней',
                        start: { days: -7 },
                        end: null
                    },
                    type: KbqPipeTypes.Date,

                    cleanable: false,
                    removable: true,
                    disabled: false
                }
            ]
        },
        {
            name: 'Saved Filter 3 (delete Error)',
            id: 3,
            readonly: false,
            disabled: false,
            changed: false,
            saved: true,
            pipes: [
                {
                    name: 'Datetime',
                    value: {
                        name: 'Последние 3 дня',
                        start: { days: -3 },
                        end: null
                    },
                    type: KbqPipeTypes.Datetime,

                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'Select',
                    value: { name: 'Option 5', id: '5' },
                    type: KbqPipeTypes.Select,

                    cleanable: false,
                    removable: true,
                    disabled: false
                },
                {
                    name: 'MultiSelect',
                    value: [
                        { name: 'Option 1', id: '1' },
                        { name: 'Option 2', id: '2' }
                    ],
                    type: KbqPipeTypes.MultiSelect,

                    cleanable: false,
                    removable: true,
                    disabled: false
                }
            ]
        }
    ];

    savedFilters: KbqFilter[] = [
        {
            name: 'Saved Filter 1',
            readonly: false,
            disabled: false,
            changed: false,
            saved: true,
            pipes: [
                {
                    name: 'Datetime',
                    value: {
                        name: 'Последние 7 дней',
                        start: { days: -7 },
                        end: null
                    },
                    type: KbqPipeTypes.Datetime,

                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'Select',
                    value: { name: 'Option 3', id: '3' },
                    type: KbqPipeTypes.Select,

                    cleanable: false,
                    removable: true,
                    disabled: false
                },
                {
                    name: 'Text',
                    value: 'Angular Rules',
                    type: KbqPipeTypes.Text,

                    cleanable: false,
                    removable: true,
                    disabled: false
                }
            ]
        },
        structuredClone(this.filters[1]),
        structuredClone(this.filters[2])
    ];

    defaultFilter: KbqFilter | null = this.getDefaultFilter();
    activeFilter: KbqFilter | null = this.filters[0];

    pipeTemplates: KbqPipeTemplate[] = [
        {
            name: 'Date',
            type: KbqPipeTypes.Date,
            values: [
                { name: 'Последний день', start: { days: -1 }, end: null },
                { name: 'Последние 3 дня', start: { days: -3 }, end: null },
                { name: 'Последние 7 дней', start: { days: -7 }, end: null },
                { name: 'Последние 30 дней', start: { days: -30 }, end: null },
                { name: 'Последние 90 дней', start: { days: -90 }, end: null },
                { name: 'Последний год', start: { years: -1 }, end: null }
            ],
            cleanable: false,
            removable: true,
            disabled: false
        },
        {
            name: 'Datetime',
            type: KbqPipeTypes.Datetime,
            values: [
                { name: 'Последний час', start: { hours: -1 }, end: null },
                { name: 'Последние 3 часа', start: { hours: -3 }, end: null },
                { name: 'Последние 24 часа', start: { hours: -24 }, end: null },
                { name: 'Последние 3 дня', start: { days: -3 }, end: null },
                { name: 'Последние 7 дней', start: { days: -7 }, end: null },
                { name: 'Последние 30 дней', start: { days: -30 }, end: null },
                { name: 'Последние 90 дней', start: { days: -90 }, end: null },
                { name: 'Последний год', start: { years: -1 }, end: null }
            ],
            cleanable: false,
            removable: true,
            disabled: false
        },
        {
            name: 'MultiSelect',
            type: KbqPipeTypes.MultiSelect,
            values: [
                { name: 'Option 1', id: '1' },
                { name: 'Option 2', id: '2' },
                { name: 'Option 3', id: '3' },
                { name: 'Option 4', id: '4' },
                { name: 'Option 5', id: '5' },
                { name: 'Option 6', id: '6' },
                { name: 'Option 7', id: '7' }
            ],
            cleanable: false,
            removable: true,
            disabled: false
        },
        {
            name: 'Select',
            type: KbqPipeTypes.Select,
            values: [
                { name: 'Option 1', id: '1' },
                { name: 'Option 2', id: '2' },
                { name: 'Option 3', id: '3' },
                { name: 'Option 4', id: '4' },
                { name: 'Option 5', id: '5' },
                { name: 'Option 6', id: '6' },
                { name: 'Option 7', id: '7' }
            ],

            cleanable: false,
            removable: true,
            disabled: false
        },
        {
            name: 'Text',
            type: KbqPipeTypes.Text,

            cleanable: false,
            removable: true,
            disabled: false
        }
    ];

    onFilterChange(filter: KbqFilter | null) {
        console.log('onFilterChange: ', filter);
    }

    onResetFilter() {
        console.log('onResetFilter');

        this.activeFilter = this.getDefaultFilter();
    }

    onResetFilterChanges(filter: KbqFilter | null) {
        console.log('onResetFilterChanges');

        const defaultFilter = this.getSavedFilter(filter);

        this.filters.splice(
            this.filters.findIndex(({ name }) => name === filter?.name),
            1,
            defaultFilter
        );

        this.activeFilter = defaultFilter;
    }

    onDeleteFilter(filter: ExampleFilter) {
        console.log('onDeleteFilter: ', filter);

        if (filter.id === 3) {
            this.toastService.show({
                style: KbqToastStyle.Error,
                title: this.toastErrorTitleTemplate,
                closeButton: true,
                actions: this.errorToastActionsTemplate,
                text: 'Не удалось удалить фильтр: ',
                filter
            } as KbqToastData);
        } else {
            const currentFilterIndex = this.filters.findIndex(({ name }) => name === filter?.name);

            this.filters.splice(currentFilterIndex, 1);

            this.activeFilter = this.getDefaultFilter();
        }
    }

    onSaveFilter({ filter, filterBar, status }: KbqSaveFilterEvent & { filter: ExampleFilter }) {
        console.log('onSaveFilter: ', filter);

        setTimeout(() => {
            if (filter.id === 2) {
                filterBar.filters.filterSavedUnsuccessfully({ text: `Не удалось сохранить фильтр: ${filter.name}` });
            } else if (status === KbqSaveFilterStatuses.NewFilter) {
                this.saveNewFilter(filter, filterBar);
            } else if (status === KbqSaveFilterStatuses.NewName) {
                this.saveCurrentFilterWithNewName(filter, filterBar);
            } else if (status === KbqSaveFilterStatuses.OnlyChanges) {
                this.saveCurrentFilterWithChangesInPipes(filter, filterBar);
            }
        }, 3000);
    }

    saveNewFilter(filter: KbqFilter, filterBar: KbqFilterBar) {
        // This logic simulates the behavior of the backend
        if (!this.filters.map(({ name }) => name).includes(filter.name)) {
            this.filters.push(filter);

            this.activeFilter = filter;

            filterBar.filters.filterSavedSuccessfully();
        } else {
            filterBar.filters.filterSavedUnsuccessfully({ nameAlreadyExists: true });
        }
    }

    saveCurrentFilterWithNewName(filter: KbqFilter, filterBar: KbqFilterBar) {
        // This logic simulates the behavior of the backend
        if (filterBar.filter?.name !== filter.name) {
            this.filters.splice(
                this.filters.findIndex(({ name }) => name === filterBar.filter?.name),
                1,
                filter!
            );

            this.activeFilter = filter;

            filterBar.filters.filterSavedSuccessfully();
        } else {
            filterBar.filters.filterSavedUnsuccessfully({ nameAlreadyExists: true });
        }
    }

    saveCurrentFilterWithChangesInPipes(filter: KbqFilter, filterBar: KbqFilterBar) {
        // This logic simulates the behavior of the backend
        this.filters.splice(
            this.filters.findIndex(({ name }) => name === filter.name),
            1,
            filter!
        );

        this.activeFilter = filter;

        filterBar.filters.filterSavedSuccessfully();
    }

    getSavedFilter(filter: KbqFilter | null): KbqFilter {
        return structuredClone(this.savedFilters.find(({ name }) => name === filter?.name)!);
    }

    getDefaultFilter(): KbqFilter {
        return {
            name: '',
            readonly: false,
            disabled: false,
            changed: false,
            saved: false,
            pipes: [
                {
                    name: 'Date',
                    value: {
                        name: 'Последний день',
                        start: { days: -1 },
                        end: null
                    },
                    type: KbqPipeTypes.Date,

                    cleanable: false,
                    removable: false,
                    disabled: false,
                    openOnReset: true
                }
            ]
        };
    }
}
