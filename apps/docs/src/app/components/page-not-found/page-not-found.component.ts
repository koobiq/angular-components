import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KbqLinkModule } from '@koobiq/components/link';

@Component({
    standalone: true,
    imports: [
        KbqLinkModule,
        RouterLink
    ],
    selector: 'docs-page-not-found',
    templateUrl: 'page-not-found.html',
    styleUrls: ['page-not-found.scss'],
    host: {
        class: 'docs-page-not-found'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class PageNotFoundComponent {}
