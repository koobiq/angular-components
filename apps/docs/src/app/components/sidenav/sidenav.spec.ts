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

    describe('re-highlighting on navigation', () => {
        const setup = (path: string) => {
            const routerEvents = new Subject<NavigationEnd>();
            const currentPath = { value: path };

            TestBed.configureTestingModule({
                providers: [
                    provideDocsLocale(DocsLocale.Ru),
                    { provide: Router, useValue: { events: routerEvents.asObservable(), navigate: jest.fn() } },
                    { provide: Location, useValue: { path: () => currentPath.value } }
                ]
            });

            const sidenav = TestBed.runInInjectionContext(() => new DocsSidenav());

            return {
                sidenav,
                // Only the call is under test. Left calling through, the real body schedules
                // `this.tree()` via `afterNextRender`, and that required `viewChild` throws NG0951
                // as soon as anything makes the after-render hooks run without a fixture.
                highlight: jest.spyOn(sidenav as any, 'highlightSelectedOption').mockImplementation(),
                navigateTo: (next: string) => {
                    currentPath.value = next;
                    routerEvents.next(new NavigationEnd(1, next, next));
                }
            };
        };

        // `highlightSelectedOption()` focuses the option, so it may only run when the node changes.
        it('re-highlights when the route moves to another node', () => {
            const { sidenav, highlight, navigateTo } = setup('/ru/icons');

            navigateTo('/ru/components/button/overview');

            expect(sidenav['selectedNodeId']()).toBe('components/button');
            expect(highlight).toHaveBeenCalledTimes(1);
        });

        // The icons search writes `?s=` on every keystroke. `Location.path()` appends the query
        // string, so the node id used to drift to `icons?s=...` (losing the menu highlight), and the
        // re-highlight moved DOM focus onto the menu item, out of the search field (DOCS-BUG-08).
        it('ignores query-only navigations on the current page', () => {
            const { sidenav, highlight, navigateTo } = setup('/ru/icons');

            expect(sidenav['selectedNodeId']()).toBe('icons');

            navigateTo('/ru/icons?s=%D0%BA');

            expect(sidenav['selectedNodeId']()).toBe('icons');
            expect(highlight).not.toHaveBeenCalled();
        });

        // The tree owns the other end of `[(ngModel)]="selectedNodeId"`: clicking a category header
        // writes that category's id back, even though it only expands and never navigates. Comparing
        // against the model instead of the last URL would let the next keystroke steal focus again.
        it('ignores query-only navigations after the tree wrote its own selection back', () => {
            const { sidenav, highlight, navigateTo } = setup('/ru/icons');

            sidenav['selectedNodeId'].set('components');

            navigateTo('/ru/icons?s=%D0%BA');

            expect(sidenav['selectedNodeId']()).toBe('icons');
            expect(highlight).not.toHaveBeenCalled();
        });
    });
});
