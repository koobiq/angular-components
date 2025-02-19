import { BreakpointObserver } from '@angular/cdk/layout';
import { CdkScrollable } from '@angular/cdk/overlay';
import { AsyncPipe } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
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
import { KbqTopMenuModule } from '@koobiq/components/top-menu';
import { auditTime, map, startWith } from 'rxjs/operators';

/**
 * @title TopMenu Overflow
 */
@Component({
    standalone: true,
    selector: 'top-menu-overflow-example',
    imports: [
        AsyncPipe,
        CdkScrollable,
        KbqTopMenuModule,
        KbqButtonModule,
        KbqToolTipModule,
        KbqIconModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        @let isDesktopMatches = !!(isDesktop | async);
        <kbq-top-menu [hasOverflow]="hasOverflow()">
            <div class="layout-align-center-center" kbq-top-menu-container placement="left">
                <div class="layout-row layout-padding-m flex-none">
                    <i class="layout-row flex" kbq-icon="kbq-dashboard_16"></i>
                </div>
                <div class="kbq-title kbq-text-ellipsis">Dashboard</div>
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
                        kbq-button
                    >
                        @if (action.icon) {
                            <i [class]="action.icon" kbq-icon=""></i>
                        }
                        @if (isDesktopMatches) {
                            {{ action.title }}
                        }
                    </button>
                }
            </div>
        </kbq-top-menu>
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

        .kbq-text-ellipsis {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
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
export class TopMenuOverflowExample implements AfterViewInit {
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
            color: KbqComponentColors.Contrast,
            icon: 'kbq-floppy-disk_16'
        }
    ];

    readonly isDesktop = inject(BreakpointObserver)
        .observe('(min-width: 768px)')
        .pipe(
            startWith({ matches: true }),
            map(({ matches }) => !!matches)
        );

    protected readonly destroyRef = inject(DestroyRef);
    protected readonly PopUpPlacements = PopUpPlacements;
    protected readonly KbqComponentColors = KbqComponentColors;
    protected readonly KbqButtonStyles = KbqButtonStyles;

    ngAfterViewInit() {
        this.scrollable
            .elementScrolled()
            .pipe(auditTime(300), takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.hasOverflow.set(this.scrollable.measureScrollOffset('top') > 0));
    }
}
