import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KbqLinkModule } from '@koobiq/components/link';
import { DocsLocaleState } from 'src/app/services/locale';

@Component({
    selector: 'docs-page-not-found',
    imports: [
        KbqLinkModule,
        RouterLink
    ],
    template: `
        <div class="kbq-display-compact">{{ isRuLocale() ? 'Страница не найдена' : 'Page not found' }}</div>

        <a class="layout-margin-top-s" kbq-link routerLink="/">
            {{ isRuLocale() ? 'Перейти на главную страницу' : 'Go to main page' }}
        </a>
    `,
    styleUrls: ['page-not-found.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'docs-page-not-found'
    }
})
export class DocsPageNotFoundComponent extends DocsLocaleState {}
