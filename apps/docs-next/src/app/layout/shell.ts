import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DocsNextMobileHeader } from '../mobile/mobile-header';
import { DocsNextSiteState } from '../services/site-state';
import { DocsNextHeader } from './header';
import { DocsNextSideMenu } from './side-menu';

/**
 * Header over the side menu of the section and the page. The home page and the icons have no side menu. On a phone
 * the header gets its own layout and the side menu moves into the menu behind the burger.
 */
@Component({
    selector: 'docs-next-shell',
    imports: [RouterOutlet, DocsNextHeader, DocsNextMobileHeader, DocsNextSideMenu],
    template: `
        @if (state.isMobile()) {
            <docs-next-mobile-header />
        } @else {
            <docs-next-header />
        }
        <div class="docs-next-shell__body">
            @if (hasSideMenu() && !state.isMobile()) {
                <docs-next-side-menu class="docs-next-shell__aside" />
            }
            <main class="docs-next-shell__main">
                <router-outlet />
            </main>
        </div>
    `,
    styles: `
        :host {
            display: block;
        }

        .docs-next-shell__body {
            display: flex;
            align-items: flex-start;
        }

        .docs-next-shell__aside {
            position: sticky;
            top: var(--docs-next-header-height);
            flex: none;
            width: var(--docs-next-aside-width);
            height: calc(100vh - var(--docs-next-header-height));
        }

        .docs-next-shell__main {
            flex: 1;
            min-width: 0;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocsNextShell {
    protected readonly state = inject(DocsNextSiteState);

    protected readonly hasSideMenu = computed(() => {
        const section = this.state.section();

        return !!section && section !== 'icons';
    });
}
