import { InjectionToken, Provider } from '@angular/core';
import {
    KbqDateTimeValue,
    KbqPipe,
    KbqPipeTemplate,
    KbqSelectValue,
    KbqTreeSelectFlatNode,
    KbqTreeSelectNode
} from './filter-bar.types';

/** Kinds of filter-bar names that can be resolved through {@link KBQ_FILTER_BAR_NAME_RESOLVER}. */
export type KbqFilterBarNameKind = 'pipe' | 'pipe-template' | 'select-option' | 'date-preset' | 'tree-node';

/**
 * Context passed to a filter-bar name resolver to localize or otherwise transform a displayed name.
 *
 * The `source` is the original object that carries the name; `pipe` is the active pipe (or the pipe
 * template) the name belongs to. `fallback` is the human-readable name already on the source, and
 * `key` is the translation key a resolver may use to look up a localized string.
 */
export interface KbqFilterBarNameContext {
    /** Translation key a resolver can use to localize or map the name. */
    key: string;

    /** Human-readable name to use when the resolver returns a nullish value. */
    fallback: string;

    /** What kind of named object the context describes. */
    kind: KbqFilterBarNameKind;

    /** The active pipe or pipe template the name belongs to. */
    pipe: KbqPipe | KbqPipeTemplate;

    /** The original object that carries the name. */
    source: KbqPipe | KbqPipeTemplate | KbqSelectValue | KbqDateTimeValue | KbqTreeSelectNode | KbqTreeSelectFlatNode;
}

/**
 * Resolver that translates a {@link KbqFilterBarNameContext} into a display name.
 * Return `null` or `undefined` to fall back to `context.fallback`.
 */
export type KbqFilterBarNameResolver = (context: KbqFilterBarNameContext) => string | null | undefined;

/**
 * Injection token for the filter-bar name resolver.
 *
 * The default resolver simply returns `context.fallback`, so a filter bar without a registered
 * resolver keeps showing the source names unchanged.
 */
export const KBQ_FILTER_BAR_NAME_RESOLVER = new InjectionToken<KbqFilterBarNameResolver>(
    'KBQ_FILTER_BAR_NAME_RESOLVER',
    {
        factory:
            () =>
            ({ fallback }) =>
                fallback,
        providedIn: 'root'
    }
);

/**
 * Provides a custom {@link KbqFilterBarNameResolver} for the filter bar.
 *
 * @param resolver Synchronous function that receives a name context and returns a display name,
 * or `null`/`undefined` to fall back to the context's `fallback`.
 */
export const kbqFilterBarNameResolverProvider = (resolver: KbqFilterBarNameResolver): Provider => ({
    provide: KBQ_FILTER_BAR_NAME_RESOLVER,
    useValue: resolver
});
