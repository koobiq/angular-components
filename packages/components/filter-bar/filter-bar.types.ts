import { InjectionToken, ModelSignal, OutputEmitterRef, Provider, Signal, TemplateRef, Type } from '@angular/core';
import { ruRULocaleData } from '@koobiq/components/core';
import { BehaviorSubject } from 'rxjs';
import { KbqFilterBar } from './filter-bar';
import type { KbqBasePipe } from './pipes/base-pipe';
import { KbqPipeDateComponent } from './pipes/pipe-date';
import { KbqPipeDatetimeComponent } from './pipes/pipe-datetime';
import { KbqPipeMultiSelectComponent } from './pipes/pipe-multi-select';
import { KbqPipeMultiTreeSelectComponent } from './pipes/pipe-multi-tree-select';
import { KbqPipeReadonlyComponent } from './pipes/pipe-readonly';
import { KbqPipeSelectComponent } from './pipes/pipe-select';
import { KbqPipeTextComponent } from './pipes/pipe-text';
import { KbqPipeTreeSelectComponent } from './pipes/pipe-tree-select';

/**
 * Default localized strings for the filter-bar, used when no `KBQ_LOCALE_SERVICE` (nor an explicit
 * `KBQ_FILTER_BAR_CONFIGURATION`) is provided. These are the Russian (`ru-RU`) strings, matching the
 * library-wide default-locale convention (every `KBQ_*_DEFAULT_CONFIGURATION` resolves to `ruRULocaleData`).
 * Provide `KBQ_LOCALE_SERVICE` at the application root to localize the filter-bar for other locales.
 */
export const KBQ_FILTER_BAR_DEFAULT_CONFIGURATION = ruRULocaleData.filterBar;

/** Shape of the localized strings consumed by the filter-bar and its pipes. */
export type KbqFilterBarConfiguration = typeof KBQ_FILTER_BAR_DEFAULT_CONFIGURATION;

/** Injection Token for providing configuration of filter-bar */
export const KBQ_FILTER_BAR_CONFIGURATION = new InjectionToken<KbqFilterBarConfiguration>('KbqFilterBarConfiguration');

/**
 * Contract a pipe (or filter-bar sub-component) depends on instead of the concrete `KbqFilterBar`.
 * `KbqFilterBar` provides itself as {@link KBQ_FILTER_BAR_HOST}, so a pipe can be unit-tested against a
 * lightweight mock of this seam rather than a full bar. Members mirror the current `KbqFilterBar` surface;
 * they are expected to slim down once the state model moves to signals.
 */
export interface KbqFilterBarHost {
    /** Localized strings and configuration for the filter-bar and its pipes. */
    configuration: KbqFilterBarConfiguration;

    /** Currently selected filter. A two-way-bindable `model()`: read via `filter()`, write via `filter.set()`. */
    readonly filter: ModelSignal<KbqFilter | null>;

    /** Templates used when adding a pipe (also hold the option lists). Read via `pipeTemplates()`. */
    readonly pipeTemplates: Signal<KbqPipeTemplate[]>;

    /** Whether selecting all options counts as selecting nothing. */
    readonly selectedAllEqualsSelectedNothing: Signal<boolean>;

    /** Whether the current filter is saved. */
    readonly isSaved: Signal<boolean>;
    /** Whether the current filter is changed. */
    readonly isChanged: Signal<boolean>;
    /** Whether the current filter is both saved and changed. */
    readonly isSavedAndChanged: Signal<boolean>;
    /** Whether the current filter is readonly. */
    readonly isReadOnly: Signal<boolean>;

    /**
     * Emits whenever a pipe value changes.
     * (The two-way-bound `filter` value is emitted by the `filter` model's `filterChange` output.)
     */
    readonly onChangePipe: OutputEmitterRef<KbqPipe>;
    /** Emits whenever a pipe is cleared. */
    readonly onClearPipe: OutputEmitterRef<KbqPipe>;
    /** Emits whenever a select/multiselect pipe closes. */
    readonly onClosePipe: OutputEmitterRef<KbqPipe>;

    /** Internal filter changes. */
    readonly internalFilterChanges: BehaviorSubject<KbqFilter | null>;
    /** Internal pipe-template changes. */
    readonly internalTemplatesChanges: BehaviorSubject<KbqPipeTemplate[] | null>;
    /** Requests opening a pipe after it is added. */
    readonly openPipe: BehaviorSubject<string | number | null>;
    /** Emits when the filter is reset. */
    readonly onResetFilter: BehaviorSubject<boolean>;

    /** Removes a pipe from the current filter and emits the change. */
    removePipe(pipe: KbqPipe): void;

    /** Clears the current filter's "changed" flag. */
    resetFilterChangedState(): void;
}

/**
 * Injection token exposing the {@link KbqFilterBarHost} seam. `KbqFilterBar` provides itself via
 * `useExisting`, so pipes `inject(KBQ_FILTER_BAR_HOST)` instead of depending on the concrete bar.
 */
export const KBQ_FILTER_BAR_HOST = new InjectionToken<KbqFilterBarHost>('KBQ_FILTER_BAR_HOST');

/** Injection Token for providing pipes in filter-bar */
export const KBQ_FILTER_BAR_PIPES = new InjectionToken<Map<KbqPipeType, Type<KbqBasePipe<unknown>>>>(
    'kbq-filter-bar-pipes'
);

/** Utility provider for `KBQ_FILTER_BAR_PIPES`. */
export const kbqFilterBarPipesProvider = (): Provider => {
    return {
        provide: KBQ_FILTER_BAR_PIPES,
        useValue: new Map<KbqPipeType, Type<KbqBasePipe<unknown>>>(defaultFilterBarPipes)
    };
};

/** list of pipe types available out of the box */
export enum KbqPipeTypes {
    ReadOnly = 'readonly',
    Text = 'text',
    Select = 'select',
    TreeSelect = 'tree-select',
    MultiSelect = 'multiselect',
    MultiTreeSelect = 'multi-tree-select',
    Date = 'date',
    Datetime = 'datetime'
}

// `string & {}` keeps the literal union members visible to autocomplete while still allowing custom pipe types.
export type KbqPipeType = `${KbqPipeTypes}` | (string & {});

/** list of pipes available out of the box. */
export const defaultFilterBarPipes: [KbqPipeType, Type<KbqBasePipe<unknown>>][] = [
    [KbqPipeTypes.ReadOnly, KbqPipeReadonlyComponent],
    [KbqPipeTypes.Text, KbqPipeTextComponent],
    [KbqPipeTypes.Select, KbqPipeSelectComponent],
    [KbqPipeTypes.TreeSelect, KbqPipeTreeSelectComponent],
    [KbqPipeTypes.MultiSelect, KbqPipeMultiSelectComponent],
    [KbqPipeTypes.MultiTreeSelect, KbqPipeMultiTreeSelectComponent],
    [KbqPipeTypes.Date, KbqPipeDateComponent],
    [KbqPipeTypes.Datetime, KbqPipeDatetimeComponent]
];

export interface KbqDateTimeValue {
    name?: string;
    start?: string;
    end?: string;
}

export interface KbqSelectValue {
    name: string;
    value: unknown;
    /** Optional stable identifier used by the select/multi-select pipe comparators. */
    id?: string | number;
}

export interface KbqFilter {
    name: string;

    pipes: KbqPipe[];

    readonly: boolean;
    disabled: boolean;
    changed: boolean;
    // this is business logic state (like a flag)
    saved: boolean;
}

export interface KbqPipe {
    name: string;
    id?: string | number;
    type: KbqPipeType;
    value: unknown | null;

    search?: boolean;
    selectAll?: boolean;

    openOnAdd?: boolean;
    openOnReset?: boolean;

    /**
     * This is special logic that unselect all items when all selected because "all selected = nothing selected".
     * Default is true
     * */
    selectedAllEqualsSelectedNothing?: boolean;

    /** @deprecated use cleanable = false and removable = false instead */
    required?: boolean;
    cleanable: boolean;
    removable: boolean;
    disabled: boolean;
}

export interface KbqPipeData<V> extends KbqPipe {
    value: V | null;
}

export interface KbqPipeTemplate extends Omit<KbqPipe, 'value'> {
    values?: unknown[];
    valueTemplate?: TemplateRef<any> | string;
    /**
     * Custom equality comparator forwarded to the underlying `kbq-select` of the `select` /
     * `multiselect` pipes. When omitted, the pipe's default id-based comparator (`compareByValue`)
     * is used. Ignored by other pipe types.
     */
    compareWith?: (o1: KbqSelectValue | null, o2: KbqSelectValue | null) => boolean;
}

export interface KbqSaveFilterError {
    text?: string;
    nameAlreadyExists?: boolean;
}

/** saving statuses for KbqSaveFilterEvent */
export enum KbqSaveFilterStatuses {
    OnlyChanges = 'onlyChanges',
    NewName = 'newName',
    NewFilter = 'newFilter'
}

export interface KbqSaveFilterEvent {
    filter: KbqFilter;
    filterBar: KbqFilterBar;
    status?: KbqSaveFilterStatuses;
}

/** Flattened node */
export class KbqTreeSelectFlatNode {
    name: string;
    value: unknown;
    level: number;
    expandable: boolean;
    parent?: KbqTreeSelectFlatNode;
}

export interface KbqTreeSelectNode {
    children: KbqTreeSelectNode[] | null;
    name: string;
    value: unknown;
}

/**
 * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
 * The return value is the list of extends `KbqTreeSelectNode`.
 */
export function kbqBuildTree<T extends KbqTreeSelectNode>(value: Record<string, unknown>, level: number): T[] {
    const data: T[] = [];

    for (const [k, v] of Object.entries(value)) {
        const isBranch = typeof v === 'object' && v !== null && !(v as Record<string, unknown>)['value'];

        data.push({
            name: k.toString(),
            value: v,
            children: isBranch ? kbqBuildTree(v as Record<string, unknown>, level + 1) : null
        } as T);
    }

    return data;
}
