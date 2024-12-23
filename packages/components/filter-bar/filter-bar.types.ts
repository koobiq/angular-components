export enum KbqPipeTypes {
    Text,
    Select,
    MultiSelect,
    TreeSelect,
    MultiTreeSelect,
    Date
}

export interface KbqFilter {
    name: string;

    pipes: KbqPipe[];

    readonly: boolean;
    disabled: boolean;
    changed: boolean;
    unsaved: boolean;
}

export interface KbqPipe<T = unknown> {
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
    values: T;

    required: boolean;
    cleanable: boolean;
    removable: boolean;
    disabled: boolean;
}
