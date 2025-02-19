import { KbqFilterBar } from './filter-bar';

export enum KbqPipeTypes {
    Text = 'text',
    Select = 'select',
    MultiSelect = 'multiselect',
    Date = 'date',
    Datetime = 'datetime'
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

export interface KbqPipeValue {
    name?: string;
    start?;
    end?;
}

export interface KbqPipe {
    name: string;
    id?: string | number;
    type: KbqPipeTypes;
    value?;

    search?: boolean;

    required: boolean;
    cleanable: boolean;
    removable: boolean;
    disabled: boolean;
}

export class KbqPipeData {
    name: string;
    type: KbqPipeTypes;
    value?;

    required: boolean;
    cleanable: boolean;
    removable: boolean;
    disabled: boolean;

    openOnAdd?: boolean;
}

export interface KbqPipeTemplate extends KbqPipe {
    values?: unknown[];
}

export interface KbqSaveFilterError {
    text?: string;
    nameAlreadyExists?: boolean;
}

export interface KbqSaveFilterEvent {
    filter: KbqFilter | null;
    filterBar: KbqFilterBar;
}
