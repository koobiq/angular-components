import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqThemeConfig, KbqThemeSelector, KbqThemeService } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/** A custom theme with a locale-independent `name` and a label that follows the examples locale. */
interface ExampleThemeConfig extends KbqThemeConfig {
    label: string;
}

/**
 * @title Theme static selection
 */
@Component({
    selector: 'theme-static-selection-example',
    imports: [KbqButtonModule, KbqDropdownModule, KbqIconModule],
    template: `
        <button kbq-button [kbqDropdownTriggerFor]="menu">
            {{ themeLabel() }}
            <i kbq-icon="kbq-chevron-down-s_16"></i>
        </button>
        <kbq-dropdown #menu="kbqDropdown">
            @for (option of customThemes(); track option.name) {
                <button kbq-dropdown-item (click)="theme.selectTheme(option.name)">{{ option.label }}</button>
            }
        </kbq-dropdown>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThemeStaticSelectionExample extends BaseLocalizedExample<ExampleTranslation> implements OnDestroy {
    /**
     * Custom names pinned to the library's own light/dark classes (`KbqThemeSelector`) — reusing them, rather
     * than inventing unstyled classes, keeps the docs page's own styling intact when this example is live.
     */
    // `name` is the stable identifier `KbqThemeService` works with; the label shown next to it follows the locale.
    protected readonly customThemes = computed<ExampleThemeConfig[]>(() => [
        { name: 'day', label: this.t().day, className: KbqThemeSelector.Light, colorScheme: 'light' },
        { name: 'night', label: this.t().night, className: KbqThemeSelector.Dark, colorScheme: 'dark' }
    ]);

    protected readonly themeLabel = computed(() => {
        const name = this.theme.staticTheme();

        return this.customThemes().find((option) => option.name === name)?.label ?? name ?? this.t().pickTheme;
    });

    // Uses the app's single, shared `KbqThemeService` rather than a locally-provided instance — a second
    // instance would apply its own resolved class to the same `<body>`, fighting the app's real theme for
    // control of it (see the `Day`/`Night` classes below, which alias `KbqThemeSelector` for this reason).
    protected readonly theme = inject(KbqThemeService);

    private readonly previousThemes = this.theme.themes();
    private readonly previousStaticTheme = this.theme.staticTheme();

    constructor() {
        super(TRANSLATIONS);
        this.theme.setThemes([...this.previousThemes, ...this.customThemes()]);
    }

    ngOnDestroy() {
        this.theme.setThemes(this.previousThemes);
        this.theme.selectTheme(this.previousStaticTheme);
    }
}
