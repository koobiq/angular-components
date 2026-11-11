import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    signal,
    Signal,
    TemplateRef,
    viewChild
} from '@angular/core';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { DateFormatter } from '@koobiq/components/core';
import {
    KbqFilter,
    KbqFilterBar,
    KbqFilterBarModule,
    KbqFilterBarName,
    kbqFilterBarToSerializableFilter,
    KbqPipe,
    KbqPipeTemplate,
    KbqPipeTypes,
    kbqResolveFilterBarName,
    KbqSaveFilterEvent,
    KbqSaveFilterStatuses,
    KbqSelectValue
} from '@koobiq/components/filter-bar';
import { KbqLink } from '@koobiq/components/link';
import { KbqToastData, KbqToastService, KbqToastStyle } from '@koobiq/components/toast';
import { ExamplePeriod, ExamplePeriodValue, injectLocalizedPeriods, injectLocalizedText } from '../localized-data';

interface ExampleFilter extends KbqFilter {
    id?: number;
}

/** A period preset as the `date` / `datetime` pipes read it: `start` is an offset from today. */
interface ExamplePeriodValueWithId {
    id: string;
    name: Signal<string>;
    start: Record<string, number>;
    end: null;
}

/** Text search is the first pipe in every filter: always present, never removable. */
const createSearchPipe = (name: KbqFilterBarName): KbqPipe => ({
    name,
    // A signal-backed name needs a stable id: it is what the bar matches pipes by.
    id: 'search',
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
        KbqLink
    ],
    template: `
        <kbq-filter-bar [pipeTemplates]="pipeTemplates" [filter]="activeFilter" (filterChange)="onFilterChange($event)">
            <kbq-filters
                [filters]="filters()"
                (onSave)="onSaveFilter($event)"
                (onResetFilterChanges)="onResetFilterChanges($event)"
                (onRemoveFilter)="onDeleteFilter($event)"
            />

            @for (pipe of activeFilter?.pipes; track pipe) {
                <ng-container *kbqPipe="pipe" />
            }

            <kbq-pipe-add />

            @if (activeFilter?.name !== defaultFilter.name || activeFilter?.changed) {
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

    /** Period labels follow the active locale, so they are handed to the filters as signals. */
    protected readonly periods = injectLocalizedPeriods();

    /** Text the example owns: it has no counterpart in the library's locale data. */
    protected readonly text = injectLocalizedText({
        'ru-RU': {
            search: 'Поиск',
            option: 'Опция',
            retry: 'Повторить',
            deleteError: 'Не удалось удалить фильтр: ',
            saveError: (name: string) => `Не удалось сохранить фильтр: ${name}`
        },
        default: {
            search: 'Search',
            option: 'Option',
            retry: 'Retry',
            deleteError: 'Could not delete the filter: ',
            saveError: (name: string) => `Could not save the filter: ${name}`
        }
    });

    /** One signal per option name: `Option 1` … `Option 7`, with the word following the locale. */
    private readonly optionValues: KbqSelectValue[] = Array.from({ length: 7 }, (_, index) => ({
        id: `${index + 1}`,
        name: computed(() => `${this.text().option} ${index + 1}`),
        value: `option${index + 1}`
    }));

    private readonly dateValues: ExamplePeriodValueWithId[] = [
        this.periodPreset(this.periods.date, 'last-day', { unit: 'days', amount: -1 }),
        this.periodPreset(this.periods.date, 'last-3-days', { unit: 'days', amount: -3 }),
        this.periodPreset(this.periods.date, 'last-7-days', { unit: 'days', amount: -7 }),
        this.periodPreset(this.periods.date, 'last-30-days', { unit: 'days', amount: -30 }),
        this.periodPreset(this.periods.date, 'last-90-days', { unit: 'days', amount: -90 }),
        this.periodPreset(this.periods.date, 'last-year', { unit: 'years', amount: -1 })
    ];

    private readonly datetimeValues: ExamplePeriodValueWithId[] = [
        this.periodPreset(this.periods.datetime, 'last-hour', { unit: 'hours', amount: -1 }),
        this.periodPreset(this.periods.datetime, 'last-3-hours', { unit: 'hours', amount: -3 }),
        this.periodPreset(this.periods.datetime, 'last-24-hours', { unit: 'hours', amount: -24 }),
        this.periodPreset(this.periods.datetime, 'last-3-days', { unit: 'days', amount: -3 }),
        this.periodPreset(this.periods.datetime, 'last-7-days', { unit: 'days', amount: -7 }),
        this.periodPreset(this.periods.datetime, 'last-30-days', { unit: 'days', amount: -30 }),
        this.periodPreset(this.periods.datetime, 'last-90-days', { unit: 'days', amount: -90 }),
        this.periodPreset(this.periods.datetime, 'last-year', { unit: 'years', amount: -1 })
    ];

    /** Built once: every label inside is a signal, so a locale change never rebuilds the list. */
    readonly pipeTemplates: KbqPipeTemplate[] = [
        {
            name: 'Date',
            id: 'date',
            type: KbqPipeTypes.Date,
            values: this.dateValues,
            cleanable: false,
            removable: true,
            disabled: false
        },
        {
            name: 'Datetime',
            id: 'datetime',
            type: KbqPipeTypes.Datetime,
            values: this.datetimeValues,
            cleanable: false,
            removable: true,
            disabled: false
        },
        {
            name: 'MultiSelect',
            id: 'multiselect',
            type: KbqPipeTypes.MultiSelect,
            values: this.optionValues,
            cleanable: false,
            removable: true,
            disabled: false
        },
        {
            name: 'Select',
            id: 'select',
            type: KbqPipeTypes.Select,
            values: this.optionValues,
            cleanable: false,
            removable: true,
            disabled: false
        },
        {
            name: 'Text',
            id: 'text',
            type: KbqPipeTypes.Text,
            cleanable: false,
            removable: true,
            disabled: false
        }
    ];

    /** The filters the bar starts with, created once. Only the labels inside them follow the locale. */
    private readonly liveFilters = this.createFilters();

    /**
     * What the example's "backend" holds: the same filters as the plain data an application persists.
     * `kbqFilterBarToSerializableFilter` resolves the signal names to the labels of the save time, so the
     * copies survive `structuredClone` (and `JSON.stringify`) — cloning the live filters would throw.
     */
    readonly filters = signal<ExampleFilter[]>(this.liveFilters.map((filter) => this.persistFilter(filter)));

    /** Pristine versions with their labels still as signals — the reset baseline and the change check. */
    private readonly savedFilters = this.createSavedFilters(this.liveFilters);

    /** Pristine default filter, created once; a reset is a user action, not a translation. */
    readonly defaultFilter: KbqFilter = this.getDefaultFilter();

    activeFilter: KbqFilter | null = this.liveFilters[0];

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
        console.log('onResetFilter');

        this.activeFilter = this.getDefaultFilter(true);
    }

    onResetFilterChanges(filter: KbqFilter | null) {
        console.log('onResetFilterChanges');

        const defaultFilter = this.getSavedFilter(filter);

        this.filters.update((filters) =>
            filters.map((item) => (item.name === filter?.name ? this.persistFilter(defaultFilter) : item))
        );

        this.activeFilter = defaultFilter;
    }

    onDeleteFilter(filter: ExampleFilter) {
        console.log('onDeleteFilter: ', filter);

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
            this.filters.update((filters) => filters.filter(({ name }) => name !== filter?.name));

            this.activeFilter = this.getDefaultFilter();
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
            this.filters.update((filters) => [...filters, this.persistFilter(filter)]);

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
        if (!this.filters().some(({ name }) => name === currentName)) {
            filterBar.filters()?.filterSavedUnsuccessfully();

            return;
        }

        // Renaming writes the name only: the stored pipes stay as they were saved, so unsaved changes
        // in the bar are not persisted along with the new name.
        this.filters.update((filters) =>
            filters.map((item) => (item.name === currentName ? { ...item, name: filter.name } : item))
        );

        this.activeFilter = filter;

        filterBar.filters()?.filterSavedSuccessfully();
    }

    saveCurrentFilterWithChangesInPipes(filter: KbqFilter, filterBar: KbqFilterBar) {
        // This logic simulates the behavior of the backend
        this.filters.update((filters) =>
            filters.map((item) => (item.name === filter.name ? this.persistFilter(filter) : item))
        );

        this.activeFilter = filter;

        filterBar.filters()?.filterSavedSuccessfully();
    }

    getSavedFilter(filter: KbqFilter | null): KbqFilter {
        return this.copyFilter(this.savedFilters.find(({ name }) => name === filter?.name)!);
    }

    /** Pristine (saved or default) version of a filter — the baseline for change detection. */
    getInitialFilter(filter: KbqFilter): KbqFilter | null {
        return filter.name === this.defaultFilter.name
            ? this.defaultFilter
            : (this.savedFilters.find(({ name }) => name === filter.name) ?? null);
    }

    /** Whether two pipe lists are equivalent (same name/type/value) — detects a return to the initial state. */
    arePipesEqual(a: KbqPipe[], b: KbqPipe[]): boolean {
        const serialize = (pipes: KbqPipe[]): string =>
            JSON.stringify(
                pipes.map(({ name, type, value }) => ({ name: kbqResolveFilterBarName(name), type, value }))
            );

        return serialize(a) === serialize(b);
    }

    createFilters(): ExampleFilter[] {
        const search = computed(() => this.text().search);

        return [
            {
                name: 'Saved Filter 1',
                id: 1,
                readonly: false,
                disabled: false,
                changed: true,
                saved: true,
                pipes: [
                    createSearchPipe(search),
                    {
                        name: 'Datetime',
                        id: 'datetime',
                        value: this.datetimeValues[4],
                        type: KbqPipeTypes.Datetime,

                        cleanable: false,
                        removable: false,
                        disabled: false
                    },
                    {
                        name: 'Select',
                        id: 'select',
                        value: this.optionValues[5],
                        type: KbqPipeTypes.Select,

                        cleanable: false,
                        removable: true,
                        disabled: false
                    },
                    {
                        name: 'Text',
                        id: 'text',
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
                    createSearchPipe(search),
                    {
                        name: 'Datetime',
                        id: 'datetime',
                        value: this.datetimeValues[7],
                        type: KbqPipeTypes.Datetime,

                        cleanable: false,
                        removable: false,
                        disabled: false
                    },
                    {
                        name: 'MultiSelect',
                        id: 'multiselect',
                        value: [this.optionValues[0], this.optionValues[2], this.optionValues[3]],
                        type: KbqPipeTypes.MultiSelect,

                        cleanable: false,
                        removable: true,
                        disabled: false
                    },
                    {
                        name: 'Date',
                        id: 'date',
                        value: this.dateValues[2],
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
                    createSearchPipe(search),
                    {
                        name: 'Datetime',
                        id: 'datetime',
                        value: this.datetimeValues[3],
                        type: KbqPipeTypes.Datetime,

                        cleanable: false,
                        removable: false,
                        disabled: false
                    },
                    {
                        name: 'Select',
                        id: 'select',
                        value: this.optionValues[4],
                        type: KbqPipeTypes.Select,

                        cleanable: false,
                        removable: true,
                        disabled: false
                    },
                    {
                        name: 'MultiSelect',
                        id: 'multiselect',
                        value: [this.optionValues[0], this.optionValues[1]],
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
    createSavedFilters(filters: ExampleFilter[]): KbqFilter[] {
        const search = computed(() => this.text().search);
        const [, saveError, deleteError] = filters;

        return [
            {
                name: 'Saved Filter 1',
                readonly: false,
                disabled: false,
                changed: false,
                saved: true,
                pipes: [
                    createSearchPipe(search),
                    {
                        name: 'Datetime',
                        id: 'datetime',
                        value: this.datetimeValues[4],
                        type: KbqPipeTypes.Datetime,

                        cleanable: false,
                        removable: false,
                        disabled: false
                    },
                    {
                        name: 'Select',
                        id: 'select',
                        value: this.optionValues[2],
                        type: KbqPipeTypes.Select,

                        cleanable: false,
                        removable: true,
                        disabled: false
                    },
                    {
                        name: 'Text',
                        id: 'text',
                        value: 'Angular Rules',
                        type: KbqPipeTypes.Text,

                        cleanable: false,
                        removable: true,
                        disabled: false
                    }
                ]
            },
            this.copyFilter(saveError),
            this.copyFilter(deleteError)
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
                createSearchPipe(computed(() => this.text().search)),
                {
                    name: 'Date',
                    id: 'date',
                    value: this.dateValues[0],
                    type: KbqPipeTypes.Date,

                    cleanable: false,
                    removable: false,
                    disabled: false,
                    openOnReset
                }
            ]
        };
    }

    /**
     * The filter as the application persists it: `kbqFilterBarToSerializableFilter` resolves every
     * signal-backed `name` into the label of the moment, and the copy is then plain data. Calling
     * `structuredClone` on the live filter instead would throw, because a signal is a function.
     */
    private persistFilter(filter: KbqFilter): ExampleFilter {
        return structuredClone(kbqFilterBarToSerializableFilter(filter));
    }

    /** A structural copy that keeps every label signal by reference — the snapshots to compare against. */
    private copyFilter(filter: KbqFilter): KbqFilter {
        return { ...filter, pipes: filter.pipes.map((pipe) => ({ ...pipe })) };
    }

    /** A period of the shared localized list, with a stable id and that list's label as a signal. */
    private periodPreset(
        list: Signal<ExamplePeriodValue[]>,
        id: string,
        period: ExamplePeriod
    ): ExamplePeriodValueWithId {
        const name = computed(() => list().find((value) => value.start[period.unit] === period.amount)?.name ?? '');

        return { id, name, start: { [period.unit]: period.amount }, end: null };
    }
}
