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
        <div class="kbq-display-compact">{{ t('pageNotFound') }}</div>

        <a class="layout-margin-top-s" kbqLink routerLink="/">
            {{ t('goToMainPage') }}
        </a>
    `,
    styleUrls: ['page-not-found.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'docs-page-not-found'
    }
})
export class DocsPageNotFoundComponent extends DocsLocaleState {}
