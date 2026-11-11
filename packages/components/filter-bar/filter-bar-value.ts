import { isSignal, Signal } from '@angular/core';
import { kbqResolveFilterBarName } from './filter-bar-name';
import {
    KbqDateTimeValue,
    KbqFilter,
    KbqPipe,
    KbqPipeTemplate,
    KbqPipeType,
    KbqPipeTypes,
    KbqSelectValue
} from './filter-bar.types';
import { getId } from './pipes/base-pipe';
import { kbqDatePresetId } from './pipes/pipe-date-base';
import { kbqFilterSelectValueId } from './pipes/select-pipe-search';

/**
 * How a filter value is copied. `clone` keeps a signal name as the signal itself; `serializable` reads it
 * into its current string.
 */
type FilterBarValueMode = 'clone' | 'serializable';

const isObject = (value: unknown): value is object => !!value && typeof value === 'object';

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
    if (!isObject(value)) return false;

    const prototype = Object.getPrototypeOf(value);

    return prototype === Object.prototype || prototype === null;
};

const mapValue = (
    value: unknown,
    mode: FilterBarValueMode,
    visited: WeakMap<object, unknown>,
    isName = false
): unknown => {
    if (isSignal(value)) {
        // Only a `name` is a label. A signal stored anywhere else is a business payload: a serializable
        // copy keeps that signal itself — turning it into a string would corrupt the data. Such a payload
        // stays non-cloneable, exactly as before signal-backed names were supported.
        return mode === 'serializable' && isName ? kbqResolveFilterBarName(value as Signal<string>) : value;
    }

    // Every copy is memoized per source, the walked ones here and the `structuredClone` ones below: a payload
    // two pipes share stays shared, and a cycle terminates instead of recursing until the stack overflows.
    if (Array.isArray(value) || isPlainObject(value)) {
        const existing = visited.get(value);

        if (existing !== undefined) return existing;
    }

    if (Array.isArray(value)) {
        const copy: unknown[] = [];

        visited.set(value, copy);

        for (const item of value) copy.push(mapValue(item, mode, visited));

        return copy;
    }

    if (isPlainObject(value)) {
        const copy: Record<string, unknown> = {};

        visited.set(value, copy);

        for (const [key, item] of Object.entries(value)) {
            copy[key] = mapValue(item, mode, visited, key === 'name');
        }

        return copy;
    }

    // A serializable copy leaves every other payload by reference. The store's JSON step has always
    // dropped or flattened what it cannot represent — a `compareWith` copied from a template, a
    // date-adapter `DateTime`, a function held as a business value — and cloning it here would either
    // throw `DataCloneError` or silently turn an opaque value into plain data. A snapshot still delegates
    // to `structuredClone`, keeping its non-cloneable restriction.
    if (mode === 'serializable') return value;

    if (typeof value === 'function' || (value !== null && typeof value === 'object')) {
        const existing = visited.get(value);

        if (existing !== undefined) return existing;

        const copy = structuredClone(value);

        visited.set(value, copy);

        return copy;
    }

    return value;
};

/**
 * Returns a copy of `filter` with every signal-backed `name` resolved to its current string, ready for the
 * application to persist with `JSON.stringify`.
 *
 * Only a `name` — of a pipe, a select option or a date preset — is a label. Every other payload is left by
 * reference: a business signal, a `compareWith` function copied from a template or a date-adapter value
 * keeps its identity instead of being turned into data, and `JSON.stringify` drops or flattens what it
 * cannot represent exactly as it always did. The filter itself is left untouched. `KbqFilter.name` is an
 * identity, not a label, and is never translated.
 *
 * @param filter The filter to copy. It is not modified.
 * @returns A copy with the current signal-backed labels as plain strings; everything else is shared.
 */
export const kbqFilterBarToSerializableFilter = (filter: KbqFilter): KbqFilter => {
    const visited = new WeakMap<object, unknown>();

    return {
        ...filter,
        name: filter.name,
        pipes: filter.pipes.map((pipe) => mapValue(pipe, 'serializable', visited) as KbqPipe)
    };
};

/**
 * Structural copy of a filter for an in-memory snapshot: signal-backed names are kept as the signals
 * themselves, while the arrays and plain objects around them are copied.
 *
 * A custom pipe `value` payload keeps the existing `structuredClone` restrictions — a function that is not
 * a name signal, a DOM node or another non-cloneable value still makes the copy throw `DataCloneError`.
 *
 * @internal
 */
export const cloneFilterBarFilter = (filter: KbqFilter | null): KbqFilter | null =>
    mapValue(filter, 'clone', new WeakMap<object, unknown>()) as KbqFilter | null;

/** Pipe types whose values carry option or preset names and are therefore projected for persistence. */
const PIPES_WITH_NAMED_VALUES: readonly KbqPipeType[] = [
    KbqPipeTypes.Select,
    KbqPipeTypes.MultiSelect,
    KbqPipeTypes.Date,
    KbqPipeTypes.Datetime
];

/**
 * The value of a pipe as it is persisted automatically: built-in select, multiselect and date values are
 * projected with their current `name` labels, every other value is stored as it is. Non-name signals and
 * other non-plain payloads are left by reference for the store's JSON step, which keeps persistence
 * tolerant of custom non-cloneable business values exactly as before.
 *
 * @internal
 */
export const kbqFilterBarSerializablePipeValue = (pipe: KbqPipe): unknown =>
    PIPES_WITH_NAMED_VALUES.includes(pipe.type)
        ? mapValue(pipe.value, 'serializable', new WeakMap<object, unknown>())
        : pipe.value;

const rehydrateSelectValue = (value: unknown, options: unknown): unknown => {
    if (!isObject(value) || !Array.isArray(options)) return value;

    const id = kbqFilterSelectValueId(value as KbqSelectValue);

    // A legacy option without an id has no stable identity to match by: keep the persisted value.
    if (id === undefined) return value;

    return (
        options.find((option) => isObject(option) && kbqFilterSelectValueId(option as KbqSelectValue) === id) ?? value
    );
};

const rehydrateDateValue = (value: unknown, presets: unknown): unknown => {
    if (!isObject(value) || !Array.isArray(presets)) return value;

    const id = kbqDatePresetId(value as KbqDateTimeValue);

    // A custom range has neither an id nor a name: it passes through untouched.
    if (id === undefined) return value;

    return presets.find((preset) => isObject(preset) && kbqDatePresetId(preset as KbqDateTimeValue) === id) ?? value;
};

const rehydratePipeValue = (pipe: KbqPipe, values: unknown[] | undefined): unknown => {
    switch (pipe.type) {
        case KbqPipeTypes.Select:
            return rehydrateSelectValue(pipe.value, values);
        case KbqPipeTypes.MultiSelect:
            return Array.isArray(pipe.value)
                ? pipe.value.map((item) => rehydrateSelectValue(item, values))
                : pipe.value;
        case KbqPipeTypes.Date:
        case KbqPipeTypes.Datetime:
            return rehydrateDateValue(pipe.value, values);
        default:
            // Tree values carry their labels in the template nodes rather than in the selected value.
            return pipe.value;
    }
};

/**
 * Returns a copy of `filter` whose persisted select, multiselect and date values are replaced with the
 * current option or preset of the matching pipe template, matched by stable id.
 *
 * A value the templates do not contain keeps its persisted business value. A tree value passes through
 * unchanged. The filter is not modified, and nothing is emitted or marked changed: resolution is a data
 * preparation step for a restore or a selection.
 *
 * @internal
 */
export const rehydrateFilterBarFilter = (filter: KbqFilter, templates: KbqPipeTemplate[]): KbqFilter => ({
    ...filter,
    pipes: filter.pipes.map((pipe) => {
        // The same template match the pipe and the date bounds use: same identity, same pipe type.
        const template = templates.find((item) => getId(item) === getId(pipe) && item.type === pipe.type);

        if (!template) return pipe;

        const value = rehydratePipeValue(pipe, template.values);

        return value === pipe.value ? pipe : { ...pipe, value };
    })
});
