import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KbqLinkModule } from '@koobiq/components/link';
import { DocsLocale } from 'src/app/constants/locale';
import { DocsLocaleService } from 'src/app/services/locale.service';

@Component({
    standalone: true,
    imports: [
        KbqLinkModule,
        RouterLink,
        AsyncPipe
    ],
    selector: 'docs-page-not-found',
    template: `
        @let locale = docsLocaleService.changes | async;
        @let isRuLocale = locale === DocsLocale.Ru;

        <div class="kbq-display-compact">{{ isRuLocale ? 'Страница не найдена' : 'Page not found' }}</div>

        <a class="layout-margin-top-s" kbq-link routerLink="/">
            {{ isRuLocale ? 'Перейти на главную страницу' : 'Go to main page' }}
        </a>
    `,
    styleUrls: ['page-not-found.scss'],
    host: {
        class: 'docs-page-not-found'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class PageNotFoundComponent {
    readonly docsLocaleService = inject(DocsLocaleService);
    readonly DocsLocale = DocsLocale;
}
