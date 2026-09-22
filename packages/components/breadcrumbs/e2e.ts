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
    disabled?: boolean;
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
        @for (row of states; track $index) {
            @for (cell of row; track $index) {
                <nav
                    kbq-breadcrumbs
                    [size]="cell.size"
                    [max]="cell.max"
                    [firstItemNegativeMargin]="cell.firstItemNegativeMargin"
                    [wrapMode]="cell.wrapMode"
                    [disabled]="!!cell.disabled"
                    [style.max-width.px]="cell.maxWidth"
                >
                    @for (breadcrumb of items; track breadcrumb) {
                        <kbq-breadcrumb-item [text]="breadcrumb" [routerLink]="breadcrumb" />
                    }
                </nav>
            }
        }

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

        <nav kbq-breadcrumbs data-testid="e2eBreadcrumbsWithDropdown" [firstItemNegativeMargin]="false">
            @for (breadcrumb of items; track breadcrumb) {
                <kbq-breadcrumb-item [text]="breadcrumb" [routerLink]="breadcrumb">
                    <a *kbqBreadcrumbView tabindex="-1" kbq-button kbqBreadcrumb [routerLink]="breadcrumb">
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

        <!--
            The negative margin together with collapsing driven by width alone. The rows above cannot
            catch a margin that leaks into the layout the trail is measured against: they cap the trail
            with its own max-width, which clamps it whatever the margin does, and they hide by \`max\`,
            which counts rather than measures. Here the width comes from a constrained parent — the
            shape every consumer actually writes — so the margin has to stay off the host: carried
            there, it is subtracted from the space the flex algorithm hands the trail, KbqOverflowItems
            measures a box that is never squeezed, and the row spills out uncut instead of collapsing.
        -->
        <div class="e2e-breadcrumbs-constrained">
            <nav kbq-breadcrumbs [firstItemNegativeMargin]="true" [max]="null">
                @for (breadcrumb of items; track breadcrumb) {
                    <kbq-breadcrumb-item [text]="breadcrumb" [routerLink]="breadcrumb" />
                }
            </nav>
        </div>
    `,
    styles: `
        :host {
            display: inline-flex;
            flex-direction: column;
            gap: var(--kbq-size-xs);
            padding: var(--kbq-size-s);
        }

        .e2e-breadcrumbs-constrained {
            display: flex;
            width: 300px;
            overflow: hidden;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
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
        ],
        // The negative margin applies in every wrap mode, so these three rows must share one left edge.
        ...(['auto', 'wrap', 'none'] satisfies KbqBreadcrumbsWrapMode[]).map((wrapMode) => [
            {
                size: <KbqDefaultSizes>'normal',
                firstItemNegativeMargin: true,
                wrapMode,
                max: 4,
                maxWidth: 300
            }
        ]),
        [
            {
                size: 'normal',
                firstItemNegativeMargin: false,
                wrapMode: <KbqBreadcrumbsWrapMode>'auto',
                max: 4,
                disabled: true
            }
        ]
    ];
}

@Component({
    selector: 'e2e-breadcrumbs-overflow-max',
    imports: [
        KbqBreadcrumbsModule,
        RouterLink
    ],
    template: `
        <nav kbq-breadcrumbs data-testid="e2eBreadcrumbsOverflowMax" [max]="max">
            @for (breadcrumb of items; track breadcrumb) {
                <kbq-breadcrumb-item [text]="breadcrumb" [routerLink]="breadcrumb" />
            }
        </nav>

        <!-- Container used for width overflow tests -->
        <nav kbq-breadcrumbs data-testid="e2eBreadcrumbsOverflow" [max]="null">
            @for (breadcrumb of items; track breadcrumb) {
                <kbq-breadcrumb-item [text]="breadcrumb" [routerLink]="breadcrumb" />
            }
        </nav>
    `,
    styles: `
        :host {
            display: block;
            padding: var(--kbq-size-s);
            width: 300px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eBreadcrumbsOverflowMaxHost'
    }
})
export class E2eBreadcrumbsOverflowMax {
    readonly max = 4;
    readonly items = Array.from({ length: 5 }, (_, i) => `Item #${i}`);
}
