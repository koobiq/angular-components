import {
    animate,
    animateChild,
    AnimationEvent,
    group,
    query,
    state,
    style,
    transition,
    trigger
} from '@angular/animations';
import { CdkDialogContainer } from '@angular/cdk/dialog';
import { CdkPortalOutlet } from '@angular/cdk/portal';
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    inject,
    OnDestroy,
    Renderer2,
    ViewEncapsulation
} from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqAnimationCurves, KbqAnimationDurations } from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqActionsPanel } from './actions-panel';
import { KbqActionsPanelConfig } from './actions-panel-config';

/**
 * Animation that shows and hides the actions panel.
 */
const KBQ_ACTIONS_PANEL_CONTAINER_ANIMATION = trigger('state', [
    state('void, hidden', style({ transform: 'translateY(100%)' })),
    state('visible', style({ transform: 'translateY(0%)' })),
    transition(
        'visible => void, visible => hidden',
        group([
            animate(`${KbqAnimationDurations.Complex} ${KbqAnimationCurves.AccelerationCurve}`),
            query('@*', animateChild(), { optional: true })
        ])
    ),
    transition(
        'void => visible',
        group([
            animate(`${KbqAnimationDurations.Exiting} ${KbqAnimationCurves.DecelerationCurve}`),
            query('@*', animateChild(), { optional: true })
        ])
    )
]);

/**
 * Internal component that wraps user-provided actions panel content.
 *
 * @docs-private
 */
@Component({
    standalone: true,
    imports: [
        CdkPortalOutlet,
        KbqDividerModule,
        KbqButtonModule,
        KbqIconModule
    ],
    selector: 'kbq-actions-panel-container',
    template: `
        <div class="kbq-actions-panel-container__content">
            <ng-template cdkPortalOutlet />
        </div>
        @if (!config.disableClose) {
            <kbq-divider class="kbq-actions-panel-container__vertical-divider" [vertical]="true" />
            <button
                class="kbq-actions-panel-container__close-button"
                [tabIndex]="-1"
                (click)="close()"
                color="contrast"
                kbq-button
            >
                <i kbq-icon="kbq-xmark-circle_16"></i>
            </button>
        }
    `,
    styleUrls: [
        './actions-panel-tokens.scss',
        './actions-panel-container.scss'
    ],
    animations: [KBQ_ACTIONS_PANEL_CONTAINER_ANIMATION],
    host: {
        class: 'kbq-actions-panel-container',
        '[class.kbq-actions-panel-container_rtl]': 'isRTL',
        '[@state]': 'animationState',
        '(@state.start)': 'onAnimationStart($event)',
        '(@state.done)': 'onAnimationDone($event)'
    },
    // Uses the `Default` change detection strategy as parent `CdkDialogContainer`:
    // https://github.com/angular/components/blob/18.2.14/src/cdk/dialog/dialog-container.ts#L60
    changeDetection: ChangeDetectionStrategy.Default,
    encapsulation: ViewEncapsulation.None
})
export class KbqActionsPanelContainer extends CdkDialogContainer implements OnDestroy {
    /**
     * The state of the actions panel animations.
     *
     * @docs-private
     */
    protected animationState: 'void' | 'visible' | 'hidden' = 'void';

    /**
     * Emits whenever the state of the animation changes.
     *
     * @docs-private
     */
    readonly animationStateChanged = new EventEmitter<AnimationEvent>();

    /** Whether the actions panel container has been destroyed. */
    private destroyed: boolean;

    /**
     * Actions panel configuration.
     *
     * @docs-private
     */
    readonly config = inject(KbqActionsPanelConfig);

    /**
     * Whether the actions panel direction is RTL.
     *
     * @docs-private
     */
    readonly isRTL = this.config?.direction === 'rtl';

    private readonly actionsPanel = inject(KbqActionsPanel);
    private readonly renderer = inject(Renderer2);
    private readonly elementRef = inject(ElementRef);

    override ngOnDestroy() {
        super.ngOnDestroy();
        this.destroyed = true;
    }

    /**
     * Close the actions panel.
     *
     * @docs-private
     */
    protected close(): void {
        this.actionsPanel.close();
    }

    /**
     * Start animation of the actions panel entrance into view.
     *
     * @docs-private
     */
    startOpenAnimation(): void {
        if (!this.destroyed) {
            this.animationState = 'visible';
            this._changeDetectorRef.markForCheck();
            this._changeDetectorRef.detectChanges();
        }
    }

    /**
     * Start animation of the actions panel exiting from view.
     *
     * @docs-private
     */
    startCloseAnimation(): void {
        if (!this.destroyed) {
            this.animationState = 'hidden';
            this._changeDetectorRef.markForCheck();
        }
    }

    /**
     * Handles animation done events.
     *
     * @docs-private
     */
    protected onAnimationDone(event: AnimationEvent): void {
        if (event.toState === 'visible') {
            this._trapFocus();
        }

        this.animationStateChanged.emit(event);
    }

    /**
     * Handles animation start events.
     *
     * @docs-private
     */
    protected onAnimationStart(event: AnimationEvent): void {
        this.animationStateChanged.emit(event);
    }

    /**
     * @docs-private
     */
    protected override _captureInitialFocus(): void {}

    /**
     * @docs-private
     */
    protected override _contentAttached(): void {
        super._contentAttached();
        this.applyContainerClass();
    }

    private applyContainerClass(): void {
        const { containerClass } = this.config;
        if (containerClass) {
            if (Array.isArray(containerClass)) {
                containerClass.forEach((cssClass) => this.renderer.addClass(this.elementRef.nativeElement, cssClass));
            } else {
                this.renderer.addClass(this.elementRef.nativeElement, containerClass);
            }
        }
    }
}
