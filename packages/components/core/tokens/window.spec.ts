import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { KBQ_WINDOW } from './window';

describe('KBQ_WINDOW', () => {
    it('resolves to the view the document belongs to, with no provider of its own', () => {
        TestBed.configureTestingModule({});

        expect(TestBed.inject(KBQ_WINDOW)).toBe(TestBed.inject(DOCUMENT).defaultView);
    });

    it('resolves once and hands out the same instance to every consumer', () => {
        TestBed.configureTestingModule({});

        expect(TestBed.inject(KBQ_WINDOW)).toBe(TestBed.inject(KBQ_WINDOW));
    });

    it('falls back to the global window for a document that has no view of its own', () => {
        // `defaultView` is `null` for a detached document — one built by `DOMImplementation` or parsed by
        // `DOMParser` — which an app can end up providing as `DOCUMENT` in tests and embedded contexts.
        const detached = document.implementation.createHTMLDocument('detached');

        expect(detached.defaultView).toBeNull();

        TestBed.configureTestingModule({ providers: [{ provide: DOCUMENT, useValue: detached }] });

        expect(TestBed.inject(KBQ_WINDOW)).toBe(window);
    });

    it('yields a real view, so the listener pair consumers call unguarded is always there', () => {
        // `KbqThemeLocalStorageStore.changes` registers a `storage` listener without checking for the
        // methods first — the guarantee it leans on is this factory's, which returns a genuine view or
        // throws. Note that the same is *not* true of every member: jsdom has no `matchMedia` and neither
        // does the server, which is why `KbqThemeService` checks for that one before calling it.
        TestBed.configureTestingModule({});

        const kbqWindow = TestBed.inject(KBQ_WINDOW);

        expect(typeof kbqWindow.addEventListener).toBe('function');
        expect(typeof kbqWindow.removeEventListener).toBe('function');
    });

    it('can be replaced wholesale, which is how a server render supplies its own stub', () => {
        // Mirrors `provideServerWindow` in apps/docs/src/config.server.ts.
        const serverWindow = { matchMedia: () => ({ matches: false }) } as unknown as Window;

        TestBed.configureTestingModule({ providers: [{ provide: KBQ_WINDOW, useValue: serverWindow }] });

        expect(TestBed.inject(KBQ_WINDOW)).toBe(serverWindow);
    });
});
