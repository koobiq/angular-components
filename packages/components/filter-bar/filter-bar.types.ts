export interface KbqFilter {
    name: string;
    type: string;

    pipes: KbqPipe[];

    readonly: boolean;
    disabled: boolean;
    changed: boolean;
}

export interface KbqPipe<T = unknown> {
    name: string;
    type: string;
    value: T;

    readonly: boolean;
    empty: boolean;
    disabled: boolean;
    changed: boolean;
    multiple: boolean;
}
