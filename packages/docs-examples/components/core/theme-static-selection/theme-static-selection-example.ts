import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import {
    KBQ_THEME_STORE,
    KbqThemeConfig,
    KbqThemeLocalStorageStore,
    kbqThemeProvider,
    KbqThemeSelector,
    KbqThemeService
} from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * Custom names pinned to the library's own light/dark classes (`KbqThemeSelector`) — reusing them, rather
 * than inventing unstyled classes, keeps the docs page's own styling intact when this example is live.
 */
const CUSTOM_THEMES: KbqThemeConfig[] = [
    { name: 'Day', className: KbqThemeSelector.Default, colorScheme: 'light' },
    { name: 'Night', className: KbqThemeSelector.Dark, colorScheme: 'dark' }
];

/**
 * @title Theme static selection
 */
@Component({
    selector: 'theme-static-selection-example',
    imports: [KbqButtonModule, KbqDropdownModule, KbqIconModule],
    template: `
        <button kbq-button [kbqDropdownTriggerFor]="menu">
            {{ theme.pinnedTheme() ?? 'Follow system' }}
            <i kbq-icon="kbq-chevron-down-s_16"></i>
        </button>
        <kbq-dropdown #menu="kbqDropdown">
            <button kbq-dropdown-item (click)="theme.setMode('auto')">Follow system</button>
            @for (t of theme.themes(); track t.name) {
                <button kbq-dropdown-item (click)="theme.pinnedTheme.set(t.name)">{{ t.name }}</button>
            }
        </kbq-dropdown>
    `,
    providers: [
        KbqThemeService,
        // Scopes persistence to this example too — `KBQ_THEME_STORE`'s default factory reads
        // `KBQ_THEME_CONFIG` from wherever it's instantiated, so it must be re-provided locally
        // alongside `kbqThemeProvider()` for the overridden `storageKey` below to actually apply.
        { provide: KBQ_THEME_STORE, useClass: KbqThemeLocalStorageStore },
        kbqThemeProvider({
            themes: CUSTOM_THEMES,
            theme: CUSTOM_THEMES[1].name,
            storageKey: 'kbq-example-static-theme'
        })
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThemeStaticSelectionExample {
    protected readonly theme = inject(KbqThemeService);
}
