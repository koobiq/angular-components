import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors, KbqFormattersModule, PopUpPlacements } from '@koobiq/components/core';
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
        KbqOverflowItemsModule,
        KbqFormattersModule
    ],
    template: `
        <kbq-top-bar withShadow>
            <div
                class="layout-row layout-align-center-center layout-padding-top-3xs layout-padding-bottom-3xs"
                kbqTopBarContainer
                placement="start"
            >
                <div class="layout-row layout-margin-right-l flex-none">
                    <img alt="example icon" src="assets/example-icon.svg" width="24" height="24" />
                </div>
                <div class="kbq-title kbq-truncate-line example-kbq-top-bar__title">
                    <span class="kbq-truncate-line layout-margin-right-xs">Page Header</span>

                    <span class="example-kbq-top-bar__counter">{{ 10 | kbqNumber: '' : 'en-US' }}</span>
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
            max-width: 100%;
            min-width: 110px;
            container-type: inline-size;

            .kbq-top-bar {
                width: 100%;
            }

            .kbq-top-bar-container__start {
                --kbq-top-bar-container-start-basis: 115px;
            }

            .kbq-overflow-items {
                max-width: 142px;
                min-width: 32px;
            }
        }

        .example-kbq-top-bar__counter {
            color: var(--kbq-foreground-contrast-tertiary);
        }

        .example-kbq-top-bar__title {
            display: inline-flex;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleTopBar {
    readonly isDesktop = toSignal(
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
        { id: 'button1', text: 'Add object', color: KbqComponentColors.Contrast, style: '' },
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
        <div class="example-text layout-margin-bottom-l">
            {{ text.fullDisplay }}
        </div>
        <example-top-bar [style.width.px]="680" />

        <div class="example-text layout-margin-bottom-l layout-margin-top-3xl">
            {{ text.truncatedTitle }}
        </div>
        <example-top-bar [style.width.px]="437" />

        <div class="example-text layout-margin-bottom-l layout-margin-top-3xl">
            {{ text.compressRight }}
        </div>
        <example-top-bar [style.width.px]="314" />
    `,
    styles: `
        :host .example-text {
            color: var(--kbq-foreground-contrast-secondary);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopBarTitleCounterAdaptiveExample {
    text = {
        fullDisplay: 'When there is free space, the title and actions are fully displayed.',
        truncatedTitle:
            'The minimum width of the left side depends on the page title, which can be truncated to 3 characters with the addition of three dots (…).',
        compressRight:
            'After reaching the minimum width of the left side, you can start compressing the right side with the actions.'
    };
}
