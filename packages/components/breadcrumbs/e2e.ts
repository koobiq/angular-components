import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KbqButton, KbqButtonCssStyler } from '@koobiq/components/button';
import { KbqDefaultSizes } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqBreadcrumbsModule } from './breadcrumbs.module';
import { KbqBreadcrumbsWrapMode } from './breadcrumbs.types';

type BreadcrumbState = {
    size: KbqDefaultSizes;
    firstItemNegativeMargin: boolean;
    wrapMode: KbqBreadcrumbsWrapMode;
    max: number | null;
    maxWidth?: number;
};

@Component({
    selector: 'e2e-breadcrumbs-state-and-style',
    imports: [
        KbqBreadcrumbsModule,
        RouterLink,
        KbqButton,
        KbqButtonCssStyler,
        KbqIcon,
        KbqDropdownModule
    ],
    template: `
        <div>
            <table data-testid="e2eBreadcrumbsTable">
                @for (row of states; track $index) {
                    <tr>
                        @for (cell of row; track $index) {
                            <td>
                                <nav
                                    kbq-breadcrumbs
                                    [size]="cell.size"
                                    [max]="cell.max"
                                    [firstItemNegativeMargin]="cell.firstItemNegativeMargin"
                                    [wrapMode]="cell.wrapMode"
                                    [style.max-width.px]="cell.maxWidth"
                                >
                                    @for (breadcrumb of items; track breadcrumb) {
                                        <kbq-breadcrumb-item [text]="breadcrumb" [routerLink]="breadcrumb" />
                                    }
                                </nav>
                            </td>
                        }
                    </tr>
                }
                <tr>
                    <td>
                        <nav kbq-breadcrumbs [firstItemNegativeMargin]="false">
                            @for (breadcrumb of items; track breadcrumb) {
                                <kbq-breadcrumb-item [text]="breadcrumb" [routerLink]="breadcrumb">
                                    <a
                                        *kbqBreadcrumbView
                                        tabindex="-1"
                                        kbq-button
                                        kbqBreadcrumb
                                        [focusable]="!$last"
                                        [routerLink]="breadcrumb"
                                        [disabled]="$last"
                                        [attr.aria-current]="$last ? 'page' : null"
                                    >
                                        {{ breadcrumb }}
                                        <i kbq-icon="kbq-file-code-o_16"></i>
                                    </a>
                                </kbq-breadcrumb-item>
                            }
                        </nav>
                    </td>
                </tr>

                <tr data-testid="e2eBreadcrumbsDropdownRow">
                    <td>
                        <nav kbq-breadcrumbs [firstItemNegativeMargin]="false">
                            @for (breadcrumb of items; track breadcrumb) {
                                <kbq-breadcrumb-item [text]="breadcrumb" [routerLink]="breadcrumb">
                                    <a
                                        *kbqBreadcrumbView
                                        tabindex="-1"
                                        kbq-button
                                        kbqBreadcrumb
                                        [routerLink]="breadcrumb"
                                    >
                                        {{ breadcrumb }}
                                        <i kbq-icon="kbq-file-code-o_16"></i>
                                    </a>
                                </kbq-breadcrumb-item>
                            }
                            <kbq-breadcrumb-item>
                                <div *kbqBreadcrumbView>
                                    <button kbq-button kbqBreadcrumb [kbqDropdownTriggerFor]="siblingsListDropdown">
                                        Access Control
                                        <i kbq-icon="kbq-chevron-down-s_16"></i>
                                    </button>
                                </div>
                            </kbq-breadcrumb-item>

                            <kbq-dropdown #siblingsListDropdown="kbqDropdown">
                                <a kbq-dropdown-item routerLink="./RBAC">RBAC</a>
                                <a kbq-dropdown-item routerLink="./ABAC">ABAC</a>
                            </kbq-dropdown>
                        </nav>
                    </td>
                </tr>
            </table>
        </div>
    `,
    styles: `
        td {
            border-spacing: 0;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-top-l layout-margin-bottom-l layout-column',
        'data-testid': 'e2eBreadcrumbsStateAndStyle'
    }
})
export class E2eBreadcrumbsStateAndStyle {
    items = Array.from({ length: 5 }, (_, i) => `Item #${i}`);

    protected readonly states: BreadcrumbState[][] = [
        ...(['compact', 'normal', 'big'] satisfies KbqDefaultSizes[]).map((size) => [
            {
                size,
                firstItemNegativeMargin: false,
                wrapMode: <KbqBreadcrumbsWrapMode>'auto',
                max: 4
            }
        ]),
        ...(['auto', 'wrap', 'none'] satisfies KbqBreadcrumbsWrapMode[]).map((wrapMode, index) => [
            {
                size: <KbqDefaultSizes>'normal',
                firstItemNegativeMargin: false,
                wrapMode: wrapMode,
                max: 4,
                maxWidth: index > 0 ? 300 : undefined
            }
        ]),
        [
            {
                size: 'normal',
                firstItemNegativeMargin: false,
                wrapMode: <KbqBreadcrumbsWrapMode>'auto',
                max: 2
            }
        ]
    ];
}
