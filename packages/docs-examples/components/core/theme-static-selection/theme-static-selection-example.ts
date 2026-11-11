import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqThemeConfig, KbqThemeSelector, KbqThemeService } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { injectExampleText } from '../l10n';

/**
 * @title Theme static selection
 */
@Component({
    selector: 'theme-static-selection-example',
    imports: [KbqButtonModule, KbqDropdownModule, KbqIconModule],
    template: `
        <button kbq-button [kbqDropdownTriggerFor]="menu">
            {{ theme.staticTheme() ?? text().pickTheme }}
            <i kbq-icon="kbq-chevron-down-s_16"></i>
        </button>
        <kbq-dropdown #menu="kbqDropdown">
            @for (t of customThemes(); track t.name) {
                <button kbq-dropdown-item (click)="theme.selectTheme(t.name)">{{ t.name }}</button>
            }
        </kbq-dropdown>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThemeStaticSelectionExample implements OnDestroy {
    protected readonly text = injectExampleText();

    /**
     * Custom names pinned to the library's own light/dark classes (`KbqThemeSelector`) — reusing them, rather
     * than inventing unstyled classes, keeps the docs page's own styling intact when this example is live.
     */
    protected readonly customThemes = computed<KbqThemeConfig[]>(() => [
        { name: this.text().day, className: KbqThemeSelector.Light, colorScheme: 'light' },
        { name: this.text().night, className: KbqThemeSelector.Dark, colorScheme: 'dark' }
    ]);

    // Uses the app's single, shared `KbqThemeService` rather than a locally-provided instance — a second
    // instance would apply its own resolved class to the same `<body>`, fighting the app's real theme for
    // control of it (see the `Day`/`Night` classes below, which alias `KbqThemeSelector` for this reason).
    protected readonly theme = inject(KbqThemeService);

    private readonly previousThemes = this.theme.themes();
    private readonly previousStaticTheme = this.theme.staticTheme();

    constructor() {
        this.theme.setThemes([...this.previousThemes, ...this.customThemes()]);
    }

    ngOnDestroy() {
        this.theme.setThemes(this.previousThemes);
        this.theme.selectTheme(this.previousStaticTheme);
    }
}
