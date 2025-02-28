import { BreakpointObserver } from '@angular/cdk/layout';
import { CdkScrollable } from '@angular/cdk/overlay';
import { AsyncPipe } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    inject,
    signal,
    ViewChild,
    WritableSignal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors, PopUpPlacements } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { KbqTopBarModule } from '@koobiq/components/top-bar';
import { auditTime, map, startWith } from 'rxjs/operators';

/**
 * @title TopBar Overflow
 */
@Component({
    standalone: true,
    selector: 'top-bar-overflow-example',
    imports: [
        AsyncPipe,
        CdkScrollable,
        KbqTopBarModule,
        KbqButtonModule,
        KbqToolTipModule,
        KbqIconModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <kbq-top-bar [withShadow]="hasOverflow()">
            <div class="layout-align-center-center" kbqTopBarContainer placement="start">
                <div class="layout-row layout-padding-m flex-none">
                    <i class="layout-row flex" kbq-icon="kbq-dashboard_16"></i>
                </div>
                <div class="kbq-title kbq-truncate-line">Dashboard</div>
            </div>
            <div kbqTopBarSpacer></div>
            <div kbqTopBarContainer placement="end">
                @for (action of actions; track $index) {
                    <button
                        [kbqStyle]="action.style"
                        [color]="action.color"
                        [kbqTooltipDisabled]="isDesktop"
                        [kbqPlacement]="PopUpPlacements.Bottom"
                        [kbqTooltip]="action.title"
                        kbq-button
                    >
                        @if (action.icon) {
                            <i [class]="action.icon" kbq-icon=""></i>
                        }
                        @if (isDesktop) {
                            {{ action.title }}
                        }
                    </button>
                }
            </div>
        </kbq-top-bar>
        <div class="overflow-content-example kbq-scrollbar" cdkScrollable>
            <div style="height: 600px">Scroll down ⬇️ to see box-shadow</div>
        </div>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            height: 400px;
        }

        .overflow-content-example {
            height: 100%;
            overflow-y: auto;
            scroll-behavior: smooth;
            border: 1px solid var(--kbq-line-contrast-less);
            border-top: 0;
            border-radius: 0 0 var(--kbq-size-border-radius) var(--kbq-size-border-radius);
        }
    `
})
export class TopBarOverflowExample implements AfterViewInit {
    isDesktop: boolean;

    @ViewChild(CdkScrollable) protected readonly scrollable: CdkScrollable;

    readonly hasOverflow: WritableSignal<boolean | undefined> = signal(false);

    readonly actions = [
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
            icon: 'kbq-floppy-disk_16'
        }
    ];

    protected readonly PopUpPlacements = PopUpPlacements;
    protected readonly KbqComponentColors = KbqComponentColors;
    protected readonly KbqButtonStyles = KbqButtonStyles;
    protected readonly cdr = inject(ChangeDetectorRef);

    constructor() {
        inject(BreakpointObserver)
            .observe('(min-width: 768px)')
            .pipe(
                startWith({ matches: true }),
                map(({ matches }) => !!matches),
                takeUntilDestroyed()
            )
            .subscribe((matches) => {
                this.isDesktop = matches;
                this.cdr.markForCheck();
            });
    }

    ngAfterViewInit() {
        this.scrollable
            .elementScrolled()
            .pipe(auditTime(300))
            .subscribe(() => this.hasOverflow.set(this.scrollable.measureScrollOffset('top') > 0));
    }
}
