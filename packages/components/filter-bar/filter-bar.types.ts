import { InjectionToken, TemplateRef } from '@angular/core';
import { ruRULocaleData } from '@koobiq/components/core';
import { KbqFilterBar } from './filter-bar';

export const KBQ_FILTER_BAR_CONFIGURATION = new InjectionToken('KbqFilterBarConfiguration');

export const KBQ_FILTER_BAR_DEFAULT_CONFIGURATION = ruRULocaleData.filterBar;

export enum KbqPipeTypes {
    Text = 'text',
    Select = 'select',
    MultiSelect = 'multiselect',
    Date = 'date',
    Datetime = 'datetime'
}

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
    type: KbqPipeTypes;
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
