import { ChangeDetectionStrategy, Component, computed, effect, Provider, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LuxonDateAdapter } from '@koobiq/angular-luxon-adapter/adapter';
import {
    DateAdapter,
    DateFormatter,
    kbqInjectLocaleService,
    kbqLocaleIDProvider,
    kbqLocaleServiceProvider
} from '@koobiq/components/core';
import { KbqFilter, KbqFilterBarModule, KbqPipeTemplate, KbqPipeTypes } from '@koobiq/components/filter-bar';
import { KbqSelectModule } from '@koobiq/components/select';
import { injectLocalizedPeriods } from '../localized-data';

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
 * The data is a different matter: the bar never translates what it is handed, so the period labels are
 * built here out of the active locale, and every variant below gets its own instance of them.
 */
@Component({
    selector: 'localization-demo-bar',
    imports: [KbqFilterBarModule],
    template: `
        <kbq-filter-bar [pipeTemplates]="pipeTemplates()" [(filter)]="filter">
            <kbq-filters [filters]="savedFilters" />

            @for (pipe of filter().pipes; track pipe) {
                <ng-container *kbqPipe="pipe" />
            }

            <kbq-pipe-add />

            <kbq-filter-reset (onResetFilter)="onResetFilter()" />
        </kbq-filter-bar>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LocalizationDemoBar {
    private readonly periods = injectLocalizedPeriods();

    protected readonly savedFilters: KbqFilter[] = [];

    protected readonly filter = signal<KbqFilter>(this.createFilter());

    protected readonly pipeTemplates = computed<KbqPipeTemplate[]>(() => [
        {
            name: 'Period',
            type: KbqPipeTypes.Datetime,
            values: this.periods.datetime(),
            cleanable: false,
            removable: false,
            disabled: false
        },
        {
            name: 'Status',
            type: KbqPipeTypes.Select,
            values: [
                { name: 'Option 1', id: '1' },
                { name: 'Option 2', id: '2' },
                { name: 'Option 3', id: '3' }
            ],
            cleanable: false,
            removable: true,
            disabled: false
        },
        {
            name: 'Tags',
            type: KbqPipeTypes.MultiSelect,
            selectAll: true,
            values: [
                { name: 'Option 1', id: '1' },
                { name: 'Option 2', id: '2' },
                { name: 'Option 3', id: '3' }
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
        // relabelled period has to arrive as a new pipe object for `*kbqPipe` to rebuild it.
        effect(() => this.filter.set(this.createFilter()));
    }

    protected onResetFilter(): void {
        this.filter.set(this.createFilter());
    }

    /** Pipes write their value in place, so every bar needs its own filter instance. */
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
                    type: KbqPipeTypes.Datetime,
                    value: this.periods.pick(this.periods.datetime(), { unit: 'hours', amount: -24 }),
                    cleanable: false,
                    removable: false,
                    disabled: false
                }
            ]
        };
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
                <kbq-select [ngModel]="localeService.id" (ngModelChange)="localeService.setLocale($event)">
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
