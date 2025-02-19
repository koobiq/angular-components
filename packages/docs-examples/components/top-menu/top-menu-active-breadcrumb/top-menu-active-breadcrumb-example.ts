import { BreakpointObserver } from '@angular/cdk/layout';
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { KbqFormFieldModule } from '@koobiq/components-experimental/form-field';
import { KbqBreadcrumbsModule } from '@koobiq/components/breadcrumbs';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors, PopUpPlacements } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqPopoverModule } from '@koobiq/components/popover';
import { KbqTextareaModule } from '@koobiq/components/textarea';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { KbqTopMenuModule } from '@koobiq/components/top-menu';
import { map, startWith } from 'rxjs/operators';

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
        KbqIconModule,
        KbqBreadcrumbsModule,
        KbqFormFieldModule,
        KbqInputModule,
        KbqTextareaModule,
        KbqPopoverModule
    ],
    template: `
        @let isDesktopMatches = !!(isDesktop | async)?.matches;
        <kbq-top-menu>
            <div class="layout-align-center-center" kbq-top-menu-container placement="left">
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
            <div kbq-top-menu-spacer></div>
            <div kbq-top-menu-container placement="right">
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
    readonly value = signal(null);

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
    readonly isDesktop = inject(BreakpointObserver)
        .observe('(min-width: 900px)')
        .pipe(
            startWith({ matches: true }),
            map(({ matches }) => matches)
        );

    protected readonly KbqComponentColors = KbqComponentColors;
    protected readonly KbqButtonStyles = KbqButtonStyles;
    protected readonly PopUpPlacements = PopUpPlacements;
}
