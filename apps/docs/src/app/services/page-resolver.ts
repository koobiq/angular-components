import { inject, Injectable, InjectionToken, Type } from '@angular/core';
import { ActivatedRouteSnapshot, Params, RedirectCommand, ResolveFn, Router } from '@angular/router';
import { DocsApiEntryPoint, DocsApiEntryPoints } from '../components/api-page/api-page.types';
import { DocsLocale } from '../constants/locale';
import { DocsStructureItemTab } from '../structure';

/** Loads the component compiled from the MDX source of a page. */
export type DocsPageLoader = () => Promise<{ default: Type<unknown> }>;

/** Compiled pages by structure item id, tab and locale, as `tools/docs-pages` generates them. */
export type DocsPages = Partial<Record<string, Partial<Record<string, Partial<Record<string, DocsPageLoader>>>>>>;

/**
 * Pages the resolver looks up. `@koobiq/docs-pages` exists only after `build:docs-content`, so the app config
 * provides it and specs provide their own pages instead of depending on the generated module.
 */
export const DOCS_PAGES = new InjectionToken<DocsPages>('DOCS_PAGES');

/** The API of the entry points, as `tools/api-gen` generates it; provided for the same reason as `DOCS_PAGES`. */
export const DOCS_API_PAGES = new InjectionToken<DocsApiEntryPoints>('DOCS_API_PAGES');

/** The parameters of the route and of every route above it: `lang`, then `id`. */
const getParams = (route: ActivatedRouteSnapshot): Params =>
    route.pathFromRoot.reduce<Params>((result, { params }) => ({ ...result, ...params }), {});

/**
 * Resolves the component compiled from the MDX source of the page. A tab without a page, such as the examples
 * tab of an item that has no examples, redirects to the 404 page. A resolver because `loadComponent` cannot see
 * the route parameters; the router waits for it on the server too, so the prerendered page carries its content.
 */
export const docsPageResolver: ResolveFn<Type<unknown>> = async (route) => {
    const pages = inject(DOCS_PAGES);
    const router = inject(Router);
    const params = getParams(route);
    const load = pages[params['id']]?.[route.routeConfig?.path ?? '']?.[params['lang']];

    return load ? (await load()).default : new RedirectCommand(router.parseUrl('/404'));
};

/**
 * Resolves the API the API tab renders: that of the entry point the structure item documents, the same in
 * either locale. An item without one redirects to the 404 page.
 */
export const docsApiPageResolver: ResolveFn<DocsApiEntryPoint> = async (route) => {
    const pages = inject(DOCS_API_PAGES);
    const router = inject(Router);
    const load = pages[getParams(route)['id']];

    return load ? (await load()).default : new RedirectCommand(router.parseUrl('/404'));
};

/**
 * Loads the page of a tab before it is opened, while the pointer is over a link to it or the focus is on one.
 * The resolvers await its chunk, and the router keeps the current page on screen until it arrives, which reads
 * as a stuck navigation.
 */
@Injectable({ providedIn: 'root' })
export class DocsPagePrefetch {
    // Optional: the specs of the components that prefetch provide no pages, and the prefetch is an optimization.
    private readonly pages = inject(DOCS_PAGES, { optional: true });
    private readonly apiPages = inject(DOCS_API_PAGES, { optional: true });
    private readonly started = new Set<string>();

    prefetch(id: string, tab: DocsStructureItemTab, locale: DocsLocale): void {
        // The API is the same in either locale.
        const [key, load] =
            tab === DocsStructureItemTab.Api
                ? [`${id}/${tab}`, this.apiPages?.[id]]
                : [`${id}/${tab}/${locale}`, this.pages?.[id]?.[tab]?.[locale]];

        if (!load || this.started.has(key)) return;

        this.started.add(key);
        // A failed prefetch says nothing to the reader: the navigation loads the page again and reports it.
        void load().catch(() => this.started.delete(key));
    }
}
