import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KbqBreadcrumbsModule } from '@koobiq/components/breadcrumbs';
import { KbqButtonModule } from '@koobiq/components/button';
import { PopUpPlacements } from '@koobiq/components/core';
import { KbqEllipsisCenterModule } from '@koobiq/components/ellipsis-center';
import { KbqToolTipModule } from '@koobiq/components/tooltip';

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
        <nav class="kbq-breadcrumbs_truncate-last-by-center" size="compact" kbq-breadcrumbs>
            <kbq-breadcrumb-item routerLink="./groups" text="Groups" />
            <kbq-breadcrumb-item routerLink="./users" text="Users" />

            <kbq-breadcrumb-item text="Report dated 28.08.2018">
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
        .kbq-breadcrumbs_truncate-last-by-center {
            .kbq-breadcrumb-item:last-of-type {
                max-width: 124px;

                .kbq-button-wrapper {
                    display: inline-block;
                    flex-grow: 1;
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                }
            }
        }

        .kbq-ellipsis-center {
            position: relative;
            display: flex;

            .kbq-ellipsis-center_data-text-start {
                flex: 0 1 auto;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: pre;
            }

            .kbq-ellipsis-center_data-text-end {
                flex: 1 0 auto;
                overflow: hidden;
                white-space: pre;
            }
        }
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreadcrumbsTruncateCenterItemsExample {
    breadcrumbs = ['branch', 'Users', 'Report dated 28.08.2018'];
    protected readonly PopUpPlacements = PopUpPlacements;
}
