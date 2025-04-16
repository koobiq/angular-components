import { InjectionToken, Provider, TemplateRef } from '@angular/core';
import { ruRULocaleData } from '@koobiq/components/core';
import { KbqFilterBar } from './filter-bar';
import { KbqPipeDateComponent } from './pipes/pipe-date';
import { KbqPipeDatetimeComponent } from './pipes/pipe-datetime';
import { KbqPipeMultiSelectComponent } from './pipes/pipe-multi-select';
import { KbqPipeSelectComponent } from './pipes/pipe-select';
import { KbqPipeTextComponent } from './pipes/pipe-text';

/**default configuration of filter-bar */
export const KBQ_FILTER_BAR_DEFAULT_CONFIGURATION = ruRULocaleData.filterBar;

/** Injection Token for providing configuration of filter-bar */
export const KBQ_FILTER_BAR_CONFIGURATION = new InjectionToken('KbqFilterBarConfiguration');

/** Injection Token for providing pipes in filter-bar */
export const KBQ_FILTER_BAR_PIPES = new InjectionToken<any>('kbq-filter-bar-pipes');

/** Utility provider for `KBQ_FILTER_BAR_PIPES`. */
export const kbqFilterBarPipesProvider = (): Provider => {
    return {
        provide: KBQ_FILTER_BAR_PIPES,
        useValue: new Map<string, unknown>(defaultFilterBarPipes)
    };
};

/** list of pipe types available out of the box */
export enum KbqPipeTypes {
    Text = 'text',
    Select = 'select',
    MultiSelect = 'multiselect',
    Date = 'date',
    Datetime = 'datetime'
}
/** type of pipe */
export type KbqPipeType = `${KbqPipeTypes}` | string;

/** list of pipes available out of the box. */
export const defaultFilterBarPipes: [string, unknown][] = [
    [KbqPipeTypes.Text, KbqPipeTextComponent],
    [KbqPipeTypes.Select, KbqPipeSelectComponent],
    [KbqPipeTypes.MultiSelect, KbqPipeMultiSelectComponent],
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

    required: boolean;
    cleanable: boolean;
    removable: boolean;
    disabled: boolean;
}

export interface KbqPipeData<V> extends KbqPipe {
    value: V | null;

    search?: boolean;
    openOnAdd?: boolean;
}

export interface KbqPipeTemplate extends Omit<KbqPipe, 'value'> {
    values?: unknown[];
    valueTemplate?: TemplateRef<any> | string;
}

export interface KbqSaveFilterError {
    text?: string;
    nameAlreadyExists?: boolean;
}

export interface KbqSaveFilterEvent {
    filter: KbqFilter | null;
    filterBar: KbqFilterBar;
}
