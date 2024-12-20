import { NgTemplateOutlet } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
    KbqBreadcrumbItem,
    KbqBreadcrumbs,
    KbqBreadcrumbsSeparator,
    KbqDefaultBreadcrumbStyler
} from '@koobiq/components/breadcrumbs';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { RdxRovingFocusItemDirective } from '@radix-ng/primitives/roving-focus';

/**
 * @title Breadcrumbs overview
 */
@Component({
    standalone: true,
    selector: 'breadcrumbs-overview-example',
    template: `
        <nav #breadcrumbs [max]="null" kbq-breadcrumbs size="compact">
            @for (section of data; track section; let last = $last) {
                <a *kbqBreadcrumbItem [routerLink]="section" [queryParams]="{ name: 'ferret' }">
                    <button
                        class="kbq-breadcrumb"
                        [disabled]="last"
                        [attr.aria-current]="last ? 'page' : null"
                        kbq-button
                        rdxRovingFocusItem
                        kbqBreadcrumb
                    >
                        {{ section }}
                    </button>
                </a>
            }
        </nav>

        <nav [max]="null" kbq-breadcrumbs>
            @for (section of data; track section; let last = $last) {
                <a *kbqBreadcrumbItem [routerLink]="section" [queryParams]="{ name: 'ferret' }">
                    <button
                        class="kbq-breadcrumb"
                        [disabled]="last"
                        [attr.aria-current]="last ? 'page' : null"
                        kbq-button
                        rdxRovingFocusItem
                        kbqBreadcrumb
                    >
                        {{ section }}
                    </button>
                </a>
            }
        </nav>
    `,
    imports: [
        KbqIconModule,
        KbqBreadcrumbs,
        RouterLink,
        KbqBreadcrumbsSeparator,
        KbqButtonModule,
        KbqBreadcrumbItem,
        RdxRovingFocusItemDirective,
        KbqDefaultBreadcrumbStyler,
        KbqDropdownModule,
        NgTemplateOutlet
    ]
})
export class BreadcrumbsOverviewExample {
    data = ['Information Security', 'Access Control', 'Authorization', 'RBAC', 'Roles'];
}
