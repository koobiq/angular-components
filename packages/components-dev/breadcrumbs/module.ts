import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqLinkModule } from '@koobiq/components/link';
import { RdxRovingFocusItemDirective } from '@radix-ng/primitives/roving-focus';
import { KbqBreadcrumb, KbqBreadcrumbs, KbqBreadcrumbsItem, KbqDefaultBreadcrumb } from '../../components/breadcrumbs';

@Component({
    standalone: true,
    imports: [
        KbqBreadcrumb,
        KbqBreadcrumbs,
        KbqBreadcrumbsItem,
        KbqDefaultBreadcrumb,
        KbqLinkModule,
        RdxRovingFocusItemDirective,
        KbqButtonModule
    ],
    selector: 'app',
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Breadcrumbs {
    data = ['Information Security', 'Access Control', 'Authorization', 'RBAC', 'Roles'];
}
