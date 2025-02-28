import { TemplateRef } from '@angular/core';
import { KbqFilterBar } from './filter-bar';

export enum KbqPipeTypes {
    Text = 'text',
    Select = 'select',
    MultiSelect = 'multiselect',
    Date = 'date',
    Datetime = 'datetime'
}

export interface KbqDateTimeValue {
    name?: string;
    start?;
    end?;
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

export class KbqPipeData<T> {
    name: string;
    type: KbqPipeTypes;
    value: T | null;

    required: boolean;
    cleanable: boolean;
    removable: boolean;
    disabled: boolean;

    search?: boolean;
    openOnAdd?: boolean;
}

export interface KbqPipeTemplate extends Omit<KbqPipe, 'value'> {
    values?: unknown[];
    value?: unknown | null;
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
