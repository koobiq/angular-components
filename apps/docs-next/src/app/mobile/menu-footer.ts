import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KbqThemeMode, KbqThemeService } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconButton, KbqIconModule } from '@koobiq/components/icon';
import { DocsNextI18nKey, DocsNextLocale } from '../data/site';
import { DocsNextSiteState } from '../services/site-state';

/** The system theme takes the icon of the device the site is laid out for: a phone here, a monitor on a wide screen. */
const THEME_OPTIONS: { mode: KbqThemeMode; title: DocsNextI18nKey; icon: string }[] = [
    { mode: 'auto', title: 'themeAuto', icon: 'kbq-mobile_16' },
    { mode: 'dark', title: 'themeDark', icon: 'kbq-moon_16' },
    { mode: 'light', title: 'themeLight', icon: 'kbq-sun_16' }
];

const LOCALES: { id: DocsNextLocale; title: string }[] = [
    { id: 'ru', title: 'Русский' },
    { id: 'en', title: 'English' }
];

/** Bottom row of the phone menu: theme on the left, language on the right (Figma: Drawer Bottom Bar, 66:34654). */
@Component({
    selector: 'docs-next-menu-footer',
    imports: [RouterLink, KbqDropdownModule, KbqIconButton, KbqIconModule],
    template: `
        <div class="docs-next-menu-footer__themes" role="group" [attr.aria-label]="state.t('theme')">
            @for (option of themeOptions; track option.mode) {
                <!-- The selected theme in contrast, the others faded; no fill. -->
                <button
                    class="docs-next-menu-footer__theme"
                    size="compact"
                    type="button"
                    [attr.aria-label]="state.t(option.title)"
                    [attr.aria-pressed]="option.mode === themeMode()"
                    [color]="option.mode === themeMode() ? 'contrast' : 'contrast-fade'"
                    [kbq-icon-button]="option.icon"
                    (click)="theme.setMode(option.mode)"
                ></button>
            }
        </div>

        <button
            class="docs-next-menu-footer__locale"
            type="button"
            [attr.aria-label]="localeLabel()"
            [kbqDropdownTriggerFor]="localeDropdown"
        >
            <span class="docs-next-menu-button__inner">
                {{ localeTitle() }}
                <i kbq-icon="kbq-chevron-down-s_16"></i>
            </span>
        </button>

        <kbq-dropdown #localeDropdown="kbqDropdown">
            @for (locale of locales; track locale.id) {
                <a
                    kbq-dropdown-item
                    [class.kbq-selected]="locale.id === state.locale()"
                    [routerLink]="state.localeUrl(locale.id)"
                >
                    {{ locale.title }}
                </a>
            }
        </kbq-dropdown>
    `,
    styleUrl: './menu-footer.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocsNextMenuFooter {
    protected readonly state = inject(DocsNextSiteState);
    protected readonly theme = inject(KbqThemeService);

    protected readonly themeOptions = THEME_OPTIONS;
    protected readonly themeMode = this.theme.mode;
    protected readonly locales = LOCALES;

    /** Starts with the visible text, so a voice command naming the button finds it. */
    protected localeLabel(): string {
        return `${this.localeTitle()}, ${this.state.t('language').toLowerCase()}`;
    }

    protected localeTitle(): string {
        return LOCALES.find(({ id }) => id === this.state.locale())?.title ?? '';
    }
}
