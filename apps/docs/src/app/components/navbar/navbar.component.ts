import { AsyncPipe } from '@angular/common';
import { afterNextRender, ChangeDetectorRef, Component, inject, OnDestroy, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KbqButtonModule } from '@koobiq/components/button';
import { KBQ_WINDOW, KbqTheme, KbqThemeSelector, ThemeService } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqNavbarModule } from '@koobiq/components/navbar';
import { KbqSelectModule } from '@koobiq/components/select';
import { map, Observable } from 'rxjs';
import { DocsLocale } from 'src/app/constants/locale';
import { DocsLocaleState } from 'src/app/services/locale';
import { DocsDocStates, DocsNavbarState } from '../../services/doc-states';
import { DocsDocsearchDirective } from '../docsearch/docsearch.directive';
import { DocsNavbarProperty } from './navbar-property';

@Component({
    selector: 'docs-navbar',
    imports: [
        RouterLink,
        KbqButtonModule,
        KbqDropdownModule,
        KbqLinkModule,
        KbqIconModule,
        KbqSelectModule,
        KbqNavbarModule,
        DocsDocsearchDirective,
        AsyncPipe
    ],
    templateUrl: 'navbar.template.html',
    styleUrls: ['navbar.scss'],
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'docs-navbar'
    }
})
export class DocsNavbarComponent extends DocsLocaleState implements OnDestroy {
    private readonly window = inject(KBQ_WINDOW);
    private readonly cdr = inject(ChangeDetectorRef);
    private readonly themeService = inject(ThemeService);

    readonly docStates = inject(DocsDocStates);

    readonly themeSwitch: DocsNavbarProperty;

    // To add for checking of current color theme of OS preferences
    private readonly colorAutomaticTheme = this.window.matchMedia('(prefers-color-scheme: light)');

    private readonly kbqThemes: (KbqTheme & { title: Record<DocsLocale, string> })[] = [
        {
            name: 'system',
            className: this.colorAutomaticTheme.matches ? KbqThemeSelector.Default : KbqThemeSelector.Dark,
            selected: false,
            title: {
                ru: 'Как в системе',
                en: 'Same as system'
            }
        },
        {
            name: 'light',
            className: KbqThemeSelector.Default,
            selected: false,
            title: {
                ru: 'Светлая',
                en: 'Light'
            }
        },
        {
            name: 'dark',
            className: KbqThemeSelector.Dark,
            selected: false,
            title: {
                ru: 'Тёмная',
                en: 'Dark'
            }
        }
    ];

    readonly opened$: Observable<boolean> = this.docStates.navbarMenu.pipe(
        map((state) => state === DocsNavbarState.Opened)
    );

    constructor() {
        super();

        // set custom theme configs for light/dark themes
        this.themeService.setThemes(this.kbqThemes);

        this.themeSwitch = new DocsNavbarProperty({
            property: 'docs_theme',
            data: this.kbqThemes,
            updateSelected: false
        });

        // set theme when retrieval from storage completed
        afterNextRender(() => {
            this.themeService.setTheme(this.themeSwitch.currentValue);
            // prevent NG0100 error
            this.cdr.markForCheck();
        });

        try {
            // Chrome & Firefox
            this.colorAutomaticTheme.addEventListener('change', this.setAutoTheme);
        } catch (err) {
            try {
                // Safari
                this.colorAutomaticTheme.addListener(this.setAutoTheme);
            } catch (errSafari) {
                console.error(errSafari);
            }
        }
    }

    ngOnDestroy() {
        // eslint-disable-next-line @angular-eslint/no-lifecycle-call
        this.themeService.ngOnDestroy();

        try {
            this.colorAutomaticTheme.removeEventListener('change', this.setAutoTheme);
        } catch (err) {
            console.error(err);
        }
    }

    toggleMenu() {
        this.docStates.toggleNavbarMenu();
    }

    setTheme(i: number) {
        // should be set to keep theme index in storage
        this.themeSwitch.setValue(i);
        this.themeService.setTheme(i);
    }

    private setAutoTheme = (e) => {
        if (!this.themeService.themes[0]) return;

        this.themeService.themes[0] = {
            ...this.themeService.themes[0],
            className: e.matches ? KbqThemeSelector.Default : KbqThemeSelector.Dark
        };

        if (this.themeService.themes[0].selected) {
            this.setTheme(0);
        }
    };
}
