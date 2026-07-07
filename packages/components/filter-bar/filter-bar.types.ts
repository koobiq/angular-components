import { InjectionToken, Provider, TemplateRef, Type } from '@angular/core';
import { ruRULocaleData } from '@koobiq/components/core';
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

/** default configuration of filter-bar */
export const KBQ_FILTER_BAR_DEFAULT_CONFIGURATION = ruRULocaleData.filterBar;

/** Shape of the localized strings consumed by the filter-bar and its pipes. */
export type KbqFilterBarConfiguration = typeof KBQ_FILTER_BAR_DEFAULT_CONFIGURATION;

/** Injection Token for providing configuration of filter-bar */
export const KBQ_FILTER_BAR_CONFIGURATION = new InjectionToken<KbqFilterBarConfiguration>('KbqFilterBarConfiguration');

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
