import { TestBed } from '@angular/core/testing';
import { KBQ_THEME_CONFIG, KBQ_WINDOW } from '@koobiq/components/core';
import { DocsThemeStore } from './theme-store';

describe(DocsThemeStore.name, () => {
    function setup() {
        TestBed.configureTestingModule({
            providers: [
                { provide: KBQ_THEME_CONFIG, useValue: { storageKey: 'docs_theme' } },
                { provide: KBQ_WINDOW, useValue: window }
            ]
        });

        return TestBed.inject(DocsThemeStore);
    }

    afterEach(() => localStorage.clear());

    it('reads null when nothing is stored', () => {
        expect(setup().getMode()).toBeNull();
    });

    it.each([
        ['0', 'auto'],
        ['1', 'light'],
        ['2', 'dark']
    ])('migrates the legacy dropdown index %s to mode %s', (legacyIndex, mode) => {
        localStorage.setItem('docs_theme', legacyIndex);

        expect(setup().getMode()).toBe(mode);
    });

    it('passes an already-migrated mode name through unchanged', () => {
        localStorage.setItem('docs_theme', 'dark');

        expect(setup().getMode()).toBe('dark');
    });

    it('writes new mode names, not legacy indexes', () => {
        const store = setup();

        store.setMode('dark');

        expect(localStorage.getItem('docs_theme')).toBe('dark');
    });
});
