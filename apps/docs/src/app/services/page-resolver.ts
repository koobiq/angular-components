import { inject, InjectionToken, Type } from '@angular/core';
import { Params, RedirectCommand, ResolveFn, Router } from '@angular/router';

/** Loads the component compiled from the MDX source of a page. */
export type DocsPageLoader = () => Promise<{ default: Type<unknown> }>;

/** Compiled pages by structure item id, tab and locale, as `tools/docs-pages` generates them. */
export type DocsPages = Partial<Record<string, Partial<Record<string, Partial<Record<string, DocsPageLoader>>>>>>;

/**
 * Pages the resolver looks up. `@koobiq/docs-pages` exists only after `build:docs-content`, so the app config
 * provides it and specs provide their own pages instead of depending on the generated module.
 */
export const DOCS_PAGES = new InjectionToken<DocsPages>('DOCS_PAGES');

/**
 * Resolves the component compiled from the MDX source of the page. A tab without a page, such as the examples
 * tab of an item that has no examples, redirects to the 404 page. A resolver because `loadComponent` cannot see
 * the route parameters; the router waits for it on the server too, so the prerendered page carries its content.
 */
export const docsPageResolver: ResolveFn<Type<unknown>> = async (route) => {
    const pages = inject(DOCS_PAGES);
    const router = inject(Router);
    const params = route.pathFromRoot.reduce<Params>((result, { params }) => ({ ...result, ...params }), {});
    const load = pages[params['id']]?.[route.routeConfig?.path ?? '']?.[params['lang']];

    return load ? (await load()).default : new RedirectCommand(router.parseUrl('/404'));
};
