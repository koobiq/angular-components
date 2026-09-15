import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, RedirectCommand, Router, RouterStateSnapshot } from '@angular/router';
import { DOCS_PAGES, docsPageResolver, DocsPages } from './page-resolver';

class DocsCompiledPage {}

const pages: DocsPages = { alert: { overview: { en: () => Promise.resolve({ default: DocsCompiledPage }) } } };

/** The route tree of a tab: `/:lang`, then `components/:id`, then the tab itself. */
const resolve = (lang: string, id: string, tab: string): Promise<Type<unknown> | RedirectCommand> => {
    const route = {
        routeConfig: { path: tab },
        pathFromRoot: [{ params: {} }, { params: { lang } }, { params: { id } }, { params: {} }]
    } as unknown as ActivatedRouteSnapshot;

    return TestBed.runInInjectionContext(() => docsPageResolver(route, {} as RouterStateSnapshot)) as Promise<
        Type<unknown> | RedirectCommand
    >;
};

describe('docsPageResolver', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: DOCS_PAGES, useValue: pages }] });
    });

    it('resolves the page compiled for the item, the tab and the locale', async () => {
        await expect(resolve('en', 'alert', 'overview')).resolves.toBe(DocsCompiledPage);
    });

    // Only the examples tab of an item that has examples gets a page, but the route matches every item.
    it.each([
        ['another locale', 'ru', 'alert', 'overview'],
        ['another tab', 'en', 'alert', 'examples'],
        ['another item', 'en', 'button', 'overview']
    ])('redirects %s, which has no compiled page, to the 404 page', async (_name, lang, id, tab) => {
        const result = await resolve(lang, id, tab);

        expect(result).toBeInstanceOf(RedirectCommand);
        expect(TestBed.inject(Router).serializeUrl((result as RedirectCommand).redirectTo)).toBe('/404');
    });
});
