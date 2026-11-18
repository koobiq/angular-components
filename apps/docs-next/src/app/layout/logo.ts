import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { docsNextFrameworkTitle } from '../data/site';
import { DocsNextSiteState } from '../services/site-state';

/**
 * Logo leading to the home page. The letters are drawn through a mask so they follow the text color of the theme.
 */
@Component({
    selector: 'docs-next-logo',
    imports: [RouterLink],
    template: `
        <a class="docs-next-logo__link" [attr.aria-label]="label()" [routerLink]="state.link()">
            <img class="docs-next-logo__mark" alt="" height="27" src="assets/images/logo-mark.svg" width="27" />
            <span class="docs-next-logo__letters"></span>
        </a>
    `,
    styleUrl: './logo.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocsNextLogo {
    protected readonly state = inject(DocsNextSiteState);

    protected readonly frameworkTitle = computed(() => docsNextFrameworkTitle(this.state.framework()));
    protected readonly label = computed(() => `Koobiq ${this.frameworkTitle()}. ${this.state.t('toMainPage')}`);
}
