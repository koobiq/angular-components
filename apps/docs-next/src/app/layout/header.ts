import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqThemeMode, KbqThemeService } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqOverflowItemsModule } from '@koobiq/components/overflow-items';
import { DOCS_NEXT_SECTIONS } from '../data/sections';
import {
    DOCS_NEXT_FRAMEWORKS,
    DocsNextFramework,
    docsNextFrameworkTitle,
    DocsNextI18nKey,
    DocsNextLocale,
    docsNextVersionShortTitle
} from '../data/site';
import { DocsNextSiteState } from '../services/site-state';
import { DocsNextLogo } from './logo';
import { DocsNextSearch } from './search';

const THEME_OPTIONS: { mode: KbqThemeMode; title: DocsNextI18nKey; icon: string }[] = [
    { mode: 'auto', title: 'themeAuto', icon: 'kbq-desktop_16' },
    { mode: 'light', title: 'themeLight', icon: 'kbq-sun_16' },
    { mode: 'dark', title: 'themeDark', icon: 'kbq-moon_16' }
];

/**
 * One row, left to right: logo, version, framework, sections, search, language, theme (spec/navigation/header.md).
 * The version and the framework are always in sight; on a tablet the framework links fold into one dropdown
 * (Figma: Navbar, 91:43170).
 */
@Component({
    selector: 'docs-next-header',
    imports: [
        RouterLink,
        KbqButtonModule,
        KbqDropdownModule,
        KbqIconModule,
        KbqOverflowItemsModule,
        DocsNextLogo,
        DocsNextSearch
    ],
    templateUrl: './header.html',
    styleUrl: './header.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: 'docs-next-header', role: 'banner' }
})
export class DocsNextHeader {
    protected readonly state = inject(DocsNextSiteState);
    private readonly theme = inject(KbqThemeService);

    protected readonly sections = DOCS_NEXT_SECTIONS;
    protected readonly frameworks = DOCS_NEXT_FRAMEWORKS;
    protected readonly frameworkTitle = docsNextFrameworkTitle;
    protected readonly shortTitle = docsNextVersionShortTitle;
    protected readonly locales: { id: DocsNextLocale; title: string }[] = [
        { id: 'ru', title: 'Русский' },
        { id: 'en', title: 'English' }
    ];
    protected readonly themeOptions = THEME_OPTIONS;
    protected readonly themeMode = this.theme.mode;
    protected readonly themeIcon = computed(
        () => THEME_OPTIONS.find(({ mode }) => mode === this.themeMode())?.icon ?? 'kbq-desktop_16'
    );

    protected frameworkUrl(framework: DocsNextFramework): string {
        return this.state.frameworkTarget(framework).url;
    }

    protected onFrameworkClick(framework: DocsNextFramework): void {
        this.state.setPendingNotice(this.state.frameworkTarget(framework).notice);
    }

    protected isSectionHidden(hiddenIds: ReadonlySet<unknown>): boolean {
        return hiddenIds.has(this.state.section());
    }

    protected setTheme(mode: KbqThemeMode): void {
        this.theme.setMode(mode);
    }
}
