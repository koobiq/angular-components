import { AsyncPipe } from '@angular/common';
import { Component, inject, OnDestroy, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqTheme, KbqThemeSelector, ThemeService } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqNavbarModule } from '@koobiq/components/navbar';
import { KbqSelectModule } from '@koobiq/components/select';
import { map, Observable } from 'rxjs';
import { DocsLocale } from 'src/app/constants/locale';
import { DocsLocaleService } from 'src/app/services/locale.service';
import { DocsNavbarState, DocStates } from '../../services/doc-states';
import { DocsearchDirective } from '../docsearch/docsearch.directive';
import { NavbarProperty } from './navbar-property';

@Component({
    standalone: true,
    imports: [
        RouterLink,
        KbqButtonModule,
        KbqDropdownModule,
        KbqLinkModule,
        KbqIconModule,
        KbqSelectModule,
        KbqNavbarModule,
        DocsearchDirective,
        AsyncPipe
    ],
    selector: 'docs-navbar',
    templateUrl: 'navbar.template.html',
    styleUrls: ['navbar.scss'],
    host: {
        class: 'docs-navbar'
    },
    encapsulation: ViewEncapsulation.None
})
export class DocsNavbarComponent implements OnDestroy {
    readonly docStates = inject(DocStates);
    readonly docsLocaleService = inject(DocsLocaleService);

    readonly themeSwitch: NavbarProperty;
    readonly docsLocale = DocsLocale;

    // To add for checking of current color theme of OS preferences
    private readonly colorAutomaticTheme = window.matchMedia('(prefers-color-scheme: light)');

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
        map((state) => state === DocsNavbarState.opened)
    );

    constructor(private readonly themeService: ThemeService) {
        // set custom theme configs for light/dark themes
        this.themeService.setThemes(this.kbqThemes);

        this.themeSwitch = new NavbarProperty({
            property: 'docs_theme',
            data: this.kbqThemes,
            updateSelected: false
        });

        // set theme when retrieval from storage completed
        this.themeService.setTheme(this.themeSwitch.currentValue);

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
        this.themeService.themes[0] = {
            ...this.themeService.themes[0],
            className: e.matches ? KbqThemeSelector.Default : KbqThemeSelector.Dark
        };

        if (this.themeService.themes[0].selected) {
            this.setTheme(0);
        }
    };
}
