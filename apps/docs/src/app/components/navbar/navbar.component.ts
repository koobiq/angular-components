import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqThemeMode, KbqThemeNames, KbqThemeService } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqTopBarModule } from '@koobiq/components/top-bar';
import { map, Observable } from 'rxjs';
import { DocsLocale } from 'src/app/constants/locale';
import { DOCS_TRANSLATIONS } from 'src/app/services/i18n';
import { DocsLocaleState } from 'src/app/services/locale';
import { DocsDocStates, DocsNavbarState } from '../../services/doc-states';
import { DocsDocsearchDirective } from '../docsearch/docsearch.directive';

/** A theme mode selectable from the navbar's theme dropdown. */
interface DocsThemeOption {
    mode: KbqThemeMode;
    title: Record<DocsLocale, string>;
}

@Component({
    selector: 'docs-navbar',
    imports: [
        RouterLink,
        KbqButtonModule,
        KbqDropdownModule,
        KbqLinkModule,
        KbqIconModule,
        KbqSelectModule,
        KbqTopBarModule,
        DocsDocsearchDirective,
        AsyncPipe
    ],
    templateUrl: 'navbar.template.html',
    styleUrls: ['navbar.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'docs-navbar'
    }
})
export class DocsNavbarComponent extends DocsLocaleState {
    private readonly themeService = inject(KbqThemeService);

    readonly docStates = inject(DocsDocStates);

    /** Options shown in the theme dropdown. `auto` follows the OS color scheme, handled inside `KbqThemeService`. */
    readonly themeOptions: DocsThemeOption[] = [
        { mode: 'auto', title: DOCS_TRANSLATIONS.themeSystem },
        { mode: KbqThemeNames.Default, title: DOCS_TRANSLATIONS.themeLight },
        { mode: KbqThemeNames.Dark, title: DOCS_TRANSLATIONS.themeDark }
    ];

    /** The currently selected mode — persistence and OS-preference resolution are handled by `KbqThemeService`. */
    readonly mode = computed(() => this.themeService.mode());

    readonly opened$: Observable<boolean> = this.docStates.navbarMenu.pipe(
        map((state) => state === DocsNavbarState.Opened)
    );

    toggleMenu() {
        this.docStates.toggleNavbarMenu();
    }

    setTheme(mode: DocsThemeOption['mode']) {
        this.themeService.mode.set(mode);
    }
}
