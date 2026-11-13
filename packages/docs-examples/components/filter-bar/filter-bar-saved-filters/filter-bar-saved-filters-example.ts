import { ChangeDetectionStrategy, Component, inject, TemplateRef, viewChild } from '@angular/core';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { DateFormatter } from '@koobiq/components/core';
import {
    KbqFilter,
    KbqFilterBar,
    KbqFilterBarModule,
    KbqFilterBarNameResolver,
    KbqPipe,
    KbqPipeTemplate,
    KbqPipeTypes,
    KbqSaveFilterEvent,
    KbqSaveFilterStatuses
} from '@koobiq/components/filter-bar';
import { KbqLink } from '@koobiq/components/link';
import { KbqToastData, KbqToastService, KbqToastStyle } from '@koobiq/components/toast';
import { injectLocalizedText } from '../localized-data';

interface ExampleFilter extends KbqFilter {
    id?: number;
}

/** A stable period preset: `nameKey` is translated, `start` is an offset from today. */
interface ExamplePeriod {
    name: string;
    nameKey: string;
    start: Record<string, number>;
    end: null;
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
    imports: [KbqFilterBarModule, LuxonDateModule, KbqLink],
    template: `
        <kbq-filter-bar
            [pipeTemplates]="pipeTemplates"
            [filter]="activeFilter"
            [nameResolver]="nameResolver"
            (filterChange)="onFilterChange($event)"
        >
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
        </kbq-filter-bar>

        <ng-template #toastErrorTitleTemplate let-toast>
            {{ toast.data.text }}
            <span class="kbq-text-normal-strong">{{ toast.data.filter.name }}</span>
        </ng-template>

        <ng-template #errorToastActions let-toast>
            <a kbqLink [pseudo]="true" (click)="toast.close()">{{ text().retry }}</a>
        </ng-template>
    `,
    providers: [DateFormatter],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterBarSavedFiltersExample {
    readonly toastService = inject(KbqToastService);

    readonly errorToastActionsTemplate = viewChild.required<TemplateRef<any>>('errorToastActions');
    readonly toastErrorTitleTemplate = viewChild.required<TemplateRef<any>>('toastErrorTitleTemplate');

    /** Text the example owns: it has no counterpart in the library's locale data. */
    protected readonly text = injectLocalizedText({
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

    /** Translations of the period labels. The period objects below are created once and stay stable. */
    private readonly periodText = injectLocalizedText({
        'ru-RU': {
            'filters.last24h': 'Последние 24 часа',
            'filters.last7days': 'Последние 7 дней',
            'filters.last30days': 'Последние 30 дней',
            'filters.lastYear': 'Последний год'
        },
        default: {
            'filters.last24h': 'Last 24 hours',
            'filters.last7days': 'Last 7 days',
            'filters.last30days': 'Last 30 days',
            'filters.lastYear': 'Last year'
        }
    });

    /** Resolves a period `nameKey`; the `name` stays the stable English fallback. */
    protected readonly nameResolver: KbqFilterBarNameResolver = ({ key, fallback }) =>
        this.periodText()[key] ?? fallback;

    /** Stable periods; the saved-filter data below is never rebuilt for a locale change. */
    private readonly period = (nameKey: string, name: string, start: Record<string, number>): ExamplePeriod => ({
        name,
        nameKey,
        start,
        end: null
    });

    private readonly last24h = this.period('filters.last24h', 'Last 24 hours', { hours: -24 });
    private readonly last7days = this.period('filters.last7days', 'Last 7 days', { days: -7 });
    private readonly last30days = this.period('filters.last30days', 'Last 30 days', { days: -30 });
    private readonly lastYear = this.period('filters.lastYear', 'Last year', { years: -1 });

    /** Built once; nothing is derived from the locale. */
    readonly pipeTemplates: KbqPipeTemplate[] = [
        {
            name: 'Date',
            type: KbqPipeTypes.Date,
            values: [this.last7days, this.last30days],
            cleanable: false,
            removable: true,
            disabled: false
        },
        {
            name: 'Period',
            type: KbqPipeTypes.Datetime,
            values: [this.last24h, this.last7days],
            cleanable: false,
            removable: true,
            disabled: false
        },
        {
            name: 'Tags',
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
            name: 'Status',
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

    filters: ExampleFilter[] = this.createFilters();
    readonly savedFilters: KbqFilter[] = this.createSavedFilters();

    activeFilter: KbqFilter | null = this.createFilters()[0];

    get defaultFilter(): KbqFilter | null {
        return this.getDefaultFilter();
    }

    onFilterChange(filter: KbqFilter | null) {
        // KbqFilterBar flips `changed` to true on any pipe edit but never back to false.
        // Re-derive it by diffing the pipes against the filter's initial (saved/default) state,
        // so reverting the pipes also clears `changed` and hides <kbq-filter-reset>.
        const initialFilter = filter ? this.getInitialFilter(filter) : null;

        this.activeFilter =
            filter && initialFilter && this.arePipesEqual(filter.pipes, initialFilter.pipes)
                ? { ...filter, changed: false }
                : filter;
    }

    onResetFilter() {
        this.activeFilter = this.getDefaultFilter(true);
    }

    onResetFilterChanges(filter: KbqFilter | null) {
        const defaultFilter = this.getSavedFilter(filter);

        this.filters = this.filters.map((item) => (item.name === filter?.name ? defaultFilter : item));

        this.activeFilter = defaultFilter;
    }

    onDeleteFilter(filter: ExampleFilter) {
        if (filter.id === 3) {
            this.toastService.show({
                style: KbqToastStyle.Error,
                title: this.toastErrorTitleTemplate(),
                closeButton: true,
                actions: this.errorToastActionsTemplate(),
                text: this.text().deleteError,
                filter
            } as KbqToastData);
        } else {
            this.filters = this.filters.filter(({ name }) => name !== filter?.name);

            this.activeFilter = this.getDefaultFilter();
        }
    }

    onSaveFilter({ filter, filterBar, status }: KbqSaveFilterEvent & { filter: ExampleFilter }) {
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
        if (!this.filters.some(({ name }) => name === filter.name)) {
            this.filters = [...this.filters, filter];

            this.activeFilter = filter;

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
        if (!this.filters.some(({ name }) => name === currentName)) {
            filterBar.filters()?.filterSavedUnsuccessfully();

            return;
        }

        // Renaming writes the name only: the stored pipes stay as they were saved, so unsaved changes
        // in the bar are not persisted along with the new name.
        this.filters = this.filters.map((item) => (item.name === currentName ? { ...item, name: filter.name } : item));

        this.activeFilter = filter;

        filterBar.filters()?.filterSavedSuccessfully();
    }

    saveCurrentFilterWithChangesInPipes(filter: KbqFilter, filterBar: KbqFilterBar) {
        // This logic simulates the behavior of the backend
        this.filters = this.filters.map((item) => (item.name === filter.name ? filter : item));

        this.activeFilter = filter;

        filterBar.filters()?.filterSavedSuccessfully();
    }

    getSavedFilter(filter: KbqFilter | null): KbqFilter {
        return structuredClone(this.savedFilters.find(({ name }) => name === filter?.name)!);
    }

    /** Pristine (saved or default) version of a filter — the baseline for change detection. */
    getInitialFilter(filter: KbqFilter): KbqFilter | null {
        return filter.name === this.defaultFilter?.name
            ? this.defaultFilter
            : (this.savedFilters.find(({ name }) => name === filter.name) ?? null);
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
                        name: 'Period',
                        value: this.last7days,
                        type: KbqPipeTypes.Datetime,

                        cleanable: false,
                        removable: false,
                        disabled: false
                    },
                    {
                        name: 'Status',
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
                        name: 'Period',
                        value: this.lastYear,
                        type: KbqPipeTypes.Datetime,

                        cleanable: false,
                        removable: false,
                        disabled: false
                    },
                    {
                        name: 'Tags',
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
                        value: this.last7days,
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
                        name: 'Period',
                        value: this.last30days,
                        type: KbqPipeTypes.Datetime,

                        cleanable: false,
                        removable: false,
                        disabled: false
                    },
                    {
                        name: 'Status',
                        value: { name: 'Option 5', id: '5' },
                        type: KbqPipeTypes.Select,

                        cleanable: false,
                        removable: true,
                        disabled: false
                    },
                    {
                        name: 'Tags',
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
    createSavedFilters(): KbqFilter[] {
        const [, saveError, deleteError] = this.createFilters();

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
                        name: 'Period',
                        value: this.last7days,
                        type: KbqPipeTypes.Datetime,

                        cleanable: false,
                        removable: false,
                        disabled: false
                    },
                    {
                        name: 'Status',
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

    /**
     * `openOnReset` is only for the filter the reset itself builds: the bar's reset stream stays latched
     * at `true`, so a pipe re-created for any other reason would replay it and pop its panel open
     * unprompted.
     */
    getDefaultFilter(openOnReset = false): KbqFilter {
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
                    value: this.last24h,
                    type: KbqPipeTypes.Date,

                    cleanable: false,
                    removable: false,
                    disabled: false,
                    openOnReset
                }
            ]
        };
    }
}
