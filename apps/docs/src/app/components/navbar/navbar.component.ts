import { Component, OnDestroy, ViewEncapsulation } from '@angular/core';
import { KbqTheme, KbqThemeSelector, ThemeService } from '@koobiq/components/core';
import { koobiqVersion } from '../../version';
import { DocStates, DocsNavbarState } from '../doс-states';
import { NavbarProperty, NavbarPropertyParameters } from './navbar-property';

@Component({
    selector: 'docs-navbar',
    templateUrl: 'navbar.template.html',
    styleUrls: ['navbar.scss'],
    host: {
        class: 'docs-navbar'
    },
    encapsulation: ViewEncapsulation.None
})
export class NavbarComponent implements OnDestroy {
    version = koobiqVersion;

    themeSwitch: NavbarProperty;

    // To add for checking of current color theme of OS preferences
    colorAutomaticTheme = window.matchMedia('(prefers-color-scheme: light)');

    kbqThemes: KbqTheme[] = [
        {
            name: 'Как в системе',
            className: this.colorAutomaticTheme.matches ? KbqThemeSelector.Default : KbqThemeSelector.Dark,
            selected: false
        },
        {
            name: 'Светлая',
            className: KbqThemeSelector.Default,
            selected: false
        },
        {
            name: 'Тёмная',
            className: KbqThemeSelector.Dark,
            selected: false
        }
    ];

    opened: boolean;

    private themeProperty: NavbarPropertyParameters = {
        property: 'docs_theme',
        data: this.kbqThemes,
        updateTemplate: false,
        updateSelected: false
    };

    constructor(
        private themeService: ThemeService,
        public docStates: DocStates
    ) {
        // set custom theme configs for light/dark themes
        this.themeService.setThemes(this.kbqThemes);

        this.themeSwitch = new NavbarProperty(this.themeProperty);

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

        this.docStates.navbarMenu.subscribe((state) => (this.opened = state === DocsNavbarState.opened));
    }

    ngOnDestroy() {
        this.themeService.ngOnDestroy();
        try {
            // Chrome & Firefox
            this.colorAutomaticTheme.removeEventListener('change', this.setAutoTheme);
        } catch (err) {
            try {
                // Safari
                this.colorAutomaticTheme.removeListener(this.setAutoTheme);
            } catch (errSafari) {
                console.error(errSafari);
            }
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
