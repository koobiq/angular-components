import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BreadcrumbItem, KbqBreadcrumbBehavior, KbqBreadcrumbs } from '@koobiq/components/breadcrumbs';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * @title Breadcrumbs sizes
 */
@Component({
    standalone: true,
    selector: 'breadcrumbs-dropdown-example',
    template: `
        <nav kbq-breadcrumbs>
            @if (true) {}
            <breadcrumb-item>
                <a
                    [queryParams]="{ queryParams: 'queryParams' }"
                    [fragment]="'fragment'"
                    kbq-button
                    kbqBreadcrumb
                    routerLink="Information Security"
                >
                    Information Security
                </a>
            </breadcrumb-item>

            <breadcrumb-item>
                <a
                    [queryParams]="{ queryParams: 'queryParams' }"
                    [fragment]="'fragment'"
                    kbq-button
                    kbqBreadcrumb
                    routerLink="Access Control"
                >
                    Access Control
                </a>
            </breadcrumb-item>
            <breadcrumb-item>
                <a
                    [queryParams]="{ queryParams: 'queryParams' }"
                    [fragment]="'fragment'"
                    kbq-button
                    kbqBreadcrumb
                    routerLink="Authorization"
                >
                    Authorization
                </a>
            </breadcrumb-item>

            <breadcrumb-item>
                <button kbq-button kbqBreadcrumb>
                    Access Control
                    <i kbq-icon="kbq-chevron-down-s_16"></i>
                </button>
            </breadcrumb-item>
        </nav>
    `,
    imports: [
        KbqBreadcrumbs,
        RouterLink,
        BreadcrumbItem,
        KbqButtonModule,
        KbqBreadcrumbBehavior,
        KbqIconModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreadcrumbsDropdownExample {}
