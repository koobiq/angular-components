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
    standalone: true,
    selector: 'breadcrumbs-truncate-center-items-example',
    template: `
        <nav class="kbq-breadcrumbs_truncate-last-by-center" size="compact" kbq-breadcrumbs>
            @for (breadcrumb of breadcrumbs; track breadcrumb; let last = $last) {
                <kbq-breadcrumb-item
                    [routerLink]="breadcrumb"
                    [queryParams]="{ queryParams: breadcrumb }"
                    [fragment]="breadcrumb"
                    [text]="breadcrumb"
                >
                    <a *kbqBreadcrumbView>
                        <button [attr.aria-current]="last ? 'page' : null" [disabled]="last" kbq-button kbqBreadcrumb>
                            <span
                                [kbqEllipsisCenter]="breadcrumb"
                                [minVisibleLength]="15"
                                [charWidth]="5"
                                [kbqPlacementPriority]="PopUpPlacements.Bottom"
                                [kbqTooltipArrow]="false"
                            ></span>
                        </button>
                    </a>
                </kbq-breadcrumb-item>
            }
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

            .data-text-start {
                flex: 0 1 auto;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: pre;
            }

            .data-text-end {
                flex: 1 0 auto;
                overflow: hidden;
                white-space: pre;
            }
        }
    `,
    imports: [
        RouterLink,
        KbqBreadcrumbsModule,
        KbqEllipsisCenterModule,
        KbqToolTipModule,
        KbqButtonModule
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreadcrumbsTruncateCenterItemsExample {
    breadcrumbs = ['branch', 'Users', 'Report dated 28.08.2018'];
    protected readonly PopUpPlacements = PopUpPlacements;
}
