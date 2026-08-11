import { inject, Injectable } from '@angular/core';
import { KbqThemeLocalStorageStore, KbqThemeName, KbqThemeStore } from '@koobiq/components/core';

/**
 * Maps the pre-DS-3003 navbar's dropdown index (`DocsNavbarProperty`, options ordered
 * system/light/dark) to the mode name `KbqThemeService` expects.
 */
const LEGACY_INDEX_TO_MODE: Record<string, KbqThemeName> = {
    '0': 'auto',
    '1': 'light',
    '2': 'dark'
};

/**
 * Reuses the `docs_theme` `localStorage` key from the old navbar, which stored a numeric dropdown
 * index (`"0"`/`"1"`/`"2"`) rather than a mode name. Reading that raw value as a mode would resolve
 * to no theme and render the site unthemed, so it's translated on the way out.
 */
@Injectable({ providedIn: 'root' })
export class DocsThemeStore implements KbqThemeStore {
    private readonly delegate = inject(KbqThemeLocalStorageStore);

    getSelection(): KbqThemeName | null {
        const stored = this.delegate.getSelection();

        return stored === null ? null : (LEGACY_INDEX_TO_MODE[stored] ?? stored);
    }

    setSelection(selection: KbqThemeName): void {
        this.delegate.setSelection(selection);
    }
}
