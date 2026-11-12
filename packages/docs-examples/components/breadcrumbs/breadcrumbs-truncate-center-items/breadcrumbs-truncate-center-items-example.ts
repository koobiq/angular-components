import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KbqBreadcrumbsModule } from '@koobiq/components/breadcrumbs';
import { KbqButtonModule } from '@koobiq/components/button';
import { PopUpPlacements } from '@koobiq/components/core';
import { KbqEllipsisCenterModule } from '@koobiq/components/ellipsis-center';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleText, TEXT } from './l10n';

/**
 * @title Breadcrumbs Truncate Center Items
 */
@Component({
    selector: 'breadcrumbs-truncate-center-items-example',
    imports: [
        RouterLink,
        KbqBreadcrumbsModule,
        KbqEllipsisCenterModule,
        KbqToolTipModule,
        KbqButtonModule
    ],
    template: `
        <nav class="example-breadcrumbs_truncate-last-by-center" size="compact" kbq-breadcrumbs>
            <kbq-breadcrumb-item routerLink="./groups" [text]="text().groups" />
            <kbq-breadcrumb-item routerLink="./users" [text]="text().users" />

            <kbq-breadcrumb-item [text]="text().reportDated">
                <ng-container *kbqBreadcrumbView>
                    <a routerLink="./report" tabindex="-1">
                        <button aria-current="page" disabled kbq-button kbqBreadcrumb>
                            <span
                                kbqEllipsisCenter="Report dated 28.08.2018"
                                [minVisibleLength]="15"
                                [charWidth]="5"
                                [kbqPlacementPriority]="PopUpPlacements.Bottom"
                                [kbqTooltipArrow]="false"
                            ></span>
                        </button>
                    </a>
                </ng-container>
            </kbq-breadcrumb-item>
        </nav>
    `,
    styles: `
        /* A width is all the breadcrumb needs: the button already ships the truncation contract, and
           kbqEllipsisCenter measures the width the button leaves it. */
        .example-breadcrumbs_truncate-last-by-center {
            .kbq-breadcrumb-item:last-of-type {
                max-width: 124px;
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class BreadcrumbsTruncateCenterItemsExample extends BaseLocalizedExample<ExampleText> {
    protected readonly PopUpPlacements = PopUpPlacements;

    constructor() {
        super(TEXT);
    }
}
