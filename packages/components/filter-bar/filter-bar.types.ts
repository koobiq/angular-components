export enum KbqPipeTypes {
    Text = 'text',
    Select = 'select',
    MultiSelect = 'multiselect',
    TreeSelect = 'tree-select',
    MultiTreeSelect = 'multitree-select',
    Date = 'date'
}

export interface KbqFilter {
    name: string;

    pipes: KbqPipe[];

    readonly: boolean;
    disabled: boolean;
    changed: boolean;
    unsaved: boolean;
}

export interface KbqPipe<T = any> {
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
