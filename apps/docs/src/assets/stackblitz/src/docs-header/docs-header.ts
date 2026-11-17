// Шапка сайта документации, не часть примера
import { afterNextRender, ChangeDetectionStrategy, Component, computed, inject, viewChildren } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import {
    KBQ_CONNECTED_OVERLAY_ABOVE_CLASS,
    KBQ_CONNECTED_OVERLAY_BELOW_CLASS,
    KBQ_LOCALE_SERVICE,
    KbqThemeMode,
    KbqThemeNames,
    KbqThemeService
} from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqSelect, KbqSelectModule } from '@koobiq/components/select';
import { KbqToolTipModule } from '@koobiq/components/tooltip';

interface HeaderText {
    readonly telegram: string;
    readonly github: string;
    readonly language: string;
    readonly theme: string;
    readonly system: string;
    readonly light: string;
    readonly dark: string;
}

/** Texts of the header by locale id. */
const HEADER_TEXT: Record<string, HeaderText> = {
    'en-US': {
        telegram: 'Koobiq on Telegram',
        github: 'GitHub repository',
        language: 'Interface language',
        theme: 'Color theme',
        system: 'System',
        light: 'Light',
        dark: 'Dark'
    },
    'ru-RU': {
        telegram: 'Koobiq в Telegram',
        github: 'Репозиторий на GitHub',
        language: 'Язык интерфейса',
        theme: 'Тема оформления',
        system: 'Системная',
        light: 'Светлая',
        dark: 'Темная'
    }
};

/** Panel positions anchored to the trigger's end edge, so the panel opens under the trigger and extends to its left. */
const END_ALIGNED_POSITIONS: KbqSelect['positions'] = [
    {
        originX: 'end',
        originY: 'bottom',
        overlayX: 'end',
        overlayY: 'top',
        panelClass: KBQ_CONNECTED_OVERLAY_BELOW_CLASS
    },
    {
        originX: 'end',
        originY: 'top',
        overlayX: 'end',
        overlayY: 'bottom',
        panelClass: KBQ_CONNECTED_OVERLAY_ABOVE_CLASS
    }
];

/** Header of the docs site, mounted into `<docs-header>` by `docsMountHeader`. */
@Component({
    selector: 'docs-header',
    imports: [KbqButtonModule, KbqIconModule, KbqSelectModule, KbqToolTipModule],
    template: `
        <a class="docs-header__logo" href="https://koobiq.io/" target="_blank" rel="noopener">
            <!-- prettier-ignore -->
            <svg fill="none" height="21" viewBox="0 0 18 19" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M17.5625 11.1001H11.4375C11.1959 11.1001 11 11.296 11 11.5376V17.6626C11 17.9043 11.1959 18.1001 11.4375 18.1001H17.5625C17.8042 18.1001 18 17.9043 18 17.6626V11.5376C18 11.296 17.8042 11.1001 17.5625 11.1001Z" fill="#FF0000"/><path clip-rule="evenodd" d="M6.5625 0.100098H0.4375C0.196875 0.100098 0 0.296973 0 0.537598V6.6626C0 6.90322 0.196875 7.1001 0.4375 7.1001H3.0625C3.30312 7.1001 3.5 6.90322 3.5 6.6626V4.0376C3.5 3.79697 3.69688 3.6001 3.9375 3.6001H6.5625C6.80312 3.6001 7 3.40322 7 3.1626V0.537598C7 0.296973 6.80312 0.100098 6.5625 0.100098Z" fill="#FF0000" fill-rule="evenodd"/><path clip-rule="evenodd" d="M6.5625 11.1001H0.4375C0.196875 11.1001 0 11.297 0 11.5376V14.1626C0 14.4032 0.196875 14.6001 0.4375 14.6001H3.0625C3.30312 14.6001 3.5 14.797 3.5 15.0376V17.6626C3.5 17.9032 3.69688 18.1001 3.9375 18.1001H6.5625C6.80312 18.1001 7 17.9032 7 17.6626V11.5376C7 11.297 6.80312 11.1001 6.5625 11.1001Z" fill="#FF0000" fill-rule="evenodd"/><path clip-rule="evenodd" d="M17.5625 0.100098H14.9375C14.6969 0.100098 14.5 0.296973 14.5 0.537598V3.1626C14.5 3.40322 14.3031 3.6001 14.0625 3.6001H11.4375C11.1969 3.6001 11 3.79697 11 4.0376V6.6626C11 6.90322 11.1969 7.1001 11.4375 7.1001H17.5625C17.8031 7.1001 18 6.90322 18 6.6626V0.537598C18 0.296973 17.8031 0.100098 17.5625 0.100098Z" fill="#FF0000" fill-rule="evenodd"/></svg>
            <!-- prettier-ignore -->
            <svg fill="currentColor" height="25" viewBox="0 0 78 25" width="78" xmlns="http://www.w3.org/2000/svg"><path d="M74.1362 24.2332V17.1036H74.0055C73.5087 18.0797 72.4715 19.4481 70.1705 19.4481C67.0153 19.4481 64.6533 16.9467 64.6533 12.5364C64.6533 8.0739 67.0851 5.65088 70.1792 5.65088C72.5412 5.65088 73.5261 7.07157 74.0055 8.03903H74.1972V5.8252H77.3001V24.2332H74.1362ZM71.0508 16.8595C73.0642 16.8595 74.1972 15.1163 74.1972 12.519C74.1972 9.92166 73.0816 8.2395 71.0508 8.2395C68.9503 8.2395 67.8695 10.0263 67.8695 12.519C67.8695 15.0292 68.9677 16.8595 71.0508 16.8595Z"/><path d="M58.8554 19.213V5.82541H62.0105V19.213H58.8554ZM60.4417 3.92535C59.4306 3.92535 58.6113 3.15835 58.6113 2.21703C58.6113 1.267 59.4306 0.5 60.4417 0.5C61.444 0.5 62.2633 1.267 62.2633 2.21703C62.2633 3.15835 61.444 3.92535 60.4417 3.92535Z"/><path d="M43.4824 19.2129V1.36279H46.6376V8.03917H46.7683C47.2477 7.0717 48.2326 5.65101 50.5946 5.65101C53.6887 5.65101 56.1205 8.07403 56.1205 12.5366C56.1205 16.9468 53.7585 19.4483 50.6033 19.4483C48.3023 19.4483 47.2651 18.0799 46.7683 17.1037H46.5853V19.2129H43.4824ZM46.5766 12.5191C46.5766 15.1165 47.7096 16.8596 49.723 16.8596C51.8061 16.8596 52.9043 15.0293 52.9043 12.5191C52.9043 10.0264 51.8235 8.23963 49.723 8.23963C47.6922 8.23963 46.5766 9.9218 46.5766 12.5191Z"/><path d="M34.2499 19.4743C30.3277 19.4743 27.835 16.7113 27.835 12.5713C27.835 8.42253 30.3277 5.65088 34.2499 5.65088C38.172 5.65088 40.6648 8.42253 40.6648 12.5713C40.6648 16.7113 38.172 19.4743 34.2499 19.4743ZM34.2673 16.9467C36.4027 16.9467 37.466 15.0117 37.466 12.5626C37.466 10.1134 36.4027 8.15234 34.2673 8.15234C32.097 8.15234 31.0337 10.1134 31.0337 12.5626C31.0337 15.0117 32.097 16.9467 34.2673 16.9467Z"/><path d="M19.3172 19.4743C15.3951 19.4743 12.9023 16.7113 12.9023 12.5713C12.9023 8.42253 15.3951 5.65088 19.3172 5.65088C23.2394 5.65088 25.7321 8.42253 25.7321 12.5713C25.7321 16.7113 23.2394 19.4743 19.3172 19.4743ZM19.3347 16.9467C21.4701 16.9467 22.5334 15.0117 22.5334 12.5626C22.5334 10.1134 21.4701 8.15234 19.3347 8.15234C17.1644 8.15234 16.1011 10.1134 16.1011 12.5626C16.1011 15.0117 17.1644 16.9467 19.3347 16.9467Z"/><path d="M0.0551758 19.2129V1.36279H3.21033V11.203H3.42823L8.2394 5.82533H11.9262L6.74026 11.604L12.2313 19.2129H8.4573L4.36083 13.4866L3.21033 14.7155V19.2129H0.0551758Z"/></svg>
        </a>
        <div class="docs-header__links">
            <a
                kbq-button
                class="kbq-button-icon"
                color="contrast"
                kbqStyle="transparent"
                href="https://t.me/koobiq_io"
                target="_blank"
                rel="noopener"
                [attr.aria-label]="text().telegram"
                [kbqTooltip]="text().telegram"
            >
                <i kbq-icon="kbq-telegram_16"></i>
            </a>
            <a
                kbq-button
                class="kbq-button-icon"
                color="contrast"
                kbqStyle="transparent"
                href="https://github.com/koobiq/angular-components"
                target="_blank"
                rel="noopener"
                [attr.aria-label]="text().github"
                [kbqTooltip]="text().github"
            >
                <i kbq-icon="kbq-github_16"></i>
            </a>
        </div>
        <div class="docs-header__actions">
            <kbq-select
                #languageSelect="kbqSelect"
                class="docs-header__select"
                [tabIndex]="-1"
                [value]="localeService.localeId()"
                (valueChange)="localeService.setLocale($event)"
                (focus)="languageButton.focus()"
            >
                <button
                    #languageButton
                    kbq-button
                    kbq-select-matcher
                    class="kbq-button-icon"
                    color="contrast"
                    kbqStyle="transparent"
                    [attr.aria-label]="text().language"
                    [kbqTooltip]="text().language"
                    [class.kbq-active]="languageSelect.panelOpen"
                >
                    <i kbq-icon="kbq-globe_16"></i>
                </button>
                @for (item of localeService.locales.items; track item.id) {
                    <kbq-option [value]="item.id">{{ item.name }}</kbq-option>
                }
            </kbq-select>
            <kbq-select
                #themeSelect="kbqSelect"
                class="docs-header__select"
                [tabIndex]="-1"
                [value]="themeService.mode()"
                (valueChange)="themeService.setMode($event)"
                (focus)="themeButton.focus()"
            >
                <button
                    #themeButton
                    kbq-button
                    kbq-select-matcher
                    class="kbq-button-icon"
                    color="contrast"
                    kbqStyle="transparent"
                    kbqPlacement="bottomRight"
                    [attr.aria-label]="text().theme"
                    [kbqTooltip]="text().theme"
                    [class.kbq-active]="themeSelect.panelOpen"
                >
                    <i kbq-icon="kbq-sun-moon_16"></i>
                </button>
                @for (option of themeOptions(); track option.mode) {
                    <kbq-option [value]="option.mode">{{ option.title }}</kbq-option>
                }
            </kbq-select>
        </div>
    `,
    styles: `
        :host {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: var(--kbq-size-s) var(--kbq-size-m);
            box-shadow: 0 1px 0 0 var(--kbq-line-contrast-less);
        }

        .docs-header__logo {
            display: flex;
            gap: var(--kbq-size-m);
            color: var(--kbq-foreground-contrast);
            margin-inline-end: var(--kbq-size-m);
            border-radius: 2px;
        }

        .docs-header__logo:focus-visible {
            outline: 1px solid var(--kbq-states-line-focus-theme);
            outline-offset: 2px;
        }

        .docs-header__links {
            display: flex;
            align-items: center;
            gap: var(--kbq-size-xxs);
            margin-inline-end: auto;
        }

        .docs-header__actions {
            display: flex;
            align-items: center;
            gap: var(--kbq-size-xxs);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocsHeader {
    protected readonly localeService = inject(KBQ_LOCALE_SERVICE);
    protected readonly themeService = inject(KbqThemeService);
    protected readonly selects = viewChildren(KbqSelect);

    constructor() {
        // The header sits at the right edge of the page. The default panel opens from the trigger's start edge
        // and the browser pushes it off the page, so it opens from the end edge instead.
        afterNextRender(() => {
            for (const select of this.selects()) {
                select.positions = END_ALIGNED_POSITIONS;
            }
        });
    }

    protected readonly text = computed(() => HEADER_TEXT[this.localeService.localeId()] ?? HEADER_TEXT['en-US']);

    protected readonly themeOptions = computed((): { mode: KbqThemeMode; title: string }[] => [
        { mode: 'auto', title: this.text().system },
        { mode: KbqThemeNames.Light, title: this.text().light },
        { mode: KbqThemeNames.Dark, title: this.text().dark }
    ]);
}
