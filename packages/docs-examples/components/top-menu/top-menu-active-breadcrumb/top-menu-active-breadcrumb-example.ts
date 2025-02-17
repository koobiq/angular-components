import { BreakpointObserver } from '@angular/cdk/layout';
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, Input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { KbqBreadcrumbsModule } from '@koobiq/components/breadcrumbs';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors, PopUpPlacements } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqPopoverModule } from '@koobiq/components/popover';
import { KbqTextareaModule } from '@koobiq/components/textarea';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { KbqTopMenuModule } from '@koobiq/components/top-menu';

/**
 * @title TopMenu Active Breadcrumb
 */
@Component({
    standalone: true,
    selector: 'top-menu-active-breadcrumb-example',
    imports: [
        FormsModule,
        AsyncPipe,
        RouterLink,
        KbqTopMenuModule,
        KbqButtonModule,
        KbqToolTipModule,
        KbqIcon,
        KbqBreadcrumbsModule,
        KbqFormFieldModule,
        KbqInputModule,
        KbqTextareaModule,
        KbqPopoverModule
    ],
    styleUrls: [],
    template: `
        @let isDesktopMatches = !!(isDesktop | async)?.matches;
        <kbq-top-menu>
            <div class="kbq-top-menu-container__left layout-row layout-align-center-center">
                <div class="layout-row layout-padding-m flex-none">
                    <i class="layout-row flex" kbq-icon="kbq-dashboard_16"></i>
                </div>
                <div class="kbq-top-menu__breadcrumbs">
                    <nav kbq-breadcrumbs>
                        <kbq-breadcrumb-item text="Dashboards" routerLink="./dashboards" />

                        <kbq-breadcrumb-item text="Dashboards">
                            <a *kbqBreadcrumbView tabindex="-1">
                                <button
                                    class="kbq-dropdown-trigger"
                                    #kbqPopover="kbqPopover"
                                    [kbqPopoverContent]="popoverContent"
                                    [kbqPopoverPlacement]="PopUpPlacements.BottomLeft"
                                    [kbqTooltipDisabled]="isDesktopMatches"
                                    [kbqPlacement]="PopUpPlacements.Bottom"
                                    [kbqTooltip]="breadcrumbActionText"
                                    kbqPopoverClass="dashboard__input"
                                    kbq-button
                                    kbqBreadcrumb
                                    kbqPopover
                                >
                                    @if (isDesktopMatches) {
                                        {{ breadcrumbActionText }}
                                    }
                                    <i kbq-icon="kbq-pencil_16"></i>
                                </button>

                                <ng-template #popoverContent>
                                    <kbq-form-field class="layout-margin-bottom-l">
                                        <input
                                            [ngModel]="value()"
                                            (ngModelChange)="value.set($event)"
                                            kbqInput
                                            placeholder="Name*"
                                        />
                                    </kbq-form-field>

                                    <kbq-form-field>
                                        <textarea placeholder="Description" kbqTextarea></textarea>
                                    </kbq-form-field>
                                </ng-template>
                            </a>
                        </kbq-breadcrumb-item>
                    </nav>
                </div>
            </div>
            <div class="kbq-top-menu__spacer"></div>
            <div class="kbq-top-menu-container__right layout-row">
                @for (action of actions; track index; let index = $index) {
                    <button
                        [kbqStyle]="action.style || ''"
                        [color]="action.color || ''"
                        [kbqTooltipDisabled]="isDesktopMatches"
                        [kbqPlacement]="PopUpPlacements.Bottom"
                        [kbqTooltip]="action.title"
                        [disabled]="action.disabled && action.disabled()"
                        kbq-button
                    >
                        @if (!isDesktopMatches && action.icon) {
                            <i [class]="action.icon" kbq-icon=""></i>
                        }
                        @if (isDesktopMatches) {
                            {{ action.title }}
                        }
                    </button>
                }
            </div>
        </kbq-top-menu>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopMenuActiveBreadcrumbExample {
    @Input() iconVisible: boolean = true;
    value = signal(null);

    readonly breadcrumbActionText = 'New dashboard';
    readonly actions = [
        {
            title: 'Add widget',
            style: KbqButtonStyles.Transparent,
            color: KbqComponentColors.Contrast,
            icon: 'kbq-plus_16'
        },
        {
            title: 'Cancel',
            style: KbqButtonStyles.Outline,
            color: KbqComponentColors.ContrastFade,
            icon: 'kbq-undo_16'
        },
        {
            title: 'Save',
            color: KbqComponentColors.Contrast,
            icon: 'kbq-floppy-disk_16',
            disabled: computed(() => !this.value())
        }
    ];

    protected readonly isDesktop = inject(BreakpointObserver).observe('(min-width: 900px)');
    protected readonly KbqComponentColors = KbqComponentColors;
    protected readonly KbqButtonStyles = KbqButtonStyles;
    protected readonly PopUpPlacements = PopUpPlacements;
}
