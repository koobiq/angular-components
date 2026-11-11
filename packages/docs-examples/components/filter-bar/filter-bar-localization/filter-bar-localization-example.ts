import { ChangeDetectionStrategy, Component, computed, Provider, Signal, TemplateRef, viewChild } from '@angular/core';
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
    KbqMultiTreeSelectValueTemplateContext,
    KbqPipeTemplate,
    KbqPipeTypes,
    kbqResolveFilterBarName,
    KbqSelectValue,
    KbqTreeSelectNode
} from '@koobiq/components/filter-bar';
import { KbqSelectModule } from '@koobiq/components/select';
import { ExamplePeriod, ExamplePeriodValue, injectLocalizedPeriods, injectLocalizedText } from '../localized-data';

/** A period preset as the `date` / `datetime` pipes read it: `start` is an offset from today. */
interface DemoPeriodValue {
    id: string;
    name: Signal<string>;
    start: Record<string, number>;
    end: null;
}

/**
 * The date pipe resolves `DateAdapter` and `DateFormatter` through the element injector, so both must be
 * provided next to the locale service. `imports: [LuxonDateModule]` would provide `DateAdapter` in the
 * environment injector instead, where it resolves the application-wide locale service and formats dates —
 * calendar month names included — in a different locale than the rest of the bar. `DateFormatter` is not
 * part of that module at all, so it has to be listed here in either case.
 */
const scopedDateProviders: Provider[] = [{ provide: DateAdapter, useClass: LuxonDateAdapter }, DateFormatter];

/**
 * The bar itself, identical in every variant. `KbqFilterBar` is the only component that reads
 * `KBQ_LOCALE_SERVICE` — its sub-components and pipes take their strings from the bar — so whichever
 * ancestor provides the service localizes the whole thing.
 *
 * The data is a different matter: the bar never translates the labels it is handed. Every label below is
 * therefore a signal, and the filter and the templates that hold those signals are created once. A locale
 * change only updates the signals, so the selected values, the filter identity and the open panels stay as
 * they are; nothing is rebuilt and `filter.set` is never called for a translation.
 */
@Component({
    selector: 'localization-demo-bar',
    imports: [KbqFilterBarModule, KbqHighlightModule],
    template: `
        <kbq-filter-bar [pipeTemplates]="pipeTemplates()" [(filter)]="filter">
            <kbq-filters [filters]="savedFilters" />

            @for (pipe of filter?.pipes; track pipe) {
                <ng-container *kbqPipe="pipe" />
            }

            <kbq-pipe-add />

            <kbq-filter-reset (onResetFilter)="onResetFilter()" />
        </kbq-filter-bar>

        <!-- A tree template receives the source node, so it resolves the name itself through the public helper. -->
        <ng-template #treeOption let-option="option" let-search="search">
            <span [innerHTML]="resolveName(option.name) | kbqHighlightBackground: search"></span>
        </ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LocalizationDemoBar {
    private readonly periods = injectLocalizedPeriods();

    /** Text the example owns: a pipe or option label has no counterpart in the library's locale data. */
    private readonly text = injectLocalizedText({
        'ru-RU': {
            date: 'Дата',
            period: 'Период',
            status: 'Статус',
            tags: 'Теги',
            tree: 'Платформа',
            multiTree: 'Платформы',
            active: 'Активен',
            blocked: 'Заблокирован',
            alpha: 'Альфа',
            beta: 'Бета',
            platform: 'Платформа',
            web: 'Веб',
            mobile: 'Мобильные',
            database: 'База данных'
        },
        default: {
            date: 'Date',
            period: 'Period',
            status: 'Status',
            tags: 'Tags',
            tree: 'Platform',
            multiTree: 'Platforms',
            active: 'Active',
            blocked: 'Blocked',
            alpha: 'Alpha',
            beta: 'Beta',
            platform: 'Platform',
            web: 'Web',
            mobile: 'Mobile',
            database: 'Database'
        }
    });

    /** One signal per label. The templates below keep these signals instead of the text they hold now. */
    private readonly labels = {
        date: computed(() => this.text().date),
        period: computed(() => this.text().period),
        status: computed(() => this.text().status),
        tags: computed(() => this.text().tags),
        tree: computed(() => this.text().tree),
        multiTree: computed(() => this.text().multiTree),
        active: computed(() => this.text().active),
        blocked: computed(() => this.text().blocked),
        alpha: computed(() => this.text().alpha),
        beta: computed(() => this.text().beta),
        platform: computed(() => this.text().platform),
        web: computed(() => this.text().web),
        mobile: computed(() => this.text().mobile),
        database: computed(() => this.text().database)
    };

    /** Periods of the `date` pipe. The ids identify a preset; the labels are translated. */
    private readonly datePresets: DemoPeriodValue[] = [
        this.periodPreset(this.periods.date, 'last-7-days', { unit: 'days', amount: -7 }),
        this.periodPreset(this.periods.date, 'last-30-days', { unit: 'days', amount: -30 })
    ];

    /** Periods of the `datetime` pipe. The ids identify a preset; the labels are translated. */
    private readonly periodPresets: DemoPeriodValue[] = [
        this.periodPreset(this.periods.datetime, 'last-24-hours', { unit: 'hours', amount: -24 }),
        this.periodPreset(this.periods.datetime, 'last-7-days', { unit: 'days', amount: -7 }),
        this.periodPreset(this.periods.datetime, 'last-30-days', { unit: 'days', amount: -30 })
    ];

    private readonly statusValues: KbqSelectValue[] = [
        { id: 'active', name: this.labels.active, value: 'active' },
        { id: 'blocked', name: this.labels.blocked, value: 'blocked' }
    ];

    private readonly tagValues: KbqSelectValue[] = [
        { id: 'alpha', name: this.labels.alpha, value: 'alpha' },
        { id: 'beta', name: this.labels.beta, value: 'beta' }
    ];

    private readonly treeValues: KbqTreeSelectNode[] = [
        {
            name: this.labels.platform,
            value: 'platform',
            children: [
                { name: this.labels.web, value: 'web', children: null },
                { name: this.labels.mobile, value: 'mobile', children: null }
            ]
        },
        { name: this.labels.database, value: 'database', children: null }
    ];

    /** Custom tree templates are the only content the bar cannot resolve on its own. */
    private readonly treeOptionTemplate = viewChild<TemplateRef<KbqMultiTreeSelectValueTemplateContext>>('treeOption');

    /**
     * Built once and never rebuilt for a locale: every label inside is a signal, and only the view query
     * that supplies the tree template can add an emission here. The bar re-renders the labels in place.
     */
    protected readonly pipeTemplates = computed<KbqPipeTemplate[]>(() => [
        {
            name: this.labels.date,
            id: 'date',
            type: KbqPipeTypes.Date,
            values: this.datePresets,
            cleanable: false,
            removable: true,
            disabled: false
        },
        {
            name: this.labels.period,
            id: 'period',
            type: KbqPipeTypes.Datetime,
            values: this.periodPresets,
            cleanable: false,
            removable: false,
            disabled: false
        },
        {
            name: this.labels.status,
            id: 'status',
            type: KbqPipeTypes.Select,
            values: this.statusValues,
            search: true,
            cleanable: false,
            removable: true,
            disabled: false
        },
        {
            name: this.labels.tags,
            id: 'tags',
            type: KbqPipeTypes.MultiSelect,
            values: this.tagValues,
            search: true,
            cleanable: false,
            removable: true,
            disabled: false
        },
        {
            name: this.labels.tree,
            id: 'tree',
            type: KbqPipeTypes.TreeSelect,
            values: this.treeValues,
            valueTemplate: this.treeOptionTemplate(),
            search: true,
            cleanable: false,
            removable: true,
            disabled: false
        },
        {
            name: this.labels.multiTree,
            id: 'multi-tree',
            type: KbqPipeTypes.MultiTreeSelect,
            values: this.treeValues,
            search: true,
            cleanable: false,
            removable: true,
            disabled: false
        }
    ]);

    /** Resolves a `KbqFilterBarName`; a custom tree template needs it because a signal is not text. */
    protected readonly resolveName = kbqResolveFilterBarName;

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
                    name: this.labels.date,
                    id: 'date',
                    type: KbqPipeTypes.Date,
                    value: this.datePresets[0],
                    cleanable: false,
                    removable: true,
                    disabled: false
                },
                {
                    name: this.labels.period,
                    id: 'period',
                    type: KbqPipeTypes.Datetime,
                    value: this.periodPresets[0],
                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: this.labels.status,
                    id: 'status',
                    type: KbqPipeTypes.Select,
                    value: this.statusValues[0],
                    search: true,
                    cleanable: false,
                    removable: true,
                    disabled: false
                },
                {
                    name: this.labels.tags,
                    id: 'tags',
                    type: KbqPipeTypes.MultiSelect,
                    value: this.tagValues,
                    search: true,
                    cleanable: false,
                    removable: true,
                    disabled: false
                },
                {
                    name: this.labels.tree,
                    id: 'tree',
                    type: KbqPipeTypes.TreeSelect,
                    value: 'web',
                    search: true,
                    cleanable: false,
                    removable: true,
                    disabled: false
                },
                {
                    name: this.labels.multiTree,
                    id: 'multi-tree',
                    type: KbqPipeTypes.MultiTreeSelect,
                    value: ['mobile'],
                    search: true,
                    cleanable: false,
                    removable: true,
                    disabled: false
                }
            ]
        };
    }

    /** A period of the shared localized list, with a stable id and that list's label as a signal. */
    private periodPreset(list: Signal<ExamplePeriodValue[]>, id: string, period: ExamplePeriod): DemoPeriodValue {
        const name = computed(() => list().find((value) => value.start[period.unit] === period.amount)?.name ?? '');

        return { id, name, start: { [period.unit]: period.amount }, end: null };
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
