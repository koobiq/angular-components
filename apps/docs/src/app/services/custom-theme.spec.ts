import { TestBed } from '@angular/core/testing';
import { KBQ_STATE_STORE, KbqStateSavingService, KbqStateStore } from '@koobiq/components/core';
import { Subject } from 'rxjs';
import {
    DOCS_CUSTOM_THEME_STYLE_ATTRIBUTE,
    DocsCustomTheme,
    docsCustomThemesEqual,
    DocsCustomThemeValue
} from './custom-theme';

const STATE_KEY = 'docs-custom-theme';

const theme: DocsCustomThemeValue = {
    selection: { theme: 'teal', contrast: 'slate', error: 'red', success: 'green', warning: 'orange', visited: 'plum' },
    roles: {},
    borderRadius: 16
};

/** The same theme with one role pinned in light only. */
const withPin: DocsCustomThemeValue = {
    ...theme,
    roles: { '--kbq-background-theme': { light: '--kbq-plt-teal-a14' } }
};

/** In-memory `KbqStateStore`, the same stand-in the library's own state-saving specs use. */
class InMemoryStateStore implements KbqStateStore {
    readonly state = new Map<string, unknown>();

    /** Stands in for a write made in another tab of the same origin. */
    readonly changes = new Subject<void>();

    getState(key: string): unknown {
        return this.state.has(key) ? JSON.parse(JSON.stringify(this.state.get(key))) : null;
    }

    setState(key: string, state: unknown): void {
        this.state.set(key, JSON.parse(JSON.stringify(state)));
    }

    removeState(key: string): void {
        this.state.delete(key);
    }

    /** Implemented because it is what `KbqStateSavingService` reports orphans off. */
    keys(): string[] {
        return [...this.state.keys()];
    }
}

describe(DocsCustomTheme.name, () => {
    let store: InMemoryStateStore;

    /** The override sheet, found the same way the playground finds it: by its marker attribute. */
    const injectedSheet = (): HTMLStyleElement | null =>
        document.head.querySelector(`style[${DOCS_CUSTOM_THEME_STYLE_ATTRIBUTE}]`);

    const injectedCss = (): string | null => injectedSheet()?.textContent ?? null;

    /** Instantiates the service and flushes the effect that writes the stylesheet. */
    const createService = (): DocsCustomTheme => {
        const service = TestBed.inject(DocsCustomTheme);

        TestBed.tick();

        return service;
    };

    beforeEach(() => {
        store = new InMemoryStateStore();

        TestBed.configureTestingModule({ providers: [{ provide: KBQ_STATE_STORE, useValue: store }] });
    });

    afterEach(() => injectedSheet()?.remove());

    it('starts with no theme and writes no stylesheet', () => {
        const service = createService();

        expect(service.saved()).toBeNull();
        expect(service.enabled()).toBe(false);
        expect(injectedCss()).toBeNull();
    });

    it('repoints both the light and the dark ramps of a family it is given', () => {
        const service = createService();

        service.save(theme);
        TestBed.tick();

        expect(injectedCss()).toContain('--kbq-semantic-theme-a20: var(--kbq-plt-teal-a20);');
        expect(injectedCss()).toContain('--kbq-semantic-dark-theme-a20: var(--kbq-plt-dark-teal-a20);');
        expect(injectedCss()).toContain('--kbq-size-border-radius: 16px;');
    });

    it('persists the theme it saved and switches to it', () => {
        const service = createService();

        service.save(theme);

        expect(service.enabled()).toBe(true);
        expect(store.getState(STATE_KEY)).toEqual({ theme, enabled: true });
    });

    it('overwrites the single saved slot rather than keeping both themes', () => {
        const service = createService();

        service.save(theme);
        service.save({ ...theme, borderRadius: 0 });

        expect(service.saved()).toEqual({ ...theme, borderRadius: 0 });
        expect(store.state.size).toBe(1);
        expect(store.getState(STATE_KEY)).toEqual({ theme: { ...theme, borderRadius: 0 }, enabled: true });
    });

    it('keeps the theme saved when it is switched off', () => {
        const service = createService();

        service.save(theme);
        service.toggle();
        TestBed.tick();

        expect(service.saved()).toEqual(theme);
        expect(injectedCss()).toBeNull();
        expect(store.getState(STATE_KEY)).toEqual({ theme, enabled: false });
    });

    it('restores a theme that was saved in an earlier visit', () => {
        store.setState(STATE_KEY, { theme, enabled: true });

        const service = createService();

        expect(service.saved()).toEqual(theme);
        expect(injectedCss()).toContain('var(--kbq-plt-teal-1)');
    });

    it('stays empty until the first render, so the prerendered markup and the hydrated one agree', () => {
        store.setState(STATE_KEY, { theme, enabled: true });

        const service = TestBed.inject(DocsCustomTheme);

        expect(service.saved()).toBeNull();

        TestBed.tick();

        expect(service.saved()).toEqual(theme);
    });

    it('restores a theme left switched off without applying it', () => {
        store.setState(STATE_KEY, { theme, enabled: false });

        const service = createService();

        expect(service.saved()).toEqual(theme);
        expect(injectedCss()).toBeNull();
    });

    describe('role pins', () => {
        it('declares a pin on the theme selector, never on :root', () => {
            const service = createService();

            service.save(withPin);
            TestBed.tick();

            const css = injectedCss()!;

            expect(css).toContain('.kbq-light {\n--kbq-background-theme: var(--kbq-plt-teal-a14);\n}');
            // Roles are declared under `.kbq-light` / `.kbq-dark`, so a `:root` override would lose.
            expect(css.slice(0, css.indexOf('.kbq-light'))).not.toContain('--kbq-background-theme:');
        });

        it('leaves out the block for a scheme with no pins', () => {
            const service = createService();

            service.save(withPin);
            TestBed.tick();

            expect(injectedCss()).not.toContain('.kbq-dark {');
        });

        it('emits no theme blocks at all when nothing is pinned', () => {
            const service = createService();

            service.save(theme);
            TestBed.tick();

            expect(injectedCss()).not.toContain('.kbq-light {');
            expect(injectedCss()).not.toContain('.kbq-dark {');
        });

        it('survives a round-trip through the store', () => {
            createService().save(withPin);

            expect(createService().saved()).toEqual(withPin);
        });

        it('tells two themes apart when only a pin differs', () => {
            expect(docsCustomThemesEqual(theme, withPin)).toBe(false);
        });

        it.each([
            ['a role nobody curated', { '--kbq-not-a-role': { light: '--kbq-plt-teal-a14' } }],
            ['a value that closes the rule', { '--kbq-background-theme': { light: '--x; } * { display: none }' } }],
            ['a value that is not a token', { '--kbq-background-theme': { light: 'red' } }]
        ])('drops %s and keeps the rest of the theme', (_, roles) => {
            store.setState(STATE_KEY, { theme: { ...theme, roles }, enabled: true });

            const service = createService();

            expect(service.saved()?.roles).toEqual({});
            expect(service.saved()?.selection.theme).toBe('teal');
            expect(injectedCss()).not.toContain('display: none');
        });
    });

    describe('state saving subsystem', () => {
        it('claims its entry, so clearing orphans does not sweep the theme away', () => {
            const stateSaving = TestBed.inject(KbqStateSavingService);

            createService().save(theme);

            expect(stateSaving.keys()).toContain(STATE_KEY);
            expect(stateSaving.orphans()).toEqual([]);

            stateSaving.clearOrphans();

            expect(store.getState(STATE_KEY)).not.toBeNull();
        });

        it('takes the theme off the page when the subsystem removes its entry', () => {
            const service = createService();

            service.save(theme);
            TestBed.inject(KbqStateSavingService).remove(STATE_KEY);
            TestBed.tick();

            expect(service.saved()).toBeNull();
            expect(service.enabled()).toBe(false);
            expect(injectedCss()).toBeNull();
        });

        it('persists nothing while the application-wide switch is off', () => {
            TestBed.inject(KbqStateSavingService).setEnabled(false);

            const service = createService();

            service.save(theme);
            TestBed.tick();

            expect(store.getState(STATE_KEY)).toBeNull();
            // The theme still applies for this visit; only remembering it is off.
            expect(injectedCss()).toContain('var(--kbq-plt-teal-1)');
        });

        it('ignores a theme in storage while the application-wide switch is off', () => {
            store.setState(STATE_KEY, { theme, enabled: true });
            TestBed.inject(KbqStateSavingService).setEnabled(false);

            expect(createService().saved()).toBeNull();
        });
    });

    it('picks up a theme saved in another tab', () => {
        const service = createService();

        store.setState(STATE_KEY, { theme, enabled: true });
        store.changes.next();
        TestBed.tick();

        expect(service.saved()).toEqual(theme);
        expect(injectedCss()).toContain('var(--kbq-plt-teal-1)');
    });

    // Web storage is origin-wide and user-writable, so a payload of any shape can come back. Only the
    // shape matters here; unparsable JSON never reaches this far — the store returns null for it.
    it.each([
        ['a selection that is not a record', { theme: { selection: 'teal', borderRadius: 4 }, enabled: true }],
        ['no border radius', { theme: { selection: {} }, enabled: true }],
        ['no theme at all', { enabled: true }]
    ])('treats a stored value with %s as no theme at all', (_, stored) => {
        store.setState(STATE_KEY, stored);

        expect(createService().saved()).toBeNull();
    });

    it('lets the playground preview outrank the saved theme', () => {
        const service = createService();

        service.save(theme);
        service.preview.set({ ...theme, selection: { ...theme.selection, theme: 'violet' } });
        TestBed.tick();

        expect(injectedCss()).toContain('var(--kbq-plt-violet-1)');

        service.preview.set(null);
        TestBed.tick();

        expect(injectedCss()).toContain('var(--kbq-plt-teal-1)');
    });
});
