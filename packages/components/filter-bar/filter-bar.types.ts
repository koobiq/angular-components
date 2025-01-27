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

export interface KbqPipeValue<T> {
    name?: string;
    start?: T;
    end?: T;
}

export interface KbqPipe<T = any> {
    name: string;
    type: KbqPipeTypes;
    value?: T | T[];

    search?: boolean;

    required: boolean;
    cleanable: boolean;
    removable: boolean;
    disabled: boolean;
}

export class KbqPipeData<T> {
    name: string;
    type: KbqPipeTypes;
    value?: T | T[];

    required: boolean;
    cleanable: boolean;
    removable: boolean;
    disabled: boolean;
}

export interface KbqPipeTemplate<T = unknown> {
    name: string;
    type: KbqPipeTypes;
    values?: T;

    required: boolean;
    cleanable: boolean;
    removable: boolean;
    disabled: boolean;
}
