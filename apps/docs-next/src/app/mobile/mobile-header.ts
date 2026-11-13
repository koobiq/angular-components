import { ChangeDetectionStrategy, Component, computed, inject, viewChild } from '@angular/core';
import { KbqIconButton, KbqIconModule } from '@koobiq/components/icon';
import { docsNextFrameworkTitle, docsNextVersionShortTitle } from '../data/site';
import { DocsNextLogo } from '../layout/logo';
import { DocsNextSearch } from '../layout/search';
import { DocsNextSiteState } from '../services/site-state';
import { DocsNextContextSheet } from './context-sheet';
import { DocsNextMobileMenu } from './mobile-menu';

/**
 * Header of the phone layout (spec/navigation/mobile.md; Figma: Navbar - Mobile, 65:16609): logo, version and
 * framework, search and the burger. It always sticks to the top.
 */
@Component({
    selector: 'docs-next-mobile-header',
    imports: [KbqIconButton, KbqIconModule, DocsNextContextSheet, DocsNextLogo, DocsNextMobileMenu, DocsNextSearch],
    template: `
        <div class="docs-next-mobile-header__start">
            <docs-next-logo />
            <button
                class="docs-next-mobile-header__context"
                type="button"
                [attr.aria-label]="contextLabel()"
                (click)="contextSheet().open()"
            >
                <span class="docs-next-menu-button__inner">
                    {{ context() }}
                    <i kbq-icon="kbq-chevron-down-s_16"></i>
                </span>
            </button>
        </div>

        <div class="docs-next-mobile-header__end">
            <button
                kbq-icon-button="kbq-magnifying-glass_16"
                class="docs-next-mobile-header__button"
                color="contrast"
                size="compact"
                type="button"
                [attr.aria-label]="state.t('search')"
                (click)="search().open()"
            ></button>
            <button
                kbq-icon-button="kbq-bars-horizontal_16"
                class="docs-next-mobile-header__button"
                color="contrast"
                size="compact"
                type="button"
                aria-haspopup="dialog"
                [attr.aria-label]="state.t('menu')"
                (click)="menu().open()"
            ></button>
        </div>

        <docs-next-search [withButton]="false" />
        <docs-next-context-sheet />
        <docs-next-mobile-menu />
    `,
    styleUrl: './mobile-header.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { role: 'banner' }
})
export class DocsNextMobileHeader {
    protected readonly state = inject(DocsNextSiteState);

    protected readonly search = viewChild.required(DocsNextSearch);
    protected readonly contextSheet = viewChild.required(DocsNextContextSheet);
    protected readonly menu = viewChild.required(DocsNextMobileMenu);

    protected readonly context = computed(() => {
        const version = docsNextVersionShortTitle(this.state.version());

        return `${version === 'Next' ? version : `v${version}`} · ${docsNextFrameworkTitle(this.state.framework())}`;
    });

    protected readonly contextLabel = computed(() => `${this.state.t('versionAndFramework')}: ${this.context()}`);
}
