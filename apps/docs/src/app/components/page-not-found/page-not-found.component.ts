import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KbqLinkModule } from '@koobiq/components/link';
import { DocsLocaleState } from 'src/app/services/locale';

@Component({
    standalone: true,
    imports: [
        KbqLinkModule,
        RouterLink
    ],
    selector: 'docs-page-not-found',
    template: `
        <div class="kbq-display-compact">{{ isRuLocale() ? 'Страница не найдена' : 'Page not found' }}</div>

        <a class="layout-margin-top-s" kbq-link routerLink="/">
            {{ isRuLocale() ? 'Перейти на главную страницу' : 'Go to main page' }}
        </a>
    `,
    styleUrls: ['page-not-found.scss'],
    host: {
        class: 'docs-page-not-found'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class PageNotFoundComponent extends DocsLocaleState {}
