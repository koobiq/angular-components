import { BreakpointObserver } from '@angular/cdk/layout';
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
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
import { KbqTopBarModule } from '@koobiq/components/top-bar';
import { map } from 'rxjs/operators';

/**
 * @title TopBar Active Breadcrumb
 */
@Component({
    standalone: true,
    selector: 'top-bar-active-breadcrumb-example',
    imports: [
        FormsModule,
        AsyncPipe,
        RouterLink,
        KbqTopBarModule,
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
        <kbq-top-bar>
            <div class="layout-align-center-center" kbqTopBarContainer placement="start">
                <div class="layout-row layout-padding-m flex-none">
                    <i class="layout-row flex" kbq-icon="kbq-dashboard_16"></i>
                </div>
                <div class="kbq-top-bar__breadcrumbs">
                    <nav kbq-breadcrumbs>
                        <kbq-breadcrumb-item text="Dashboards" routerLink="./dashboards" />

                        <kbq-breadcrumb-item text="Dashboards">
                            <a *kbqBreadcrumbView tabindex="-1">
                                <button
                                    class="kbq-dropdown-trigger"
                                    #kbqPopover="kbqPopover"
                                    [kbqPopoverContent]="popoverContent"
                                    [kbqPopoverPlacement]="PopUpPlacements.BottomLeft"
                                    [kbqTooltipDisabled]="isDesktop()"
                                    [kbqPlacement]="PopUpPlacements.Bottom"
                                    [kbqTooltip]="breadcrumbActionText"
                                    kbqPopoverClass="dashboard__input"
                                    kbq-button
                                    kbqBreadcrumb
                                    kbqPopover
                                >
                                    @if (isDesktop()) {
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
            <div kbqTopBarSpacer></div>
            <div kbqTopBarContainer placement="end">
                @for (action of actions; track $index) {
                    <button
                        [kbqStyle]="action.style"
                        [color]="action.color"
                        [kbqTooltipDisabled]="isDesktop()"
                        [kbqPlacement]="PopUpPlacements.Bottom"
                        [kbqTooltip]="action.title"
                        [disabled]="action.disabled && action.disabled()"
                        kbq-button
                    >
                        @if (!isDesktop() && action.icon) {
                            <i [class]="action.icon" kbq-icon=""></i>
                        }
                        @if (isDesktop()) {
                            {{ action.title }}
                        }
                    </button>
                }
            </div>
        </kbq-top-bar>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopBarActiveBreadcrumbExample {
    isDesktop = toSignal(
        inject(BreakpointObserver)
            .observe('(min-width: 900px)')
            .pipe(
                takeUntilDestroyed(),
                map(({ matches }) => matches)
            ),
        { initialValue: true }
    );

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
            style: '',
            color: KbqComponentColors.Contrast,
            icon: 'kbq-floppy-disk_16',
            disabled: computed(() => !this.value())
        }
    ];

    protected readonly KbqComponentColors = KbqComponentColors;
    protected readonly KbqButtonStyles = KbqButtonStyles;
    protected readonly PopUpPlacements = PopUpPlacements;
}
