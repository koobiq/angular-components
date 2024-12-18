import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { RdxRovingFocusItemDirective } from '@radix-ng/primitives/roving-focus';
import { BreadcrumbItem, KbqBreadcrumbs, KbqBreadcrumbsSeparator } from '../../components/breadcrumbs';
import { BreadcrumbsExamplesModule } from '../../docs-examples/components/breadcrumbs';

@Component({
    standalone: true,
    imports: [
        KbqBreadcrumbs,
        KbqBreadcrumbsSeparator,
        KbqLinkModule,
        RdxRovingFocusItemDirective,
        KbqButtonModule,
        KbqIconModule,
        RouterModule,
        BreadcrumbsExamplesModule,
        BreadcrumbItem
    ],
    selector: 'app',
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Breadcrumbs {
    data = ['Information Security', 'Access Control', 'Authorization', 'RBAC', 'Roles'];

    add() {
        this.data = [...this.data, 'test' + Math.random().toString()];
    }
}
