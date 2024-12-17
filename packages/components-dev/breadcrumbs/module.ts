import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { RdxRovingFocusItemDirective } from '@radix-ng/primitives/roving-focus';
import {
    KbqBreadcrumb,
    KbqBreadcrumbItem,
    KbqBreadcrumbs,
    KbqBreadcrumbsSeparator,
    KbqDefaultBreadcrumb
} from '../../components/breadcrumbs';

@Component({
    standalone: true,
    imports: [
        KbqBreadcrumb,
        KbqBreadcrumbs,
        KbqBreadcrumbItem,
        KbqBreadcrumbsSeparator,
        KbqDefaultBreadcrumb,
        KbqLinkModule,
        RdxRovingFocusItemDirective,
        KbqButtonModule,
        KbqIconModule,
        RouterModule
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
