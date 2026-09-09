import { ChangeDetectionStrategy, Component, computed, effect, signal } from '@angular/core';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { DateFormatter } from '@koobiq/components/core';
import { KbqFilter, KbqFilterBarModule, KbqPipe, KbqPipeTemplate, KbqPipeTypes } from '@koobiq/components/filter-bar';
import { injectLocalizedPeriods } from '../localized-data';

/**
 * @title filter-bar-required
 */
@Component({
    selector: 'filter-bar-required-example',
    imports: [
        KbqFilterBarModule,
        LuxonDateModule
    ],
    template: `
        <kbq-filter-bar
            [pipeTemplates]="pipeTemplates()"
            [filter]="activeFilter()"
            (filterChange)="onFilterChange($event)"
        >
            @for (pipe of activeFilter()?.pipes; track pipe) {
                <ng-container *kbqPipe="pipe" />
            }

            <kbq-pipe-add />

            @if (activeFilter()?.name !== defaultFilter()?.name || activeFilter()?.changed) {
                <kbq-filter-reset (onResetFilter)="onReset()" />
            }
        </kbq-filter-bar>
    `,
    providers: [DateFormatter],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterBarRequiredExample {
    /** Period labels follow the active locale, so everything built out of them is rebuilt with it. */
    protected readonly periods = injectLocalizedPeriods();

    readonly activeFilter = signal<KbqFilter | null>(this.getDefaultFilter());
    readonly defaultFilter = signal<KbqFilter | null>(this.getDefaultFilter());

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
        // A pipe component is built once from the object it is handed and never re-reads it, so a
        // relabelled period has to arrive as a new pipe object for `*kbqPipe` to rebuild it. Both
        // filters are rebuilt together, or `arePipesEqual` would report a change nobody made.
        effect(() => {
            this.defaultFilter.set(this.getDefaultFilter());
            this.activeFilter.set(this.getDefaultFilter());
        });
    }

    onFilterChange(filter: KbqFilter | null) {
        // KbqFilterBar flips `changed` to true on any pipe edit but never back to false.
        // Re-derive it by diffing the pipes against the default state, so reverting the pipes
        // also clears `changed` and hides <kbq-filter-reset>.
        const defaultFilter = this.defaultFilter();

        this.activeFilter.set(
            filter && defaultFilter && this.arePipesEqual(filter.pipes, defaultFilter.pipes)
                ? { ...filter, changed: false }
                : filter
        );
    }

    onReset() {
        this.activeFilter.set(this.getDefaultFilter());
    }

    /** Whether two pipe lists are equivalent (same name/type/value) — detects a return to the initial state. */
    arePipesEqual(a: KbqPipe[], b: KbqPipe[]): boolean {
        const serialize = (pipes: KbqPipe[]): string =>
            JSON.stringify(pipes.map(({ name, type, value }) => ({ name, type, value })));

        return serialize(a) === serialize(b);
    }

    getDefaultFilter(): KbqFilter {
        return {
            name: 'Select',
            readonly: false,
            disabled: false,
            changed: false,
            saved: false,
            pipes: [
                {
                    name: 'Datetime',
                    type: KbqPipeTypes.Datetime,
                    value: this.periods.pick(this.periods.datetime(), { unit: 'hours', amount: -24 }),

                    cleanable: false,
                    removable: false,
                    disabled: false,
                    openOnReset: true
                }
            ]
        };
    }
}
