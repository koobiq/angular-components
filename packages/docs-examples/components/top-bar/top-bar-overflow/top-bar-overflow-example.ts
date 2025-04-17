import { BreakpointObserver } from '@angular/cdk/layout';
import { CdkScrollable } from '@angular/cdk/overlay';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    inject,
    signal,
    ViewChild,
    WritableSignal
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors, PopUpPlacements } from '@koobiq/components/core';
import { KbqDlModule } from '@koobiq/components/dl';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqOverflowItemsModule } from '@koobiq/components/overflow-items';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { KbqTopBarModule } from '@koobiq/components/top-bar';
import { auditTime, map } from 'rxjs/operators';

type ExampleAction = {
    id: string;
    icon?: string;
    text?: string;
    action?: () => void;
    style: KbqButtonStyles | string;
    color: KbqComponentColors;
};

/**
 * @title TopBar Overflow
 */
@Component({
    standalone: true,
    selector: 'top-bar-overflow-example',
    imports: [
        CdkScrollable,
        KbqTopBarModule,
        KbqButtonModule,
        KbqToolTipModule,
        KbqIconModule,
        KbqDlModule,
        KbqBadgeModule,
        KbqDropdownModule,
        KbqOverflowItemsModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <kbq-top-bar [withShadow]="hasOverflow()">
            <div class="layout-align-center-center" kbqTopBarContainer placement="start">
                <div class="kbq-title example-kbq-top-bar__title">
                    <span class="kbq-truncate-line layout-margin-right-xs">Page</span>

                    <span class="example-kbq-top-bar__counter">13 294</span>
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
        <div class="overflow-content-example kbq-scrollbar" cdkScrollable>
            <div style="height: 600px">
                <kbq-dl>
                    <kbq-dt>Description</kbq-dt>
                    <kbq-dd>
                        NASA describes a case where a person accidentally ended up in an area close to a vacuum
                        (pressure below 1 Pa) due to an air leak from a spacesuit.
                    </kbq-dd>

                    <kbq-dt>Status</kbq-dt>
                    <kbq-dd><kbq-badge>Badge</kbq-badge></kbq-dd>

                    <kbq-dt>Additional Information</kbq-dt>
                    <kbq-dd>
                        Space is an endless expanse full of mysteries and wonders. It begins beyond our atmosphere and
                        stretches to the farthest corners of the Universe. In space, there are billions of stars,
                        planets, and galaxies, each with its own unique story and characteristics. Exploring space helps
                        us better understand not only the Universe itself but also our place within it.
                        <br />
                        <br />
                        One of the most fascinating aspects of space is its infinity. Scientists still cannot determine
                        exactly where the Universe ends. There are theories that it may be infinite or have certain
                        boundaries. This opens up many questions about what lies beyond the visible universe and what
                        forms of life might exist on other planets. Space research also plays a crucial role in the
                        development of technologies on Earth. Many inventions we use in everyday life were developed
                        thanks to space programs. For example, satellite navigation, communication systems, and even
                        some medical technologies have their roots in space exploration. This shows how studying space
                        can benefit humanity as a whole. Finally, space inspires creativity and dreams. Since childhood,
                        we have looked at the stars and wondered what might exist beyond our planet. Movies, books, and
                        art often draw inspiration from space, creating images that capture the imagination. This drive
                        for exploration and discovery makes space not only a scientific but also a cultural part of our
                        lives.
                    </kbq-dd>
                </kbq-dl>
            </div>
        </div>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            height: 400px;
            border-radius: var(--kbq-size-border-radius);
            border: 1px solid var(--kbq-line-contrast-less);
            background: var(--kbq-background-bg);

            .kbq-top-bar {
                border-radius: var(--kbq-size-border-radius) var(--kbq-size-border-radius) 0 0;
            }

            .kbq-overflow-items {
                max-width: 291px;
            }
        }

        .overflow-content-example {
            height: 100%;
            overflow-y: auto;
            scroll-behavior: smooth;
            padding: 0 var(--kbq-size-xxl);
        }

        .example-kbq-top-bar__counter {
            color: var(--kbq-foreground-contrast-tertiary);
            flex: 1;
        }

        .example-kbq-top-bar__title {
            display: inline-flex;
            white-space: nowrap;
        }
    `
})
export class TopBarOverflowExample implements AfterViewInit {
    readonly isDesktop = toSignal(
        inject(BreakpointObserver)
            .observe('(min-width: 768px)')
            .pipe(
                takeUntilDestroyed(),
                map(({ matches }) => matches)
            ),
        { initialValue: true }
    );

    @ViewChild(CdkScrollable) protected readonly scrollable: CdkScrollable;

    readonly hasOverflow: WritableSignal<boolean | undefined> = signal(false);

    readonly actions: ExampleAction[] = [
        {
            id: 'search',
            icon: 'kbq-magnifying-glass_16',
            color: KbqComponentColors.Contrast,
            style: KbqButtonStyles.Transparent
        },
        { id: 'list', icon: 'kbq-list_16', color: KbqComponentColors.Contrast, style: KbqButtonStyles.Transparent },
        { id: 'filter', icon: 'kbq-filter_16', color: KbqComponentColors.Contrast, style: KbqButtonStyles.Transparent },
        { id: 'button1', text: 'Add object', color: KbqComponentColors.Contrast, style: '' },
        { id: 'button2', text: 'Button', color: KbqComponentColors.ContrastFade, style: '' }
    ];

    protected readonly PopUpPlacements = PopUpPlacements;
    protected readonly KbqComponentColors = KbqComponentColors;
    protected readonly KbqButtonStyles = KbqButtonStyles;

    ngAfterViewInit() {
        this.scrollable
            .elementScrolled()
            .pipe(auditTime(300))
            .subscribe(() => this.hasOverflow.set(this.scrollable.measureScrollOffset('top') > 0));
    }
}
