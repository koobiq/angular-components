import { ChangeDetectionStrategy, Component, Provider } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LuxonDateAdapter } from '@koobiq/angular-luxon-adapter/adapter';
import {
    DateAdapter,
    DateFormatter,
    KbqHighlightModule,
    kbqInjectLocaleService,
    kbqLocaleIDProvider,
    kbqLocaleServiceProvider
} from '@koobiq/components/core';
import {
    KbqFilter,
    KbqFilterBarModule,
    KbqFilterBarNameResolver,
    KbqPipeTemplate,
    KbqPipeTypes,
    KbqSelectValue,
    KbqTreeSelectNode
} from '@koobiq/components/filter-bar';
import { KbqSelectModule } from '@koobiq/components/select';
import { injectLocalizedText } from '../localized-data';

/**
 * The date pipe resolves `DateAdapter` and `DateFormatter` through the element injector, so both must be
 * provided next to the locale service. `imports: [LuxonDateModule]` would provide `DateAdapter` in the
 * environment injector instead, where it resolves the application-wide locale service and formats dates —
 * calendar month names included — in a different locale than the rest of the bar. `DateFormatter` is not
 * part of that module at all, so it has to be listed here in either case.
 */
const scopedDateProviders: Provider[] = [{ provide: DateAdapter, useClass: LuxonDateAdapter }, DateFormatter];

/** A period preset as the `date` / `datetime` pipes read it: `start` is an offset from today. */
interface DemoPeriodValue {
    name: string;
    nameKey: string;
    start: Record<string, number>;
    end: null;
}

/**
 * The bar itself, identical in every variant. `KbqFilterBar` is the only component that reads
 * `KBQ_LOCALE_SERVICE` — its sub-components and pipes take their strings from the bar — so whichever
 * ancestor provides the service localizes the whole thing.
 *
 * The data is a different matter: the bar never translates the labels it is handed. Every label below is
 * therefore stable — an English `name` fallback plus a serializable `nameKey` — and the filter and the
 * templates that hold those labels are created once. A locale change only updates the resolver's signal,
 * so the selected values, the filter identity and the open panels stay as they are; nothing is rebuilt and
 * `filter` is never replaced for a translation.
 */
@Component({
    selector: 'localization-demo-bar',
    imports: [KbqFilterBarModule, KbqHighlightModule],
    template: `
        <kbq-filter-bar [pipeTemplates]="pipeTemplates" [nameResolver]="nameResolver" [(filter)]="filter">
            <kbq-filters [filters]="savedFilters" />

            @for (pipe of filter?.pipes; track pipe) {
                <ng-container *kbqPipe="pipe" />
            }

            <kbq-pipe-add />

            <kbq-filter-reset (onResetFilter)="onResetFilter()" />
        </kbq-filter-bar>

        <!-- A tree template receives the source node, so it resolves the name itself through its key. -->
        <ng-template #treeOption let-option="option" let-search="search">
            <span [innerHTML]="resolveKey(option.nameKey, option.name) | kbqHighlightBackground: search"></span>
        </ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LocalizationDemoBar {
    /** Text the example owns: a pipe or option label has no counterpart in the library's locale data. */
    private readonly translations = injectLocalizedText({
        'ru-RU': {
            'filters.period': 'Период',
            'filters.date': 'Дата',
            'filters.status': 'Статус',
            'filters.tags': 'Теги',
            'filters.tree': 'Платформа',
            'filters.multiTree': 'Платформы',
            'filters.active': 'Активен',
            'filters.blocked': 'Заблокирован',
            'filters.alpha': 'Альфа',
            'filters.beta': 'Бета',
            'filters.platform': 'Платформа',
            'filters.web': 'Веб',
            'filters.mobile': 'Мобильные',
            'filters.last24h': 'Последние 24 часа',
            'filters.last7days': 'Последние 7 дней',
            'filters.last30days': 'Последние 30 дней'
        },
        default: {
            'filters.period': 'Period',
            'filters.date': 'Date',
            'filters.status': 'Status',
            'filters.tags': 'Tags',
            'filters.tree': 'Platform',
            'filters.multiTree': 'Platforms',
            'filters.active': 'Active',
            'filters.blocked': 'Blocked',
            'filters.alpha': 'Alpha',
            'filters.beta': 'Beta',
            'filters.platform': 'Platform',
            'filters.web': 'Web',
            'filters.mobile': 'Mobile',
            'filters.last24h': 'Last 24 hours',
            'filters.last7days': 'Last 7 days',
            'filters.last30days': 'Last 30 days'
        }
    });

    /** One resolver for every pipe, option, preset and node label in this bar. */
    protected readonly nameResolver: KbqFilterBarNameResolver = ({ key, fallback }) =>
        this.translations()[key] ?? fallback;

    /** Resolves a stable `nameKey` for a custom template, falling back to the plain name. */
    protected resolveKey(key: string | undefined, fallback: string): string {
        return key ? (this.translations()[key] ?? fallback) : fallback;
    }

    /** Periods of the `date` pipe. The `name` is the stable fallback identity; `nameKey` is translated. */
    private readonly datePresets: DemoPeriodValue[] = [
        this.periodPreset('filters.last7days', 'Last 7 days', { days: -7 }),
        this.periodPreset('filters.last30days', 'Last 30 days', { days: -30 })
    ];

    /** Periods of the `datetime` pipe. */
    private readonly periodPresets: DemoPeriodValue[] = [
        this.periodPreset('filters.last24h', 'Last 24 hours', { hours: -24 }),
        this.periodPreset('filters.last7days', 'Last 7 days', { days: -7 })
    ];

    private readonly statusValues: KbqSelectValue[] = [
        { name: 'Active', nameKey: 'filters.active', id: 'active', value: 'active' },
        { name: 'Blocked', nameKey: 'filters.blocked', id: 'blocked', value: 'blocked' }
    ];

    private readonly tagValues: KbqSelectValue[] = [
        { name: 'Alpha', nameKey: 'filters.alpha', id: 'alpha', value: 'alpha' },
        { name: 'Beta', nameKey: 'filters.beta', id: 'beta', value: 'beta' }
    ];

    private readonly treeValues: KbqTreeSelectNode[] = [
        {
            name: 'Platform',
            nameKey: 'filters.platform',
            value: 'platform',
            children: [
                { name: 'Web', nameKey: 'filters.web', value: 'web', children: null },
                { name: 'Mobile', nameKey: 'filters.mobile', value: 'mobile', children: null }
            ]
        }
    ];

    /** Built once; never rebuilt for a locale. Every label above is stable data. */
    protected readonly pipeTemplates: KbqPipeTemplate[] = [
        {
            name: 'Period',
            nameKey: 'filters.period',
            type: KbqPipeTypes.Datetime,
            values: this.periodPresets,
            cleanable: false,
            removable: false,
            disabled: false
        },
        {
            name: 'Date',
            nameKey: 'filters.date',
            type: KbqPipeTypes.Date,
            values: this.datePresets,
            cleanable: false,
            removable: true,
            disabled: false
        },
        {
            name: 'Status',
            nameKey: 'filters.status',
            type: KbqPipeTypes.Select,
            values: this.statusValues,
            search: true,
            cleanable: false,
            removable: true,
            disabled: false
        },
        {
            name: 'Tags',
            nameKey: 'filters.tags',
            type: KbqPipeTypes.MultiSelect,
            values: this.tagValues,
            search: true,
            cleanable: false,
            removable: true,
            disabled: false
        },
        {
            name: 'Platform',
            nameKey: 'filters.tree',
            type: KbqPipeTypes.TreeSelect,
            values: this.treeValues,
            search: true,
            cleanable: false,
            removable: true,
            disabled: false
        },
        {
            name: 'Platforms',
            nameKey: 'filters.multiTree',
            type: KbqPipeTypes.MultiTreeSelect,
            values: this.treeValues,
            search: true,
            cleanable: false,
            removable: true,
            disabled: false
        }
    ];

    protected readonly savedFilters: KbqFilter[] = [];

    /** Created once. A reset is a user action, not a translation: it may replace the filter. */
    protected filter: KbqFilter | null = this.createFilter();

    protected onResetFilter(): void {
        this.filter = this.createFilter();
    }

    private createFilter(): KbqFilter {
        return {
            name: '',
            readonly: false,
            disabled: false,
            changed: false,
            saved: false,
            pipes: [
                {
                    name: 'Period',
                    nameKey: 'filters.period',
                    type: KbqPipeTypes.Datetime,
                    value: this.periodPresets[0],
                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'Status',
                    nameKey: 'filters.status',
                    type: KbqPipeTypes.Select,
                    value: this.statusValues[0],
                    search: true,
                    cleanable: false,
                    removable: true,
                    disabled: false
                },
                {
                    name: 'Tags',
                    nameKey: 'filters.tags',
                    type: KbqPipeTypes.MultiSelect,
                    value: [this.tagValues[0]],
                    search: true,
                    cleanable: false,
                    removable: true,
                    disabled: false
                },
                {
                    name: 'Platforms',
                    nameKey: 'filters.multiTree',
                    type: KbqPipeTypes.MultiTreeSelect,
                    value: ['web'],
                    search: true,
                    cleanable: false,
                    removable: true,
                    disabled: false
                }
            ]
        };
    }

    private periodPreset(key: string, name: string, start: Record<string, number>): DemoPeriodValue {
        return { name, nameKey: key, start, end: null };
    }
}

/** Without `KBQ_LOCALE_ID` the service falls back to `KBQ_DEFAULT_LOCALE_ID`, which is `ru-RU`. */
@Component({
    selector: 'localization-default-locale',
    imports: [LocalizationDemoBar],
    template: `
        <localization-demo-bar />
    `,
    providers: [kbqLocaleServiceProvider(), ...scopedDateProviders],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LocalizationDefaultLocale {}

/**
 * `kbqLocaleIDProvider` sets the locale once, when the service is constructed. Both providers have to sit
 * in the same `providers` array: `KbqLocaleService` reads `KBQ_LOCALE_ID` from the injector that created
 * it, so providing the id without the service leaves the application-wide service — and its locale — in
 * charge.
 */
@Component({
    selector: 'localization-static-locale',
    imports: [LocalizationDemoBar],
    template: `
        <localization-demo-bar />
    `,
    providers: [kbqLocaleIDProvider('en-US'), kbqLocaleServiceProvider(), ...scopedDateProviders],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LocalizationStaticLocale {}

/** `setLocale()` re-localizes every filter-bar under this component at runtime. */
@Component({
    selector: 'localization-runtime-locale',
    imports: [LocalizationDemoBar, KbqSelectModule, FormsModule],
    template: `
        <div class="layout-column layout-gap-s">
            <kbq-form-field style="max-width: 200px">
                <kbq-select [ngModel]="localeService.localeId()" (ngModelChange)="localeService.setLocale($event)">
                    @for (item of localeService.locales.items; track item.id) {
                        <kbq-option [value]="item.id">{{ item.name }}</kbq-option>
                    }
                </kbq-select>
            </kbq-form-field>

            <localization-demo-bar />
        </div>
    `,
    providers: [kbqLocaleServiceProvider(), ...scopedDateProviders],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LocalizationRuntimeLocale {
    protected readonly localeService = kbqInjectLocaleService();
}

/**
 * @title filter-bar-localization
 */
@Component({
    selector: 'filter-bar-localization-example',
    imports: [LocalizationDefaultLocale, LocalizationStaticLocale, LocalizationRuntimeLocale],
    template: `
        <div class="layout-column layout-gap-3xl">
            <div class="layout-column layout-gap-s">
                <div class="kbq-text-compact-strong">Default locale — KBQ_DEFAULT_LOCALE_ID (ru-RU)</div>
                <localization-default-locale />
            </div>

            <div class="layout-column layout-gap-s">
                <div class="kbq-text-compact-strong">Fixed locale — KBQ_LOCALE_ID ('en-US')</div>
                <localization-static-locale />
            </div>

            <div class="layout-column layout-gap-s">
                <div class="kbq-text-compact-strong">Runtime locale — KbqLocaleService.setLocale()</div>
                <localization-runtime-locale />
            </div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterBarLocalizationExample {}
