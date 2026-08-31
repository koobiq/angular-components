import { Location } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, map, Subject } from 'rxjs';
import { DocsLocale } from '../../constants/locale';
import { DocsLocaleService } from '../../services/locale';
import { DocsSidenav } from './sidenav';

const provideDocsLocale = (locale: DocsLocale) => {
    const changes = new BehaviorSubject<DocsLocale>(locale);

    return {
        provide: DocsLocaleService,
        useValue: {
            get locale() {
                return changes.value;
            },
            changes: changes.asObservable(),
            isRuLocale: changes.pipe(map((value) => value === DocsLocale.Ru))
        }
    };
};

describe(DocsSidenav.name, () => {
    it('keeps the selected node in sync with the URL after client-side navigation', () => {
        const routerEvents = new Subject<NavigationEnd>();
        const currentPath = { value: '/en/components/button/overview' };

        TestBed.configureTestingModule({
            providers: [
                provideDocsLocale(DocsLocale.En),
                { provide: Router, useValue: { events: routerEvents.asObservable(), navigate: jest.fn() } },
                { provide: Location, useValue: { path: () => currentPath.value } }
            ]
        });

        const sidenav = TestBed.runInInjectionContext(() => new DocsSidenav());

        // Initial URL is reflected.
        expect(sidenav['selectedNodeId']()).toBe('components/button');

        // The sidenav lives for the whole session; after a navigation the highlighted node must follow.
        currentPath.value = '/en/components/checkbox/examples';
        routerEvents.next(new NavigationEnd(1, currentPath.value, currentPath.value));

        expect(sidenav['selectedNodeId']()).toBe('components/checkbox');
    });

    // The icons search writes `?s=` on every keystroke. `Location.path()` includes the query string,
    // so the node id used to drift to `icons?s=...` (losing the menu highlight), and the re-highlight
    // moved DOM focus onto the menu item, pulling it out of the search field (DOCS-BUG-08).
    it('ignores query-only navigations on the current page', () => {
        const routerEvents = new Subject<NavigationEnd>();
        const currentPath = { value: '/ru/icons' };

        TestBed.configureTestingModule({
            providers: [
                provideDocsLocale(DocsLocale.Ru),
                { provide: Router, useValue: { events: routerEvents.asObservable(), navigate: jest.fn() } },
                { provide: Location, useValue: { path: () => currentPath.value } }
            ]
        });

        const sidenav = TestBed.runInInjectionContext(() => new DocsSidenav());
        const highlight = jest.spyOn(sidenav as any, 'highlightSelectedOption');

        expect(sidenav['selectedNodeId']()).toBe('icons');

        currentPath.value = '/ru/icons?s=%D0%BA';
        routerEvents.next(new NavigationEnd(1, currentPath.value, currentPath.value));

        expect(sidenav['selectedNodeId']()).toBe('icons');
        expect(highlight).not.toHaveBeenCalled();
    });
});
