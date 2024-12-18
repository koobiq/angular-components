import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';

@Component({
    standalone: true,
    imports: [KbqIconModule, KbqLinkModule, RouterModule],
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
