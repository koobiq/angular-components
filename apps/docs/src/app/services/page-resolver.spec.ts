import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
    ActivatedRouteSnapshot,
    provideRouter,
    RedirectCommand,
    ResolveFn,
    Router,
    RouterStateSnapshot
} from '@angular/router';
import { DocsApiEntryPoint, DocsApiEntryPoints } from '../components/api-page/api-page.types';
import { DocsLocale } from '../constants/locale';
import { DocsStructureItemTab } from '../structure';
import {
    DOCS_API_PAGES,
    DOCS_PAGES,
    docsApiPageResolver,
    DocsPagePrefetch,
    docsPageResolver,
    DocsPages
} from './page-resolver';

class DocsCompiledPage {}

const pages: DocsPages = { alert: { overview: { en: () => Promise.resolve({ default: DocsCompiledPage }) } } };

const ALERT_API: DocsApiEntryPoint = { path: '@koobiq/components/alert', entries: [] };

const apiPages: DocsApiEntryPoints = { alert: () => Promise.resolve({ default: ALERT_API }) };

/** The route tree of a tab: `/:lang`, then `components/:id`, then the tab itself. */
const resolve = <T>(resolver: ResolveFn<T>, lang: string, id: string, tab: string): Promise<T | RedirectCommand> => {
    const route = {
        routeConfig: { path: tab },
        pathFromRoot: [{ params: {} }, { params: { lang } }, { params: { id } }, { params: {} }]
    } as unknown as ActivatedRouteSnapshot;

    return TestBed.runInInjectionContext(() => resolver(route, {} as RouterStateSnapshot)) as Promise<
        T | RedirectCommand
    >;
};

/** Where the resolver redirects instead of resolving the page. */
const getRedirect = (result: unknown): string | null =>
    result instanceof RedirectCommand ? TestBed.inject(Router).serializeUrl(result.redirectTo) : null;

describe('docsPageResolver', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: DOCS_PAGES, useValue: pages }] });
    });

    it('resolves the page compiled for the item, the tab and the locale', async () => {
        await expect(resolve<Type<unknown>>(docsPageResolver, 'en', 'alert', 'overview')).resolves.toBe(
            DocsCompiledPage
        );
    });

    // Only the examples tab of an item that has examples gets a page, but the route matches every item.
    it.each([
        ['another locale', 'ru', 'alert', 'overview'],
        ['another tab', 'en', 'alert', 'examples'],
        ['another item', 'en', 'button', 'overview']
    ])('redirects %s, which has no compiled page, to the 404 page', async (_name, lang, id, tab) => {
        expect(getRedirect(await resolve(docsPageResolver, lang, id, tab))).toBe('/404');
    });
});

describe('docsApiPageResolver', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideRouter([]), { provide: DOCS_API_PAGES, useValue: apiPages }]
        });
    });

    // JSDoc is English, so either locale shows it.
    it.each(['en', 'ru'])('resolves the API of the entry point the item documents in the %s locale', async (lang) => {
        await expect(resolve(docsApiPageResolver, lang, 'alert', 'api')).resolves.toBe(ALERT_API);
    });

    it('redirects an item that documents no entry point to the 404 page', async () => {
        expect(getRedirect(await resolve(docsApiPageResolver, 'en', 'button', 'api'))).toBe('/404');
    });
});

describe(DocsPagePrefetch.name, () => {
    const setup = () => {
        const page = jest.fn(() => Promise.resolve({ default: DocsCompiledPage }));
        const api = jest.fn(() => Promise.resolve({ default: ALERT_API }));

        TestBed.configureTestingModule({
            providers: [
                { provide: DOCS_PAGES, useValue: { alert: { examples: { en: page } } } },
                { provide: DOCS_API_PAGES, useValue: { alert: api } }
            ]
        });

        return { prefetch: TestBed.inject(DocsPagePrefetch), page, api };
    };

    it('loads the page of a tab once', () => {
        const { prefetch, page } = setup();

        prefetch.prefetch('alert', DocsStructureItemTab.Examples, DocsLocale.En);
        prefetch.prefetch('alert', DocsStructureItemTab.Examples, DocsLocale.En);

        expect(page).toHaveBeenCalledTimes(1);
    });

    // JSDoc is English, so either locale shows the same API.
    it('loads the API of an item once for both locales', () => {
        const { prefetch, api } = setup();

        prefetch.prefetch('alert', DocsStructureItemTab.Api, DocsLocale.En);
        prefetch.prefetch('alert', DocsStructureItemTab.Api, DocsLocale.Ru);

        expect(api).toHaveBeenCalledTimes(1);
    });

    it('leaves a tab without a page alone', () => {
        const { prefetch, page, api } = setup();

        prefetch.prefetch('alert', DocsStructureItemTab.Examples, DocsLocale.Ru);
        prefetch.prefetch('button', DocsStructureItemTab.Api, DocsLocale.En);

        expect(page).not.toHaveBeenCalled();
        expect(api).not.toHaveBeenCalled();
    });

    // A later hover may find the network back.
    it('tries again after a load that failed', async () => {
        const { prefetch, api } = setup();

        api.mockImplementationOnce(() => Promise.reject(new Error('offline')));

        prefetch.prefetch('alert', DocsStructureItemTab.Api, DocsLocale.En);
        await Promise.resolve();
        prefetch.prefetch('alert', DocsStructureItemTab.Api, DocsLocale.En);

        expect(api).toHaveBeenCalledTimes(2);
    });
});
