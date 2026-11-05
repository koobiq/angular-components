import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqThemeMode, KbqThemeService } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqOverflowItemsModule } from '@koobiq/components/overflow-items';
import { DOCS_NEXT_SECTIONS, DocsNextSection } from '../data/sections';
import {
    DOCS_NEXT_FRAMEWORKS,
    DocsNextFramework,
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

/** The fewest sections "More" holds once it shows at all. */
const MIN_HIDDEN_SECTIONS = 2;

interface DocsNextHeaderGroup {
    id: string;
    sections: readonly DocsNextSection[];
}

/**
 * Hiding goes from the end, one item at a time, so the last `MIN_HIDDEN_SECTIONS` sections make one item: they leave
 * the row together, and the menu that takes them never holds a lone entry.
 */
const docsNextHeaderGroups = (sections: readonly DocsNextSection[]): DocsNextHeaderGroup[] => {
    const head = sections.slice(0, -MIN_HIDDEN_SECTIONS);
    const tail = sections.slice(-MIN_HIDDEN_SECTIONS);

    return [
        ...head.map((section) => ({ id: section.id, sections: [section] })),
        { id: tail.map(({ id }) => id).join('+'), sections: tail }
    ];
};

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
    /** The sections the way the header hides them: the last ones are one item, so that "More" never holds just one. */
    protected readonly groups = docsNextHeaderGroups(DOCS_NEXT_SECTIONS);
    private readonly groupIds = new Map(this.groups.flatMap(({ id, sections }) => sections.map((s) => [s.id, id])));
    protected readonly frameworks = DOCS_NEXT_FRAMEWORKS;
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

    protected isHidden(hiddenIds: ReadonlySet<unknown>, sectionId: string | null): boolean {
        return !!sectionId && hiddenIds.has(this.groupIds.get(sectionId));
    }

    protected isSectionHidden(hiddenIds: ReadonlySet<unknown>): boolean {
        return this.isHidden(hiddenIds, this.state.section());
    }

    protected setTheme(mode: KbqThemeMode): void {
        this.theme.setMode(mode);
    }
}
