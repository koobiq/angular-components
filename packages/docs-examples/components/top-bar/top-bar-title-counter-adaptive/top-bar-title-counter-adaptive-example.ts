import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors, PopUpPlacements } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqOverflowItemsModule } from '@koobiq/components/overflow-items';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { KbqTopBarModule } from '@koobiq/components/top-bar';
import { map } from 'rxjs/operators';

type ExampleAction = {
    id: string;
    icon?: string;
    text?: string;
    action?: () => void;
    style: KbqButtonStyles | string;
    color: KbqComponentColors;
};

@Component({
    standalone: true,
    selector: 'example-top-bar',
    imports: [
        KbqTopBarModule,
        KbqButtonModule,
        KbqToolTipModule,
        KbqIconModule,
        KbqDropdownModule,
        KbqOverflowItemsModule
    ],
    template: `
        <kbq-top-bar withShadow>
            <div
                class="layout-row layout-align-center-center layout-padding-top-3xs layout-padding-bottom-3xs"
                kbqTopBarContainer
                placement="start"
            >
                <div class="layout-row layout-margin-right-l flex-none">
                    <i class="layout-row flex" kbq-icon="">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                fill-rule="evenodd"
                                clip-rule="evenodd"
                                d="M0 19.2C0 21.3033 0 22.4726 0.763692 23.2363C1.52738 24 2.69665 24 4.8 24H19.2C21.3033 24 22.4726 24 23.2363 23.2363C24 22.4726 24 21.3033 24 19.2V4.8C24 2.69665 24 1.52738 23.2363 0.763692C22.4726 0 21.3033 0 19.2 0H4.8C2.69665 0 1.52738 0 0.763692 0.763692C0 1.52738 0 2.69665 0 4.8V19.2Z"
                                fill="#FF0000"
                            />
                            <path
                                d="M11.233 12L8.39495 14.8381L5.55688 12L8.39495 9.20029L11.233 12ZM14.8381 15.6435L12.0384 18.4432L9.20035 15.6435L12.0384 12.8054L14.8381 15.6435ZM14.8381 8.39489L12.0384 11.1946L9.20035 8.39489L12.0384 5.55682L14.8381 8.39489ZM18.4432 12L15.6435 14.8381L12.8438 12L15.6435 9.20029L18.4432 12Z"
                                fill="white"
                            />
                        </svg>
                    </i>
                </div>
                <div class="kbq-title kbq-truncate-line example-kbq-top-bar__title">
                    <span class="kbq-truncate-line layout-margin-right-xs">Page Header</span>

                    <span class="example-kbq-top-bar__counter">10</span>
                </div>
            </div>

            <div kbqTopBarSpacer></div>

            <div #kbqOverflowItems="kbqOverflowItems" kbqOverflowItems kbqTopBarContainer placement="end">
                @for (action of actions; track action.id) {
                    <button
                        [kbqOverflowItem]="action.id"
                        [kbqStyle]="action.style"
                        [color]="action.color"
                        [kbqPlacement]="PopUpPlacements.Bottom"
                        [kbqTooltipArrow]="false"
                        [kbqTooltipDisabled]="isDesktop()"
                        [kbqTooltip]="action.text || action.id"
                        kbq-button
                    >
                        @if (action.icon) {
                            <i [class]="action.icon" kbq-icon=""></i>
                        }
                        @if ((action.text && isDesktop()) || (!action.icon && action.text)) {
                            {{ action.text }}
                        }
                    </button>
                }

                <div kbqOverflowItemsResult>
                    <button
                        [kbqStyle]="KbqButtonStyles.Transparent"
                        [color]="KbqComponentColors.Contrast"
                        [kbqDropdownTriggerFor]="appDropdown"
                        kbq-button
                    >
                        <i kbq-icon="kbq-ellipsis-horizontal_16"></i>
                    </button>

                    <kbq-dropdown #appDropdown="kbqDropdown">
                        @for (action of actions; track action.id) {
                            @if (kbqOverflowItems.hiddenItemIDs().has(action.id)) {
                                <button kbq-dropdown-item>
                                    {{ action.text || action.id }}
                                </button>
                            }
                        }
                    </kbq-dropdown>
                </div>
            </div>
        </kbq-top-bar>
    `,
    styles: `
        :host {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 72px;
            resize: horizontal;
            max-width: 100%;
            min-width: 110px;
            overflow: hidden;
            container-type: inline-size;

            .kbq-top-bar {
                width: 100%;
            }
        }

        .example-kbq-top-bar__counter {
            color: var(--kbq-foreground-contrast-tertiary);
        }

        .example-kbq-top-bar__title {
            display: inline-flex;
        }

        .kbq-overflow-items {
            max-width: 210px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleTopBar {
    isDesktop = toSignal(
        inject(BreakpointObserver)
            .observe('(min-width: 900px)')
            .pipe(
                takeUntilDestroyed(),
                map(({ matches }) => matches)
            ),
        { initialValue: true }
    );

    readonly actions: ExampleAction[] = [
        { id: 'filter', icon: 'kbq-filter_16', color: KbqComponentColors.Contrast, style: KbqButtonStyles.Transparent },
        { id: 'button1', text: 'Apply', color: KbqComponentColors.Contrast, style: '' },
        { id: 'button2', text: 'Button 2', color: KbqComponentColors.ContrastFade, style: '' }
    ];

    protected readonly KbqComponentColors = KbqComponentColors;
    protected readonly KbqButtonStyles = KbqButtonStyles;
    protected readonly PopUpPlacements = PopUpPlacements;
}

/**
 * @title Top Bar Title And Counter Adaptive
 */
@Component({
    standalone: true,
    imports: [ExampleTopBar],
    selector: 'top-bar-title-counter-adaptive-example',
    template: `
        <div>When there is free space, the title and actions are fully displayed.</div>
        <example-top-bar [style.width.px]="680" />

        <div>
            The minimum width of the left side depends on the page title, which can be truncated to 3 characters with
            the addition of three dots (…).
        </div>
        <example-top-bar [style.width.px]="437" />

        <div>
            After reaching the minimum width of the left side, you can start compressing the right side with the
            actions.
        </div>
        <example-top-bar [style.width.px]="314" />
    `,
    styles: `
        ::ng-deep .docs-live-example__example_top-bar-title-counter-adaptive {
            background: var(--kbq-background-bg-secondary);
        }

        div {
            color: var(--kbq-foreground-contrast-secondary);
            margin: var(--kbq-size-s) var(--kbq-size-s) 0;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopBarTitleCounterAdaptiveExample {}
