import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KbqLink } from '@koobiq/components/link';
import { DocsLocaleState } from 'src/app/services/locale';

@Component({
    selector: 'docs-page-not-found',
    imports: [
        KbqLink,
        RouterLink
    ],
    template: `
        <h1 class="docs-page-not-found__title kbq-display-compact">{{ t('pageNotFound') }}</h1>

        <a class="layout-margin-top-s" kbqLink routerLink="/">
            {{ t('goToMainPage') }}
        </a>
    `,
    styleUrl: 'page-not-found.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'docs-page-not-found',
        role: 'main'
    }
})
export class DocsPageNotFoundComponent extends DocsLocaleState {}
