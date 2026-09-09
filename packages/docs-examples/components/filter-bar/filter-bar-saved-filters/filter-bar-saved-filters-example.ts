import {
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    inject,
    signal,
    TemplateRef,
    ViewChild
} from '@angular/core';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { DateFormatter } from '@koobiq/components/core';
import {
    KbqFilter,
    KbqFilterBar,
    KbqFilterBarModule,
    KbqPipe,
    KbqPipeTemplate,
    KbqPipeTypes,
    KbqSaveFilterEvent,
    KbqSaveFilterStatuses
} from '@koobiq/components/filter-bar';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqToastData, KbqToastService, KbqToastStyle } from '@koobiq/components/toast';
import { injectLocalizedPeriods, injectLocalizedText } from '../localized-data';

interface ExampleFilter extends KbqFilter {
    id?: number;
}

/** Text search is the first pipe in every filter: always present, never removable. */
const createSearchPipe = (name: string): KbqPipe => ({
    name,
    type: KbqPipeTypes.Input,
    value: null,

    cleanable: true,
    removable: false,
    disabled: false
});

/**
 * @title filter-bar-saved-filters
 */
@Component({
    selector: 'filter-bar-saved-filters-example',
    imports: [
        KbqFilterBarModule,
        LuxonDateModule,
        KbqLinkModule
    ],
    template: `
        <kbq-filter-bar
            [pipeTemplates]="pipeTemplates()"
            [filter]="activeFilter()"
            (filterChange)="onFilterChange($event)"
        >
            <kbq-filters
                [filters]="filters()"
                (onSave)="onSaveFilter($event)"
                (onResetFilterChanges)="onResetFilterChanges($event)"
                (onRemoveFilter)="onDeleteFilter($event)"
            />

            @for (pipe of activeFilter()?.pipes; track pipe) {
                <ng-container *kbqPipe="pipe" />
            }

            <kbq-pipe-add />

            @if (activeFilter()?.name !== defaultFilter()?.name || activeFilter()?.changed) {
                <kbq-filter-reset (onResetFilter)="onResetFilter()" />
            }
        </kbq-filter-bar>

        <ng-template #toastErrorTitleTemplate let-toast>
            {{ toast.data.text }}
            <span class="kbq-text-normal-strong">{{ toast.data.filter.name }}</span>
        </ng-template>

        <ng-template #errorToastActions let-toast>
            <a kbq-link [pseudo]="true" (click)="toast.close()">{{ text().retry }}</a>
        </ng-template>
    `,
    providers: [DateFormatter],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterBarSavedFiltersExample {
    readonly toastService = inject(KbqToastService);

    @ViewChild(KbqFilterBar) filterBar: KbqFilterBar;
    @ViewChild('errorToastActions') errorToastActionsTemplate: TemplateRef<any>;
    @ViewChild('toastErrorTitleTemplate') toastErrorTitleTemplate: TemplateRef<any>;

    /** Period labels follow the active locale, so everything built out of them is rebuilt with it. */
    protected readonly periods = injectLocalizedPeriods();

    /** Text the example owns: it has no counterpart in the library's locale data. */
    readonly text = injectLocalizedText({
        'ru-RU': {
            search: 'Поиск',
            retry: 'Повторить',
            deleteError: 'Не удалось удалить фильтр: ',
            saveError: (name: string) => `Не удалось сохранить фильтр: ${name}`
        },
        default: {
            search: 'Search',
            retry: 'Retry',
            deleteError: 'Could not delete the filter: ',
            saveError: (name: string) => `Could not save the filter: ${name}`
        }
    });

    readonly filters = signal<ExampleFilter[]>(this.createFilters());
    readonly savedFilters = signal<KbqFilter[]>(this.createSavedFilters(this.filters()));

    readonly defaultFilter = signal<KbqFilter | null>(this.getDefaultFilter());
    readonly activeFilter = signal<KbqFilter | null>(this.filters()[0]);

    readonly pipeTemplates = computed<KbqPipeTemplate[]>(() => [
        {
            name: 'Date',
            type: KbqPipeTypes.Date,
            values: this.periods.date(),
            cleanable: false,
            removable: true,
            disabled: false
        },
        {
            name: 'Datetime',
            type: KbqPipeTypes.Datetime,
            values: this.periods.datetime(),
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
    ]);

    constructor() {
        // A pipe component is built once from the object it is handed and never re-reads it, so
        // relabelled periods have to arrive as new pipe objects for `*kbqPipe` to rebuild them. The
        // stored filters go with them, or `arePipesEqual` would report a change nobody made.
        effect(() => {
            const filters = this.createFilters();

            this.filters.set(filters);
            this.savedFilters.set(this.createSavedFilters(filters));
            this.defaultFilter.set(this.getDefaultFilter());
            this.activeFilter.set(filters[0]);
        });
    }

    onFilterChange(filter: KbqFilter | null) {
        // KbqFilterBar flips `changed` to true on any pipe edit but never back to false.
        // Re-derive it by diffing the pipes against the filter's initial (saved/default) state,
        // so reverting the pipes also clears `changed` and hides <kbq-filter-reset>.
        const initialFilter = filter ? this.getInitialFilter(filter) : null;

        this.activeFilter.set(
            filter && initialFilter && this.arePipesEqual(filter.pipes, initialFilter.pipes)
                ? { ...filter, changed: false }
                : filter
        );
    }

    onResetFilter() {
        console.log('onResetFilter');

        this.activeFilter.set(this.getDefaultFilter());
    }

    onResetFilterChanges(filter: KbqFilter | null) {
        console.log('onResetFilterChanges');

        const defaultFilter = this.getSavedFilter(filter);

        this.filters.update((filters) => filters.map((item) => (item.name === filter?.name ? defaultFilter : item)));

        this.activeFilter.set(defaultFilter);
    }

    onDeleteFilter(filter: ExampleFilter) {
        console.log('onDeleteFilter: ', filter);

        if (filter.id === 3) {
            this.toastService.show({
                style: KbqToastStyle.Error,
                title: this.toastErrorTitleTemplate,
                closeButton: true,
                actions: this.errorToastActionsTemplate,
                text: this.text().deleteError,
                filter
            } as KbqToastData);
        } else {
            this.filters.update((filters) => filters.filter(({ name }) => name !== filter?.name));

            this.activeFilter.set(this.getDefaultFilter());
        }
    }

    onSaveFilter({ filter, filterBar, status }: KbqSaveFilterEvent & { filter: ExampleFilter }) {
        console.log('onSaveFilter: ', filter);

        setTimeout(() => {
            if (filter.id === 2) {
                filterBar.filters()?.filterSavedUnsuccessfully({ text: this.text().saveError(filter.name) });
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
        if (!this.filters().some(({ name }) => name === filter.name)) {
            this.filters.update((filters) => [...filters, filter]);

            this.activeFilter.set(filter);

            filterBar.filters()?.filterSavedSuccessfully();
        } else {
            filterBar.filters()?.filterSavedUnsuccessfully({ nameAlreadyExists: true });
        }
    }

    saveCurrentFilterWithNewName(filter: KbqFilter, filterBar: KbqFilterBar) {
        // This logic simulates the behavior of the backend
        if (filterBar.filter()?.name === filter.name) {
            filterBar.filters()?.filterSavedUnsuccessfully({ nameAlreadyExists: true });

            return;
        }

        const currentName = filterBar.filter()?.name;

        // A filter the store does not know about cannot be renamed.
        if (!this.filters().some(({ name }) => name === currentName)) {
            filterBar.filters()?.filterSavedUnsuccessfully();

            return;
        }

        // Renaming writes the name only: the stored pipes stay as they were saved, so unsaved changes
        // in the bar are not persisted along with the new name.
        this.filters.update((filters) =>
            filters.map((item) => (item.name === currentName ? { ...item, name: filter.name } : item))
        );

        this.activeFilter.set(filter);

        filterBar.filters()?.filterSavedSuccessfully();
    }

    saveCurrentFilterWithChangesInPipes(filter: KbqFilter, filterBar: KbqFilterBar) {
        // This logic simulates the behavior of the backend
        this.filters.update((filters) => filters.map((item) => (item.name === filter.name ? filter : item)));

        this.activeFilter.set(filter);

        filterBar.filters()?.filterSavedSuccessfully();
    }

    getSavedFilter(filter: KbqFilter | null): KbqFilter {
        return structuredClone(this.savedFilters().find(({ name }) => name === filter?.name)!);
    }

    /** Pristine (saved or default) version of a filter — the baseline for change detection. */
    getInitialFilter(filter: KbqFilter): KbqFilter | null {
        return filter.name === this.defaultFilter()?.name
            ? this.defaultFilter()
            : (this.savedFilters().find(({ name }) => name === filter.name) ?? null);
    }

    /** Whether two pipe lists are equivalent (same name/type/value) — detects a return to the initial state. */
    arePipesEqual(a: KbqPipe[], b: KbqPipe[]): boolean {
        const serialize = (pipes: KbqPipe[]): string =>
            JSON.stringify(pipes.map(({ name, type, value }) => ({ name, type, value })));

        return serialize(a) === serialize(b);
    }

    createFilters(): ExampleFilter[] {
        return [
            {
                name: 'Saved Filter 1',
                id: 1,
                readonly: false,
                disabled: false,
                changed: true,
                saved: true,
                pipes: [
                    createSearchPipe(this.text().search),
                    {
                        name: 'Datetime',
                        value: this.periods.pick(this.periods.datetime(), { unit: 'days', amount: -7 }),
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
                    createSearchPipe(this.text().search),
                    {
                        name: 'Datetime',
                        value: this.periods.pick(this.periods.datetime(), { unit: 'years', amount: -1 }),
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
                        value: this.periods.pick(this.periods.date(), { unit: 'days', amount: -7 }),
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
                    createSearchPipe(this.text().search),
                    {
                        name: 'Datetime',
                        value: this.periods.pick(this.periods.datetime(), { unit: 'days', amount: -3 }),
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
    }

    /**
     * The pristine versions the store holds. "Saved Filter 1" deliberately differs from the filter of
     * the same name above, so the bar starts with unsaved changes to demonstrate.
     */
    createSavedFilters([, saveError, deleteError]: ExampleFilter[]): KbqFilter[] {
        return [
            {
                name: 'Saved Filter 1',
                readonly: false,
                disabled: false,
                changed: false,
                saved: true,
                pipes: [
                    createSearchPipe(this.text().search),
                    {
                        name: 'Datetime',
                        value: this.periods.pick(this.periods.datetime(), { unit: 'days', amount: -7 }),
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
            structuredClone(saveError),
            structuredClone(deleteError)
        ];
    }

    getDefaultFilter(): KbqFilter {
        return {
            name: '',
            readonly: false,
            disabled: false,
            changed: false,
            saved: false,
            pipes: [
                createSearchPipe(this.text().search),
                {
                    name: 'Date',
                    value: this.periods.pick(this.periods.date(), { unit: 'days', amount: -1 }),
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
