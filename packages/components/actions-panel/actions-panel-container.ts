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
    EventEmitter,
    inject,
    InjectionToken,
    OnDestroy,
    Provider,
    Renderer2,
    ViewEncapsulation
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { KbqButtonModule } from '@koobiq/components/button';
import {
    KBQ_LOCALE_SERVICE,
    KbqActionsPanelLocaleConfiguration,
    KbqAnimationCurves,
    KbqAnimationDurations,
    ruRULocaleData
} from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { map, of } from 'rxjs';
import { KbqActionsPanel } from './actions-panel';
import { KbqActionsPanelConfig } from './actions-panel-config';

/** Localization configuration provider. */
export const KBQ_ACTIONS_PANEL_LOCALE_CONFIGURATION = new InjectionToken<KbqActionsPanelLocaleConfiguration>(
    'KBQ_ACTIONS_PANEL_LOCALE_CONFIGURATION',
    { factory: () => ruRULocaleData.actionsPanel }
);

/** Utility provider for `KBQ_ACTIONS_PANEL_LOCALE_CONFIGURATION`. */
export const kbqActionsPanelLocaleConfigurationProvider = (
    configuration: KbqActionsPanelLocaleConfiguration
): Provider => ({
    provide: KBQ_ACTIONS_PANEL_LOCALE_CONFIGURATION,
    useValue: configuration
});

/**
 * Animation that shows and hides the actions panel.
 */
const KBQ_ACTIONS_PANEL_CONTAINER_ANIMATION = trigger('state', [
    state('void, hidden', style({ transform: 'translateY(100%)' })),
    state('visible', style({ transform: 'translateY(0%)' })),
    transition(
        'visible => void, visible => hidden',
        group([
            animate(`${KbqAnimationDurations.Entering} ${KbqAnimationCurves.StandardCurve}`),
            query('@*', animateChild(), { optional: true })
        ])
    ),
    transition(
        'void => visible',
        group([
            animate(`${KbqAnimationDurations.Exiting} ${KbqAnimationCurves.StandardCurve}`),
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
    selector: 'kbq-actions-panel-container',
    imports: [
        CdkPortalOutlet,
        KbqDividerModule,
        KbqButtonModule,
        KbqIconModule,
        KbqToolTipModule
    ],
    template: `
        <div class="kbq-actions-panel-container__content">
            <ng-template cdkPortalOutlet />
        </div>
        @if (!config.disableClose) {
            <kbq-divider class="kbq-actions-panel-container__vertical-divider" [vertical]="true" />
            <button
                class="kbq-actions-panel-container__close-button"
                color="contrast"
                kbq-button
                [kbqTooltip]="localeConfiguration()!.closeTooltip"
                [kbqTooltipOffset]="16"
                (click)="close()"
            >
                <i kbq-icon="kbq-circle-xmark_16"></i>
            </button>
        }
    `,
    styleUrls: [
        './actions-panel-tokens.scss',
        './actions-panel-container.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    // Uses the `Default` change detection strategy as parent `CdkDialogContainer`:
    // https://github.com/angular/components/blob/18.2.14/src/cdk/dialog/dialog-container.ts#L60
    changeDetection: ChangeDetectionStrategy.Default,
    animations: [KBQ_ACTIONS_PANEL_CONTAINER_ANIMATION],
    host: {
        class: 'kbq-actions-panel-container',
        '[class.kbq-actions-panel-container_rtl]': 'config.direction === "rtl"',
        '[@state]': 'animationState',
        '(@state.start)': 'onAnimationStart($event)',
        '(@state.done)': 'onAnimationDone($event)',
        '(keydown.escape)': 'handleEscape($event)'
    }
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
    protected readonly config = inject(KbqActionsPanelConfig);

    private readonly actionsPanel = inject(KbqActionsPanel);
    private readonly renderer = inject(Renderer2);
    private readonly localeService = inject(KBQ_LOCALE_SERVICE, { optional: true });

    /**
     * Actions panel locale configuration.
     *
     * @docs-private
     */
    protected readonly localeConfiguration = toSignal<KbqActionsPanelLocaleConfiguration>(
        this.localeService
            ? this.localeService.changes.pipe(map(() => this.localeService!.getParams('actionsPanel')))
            : of(inject(KBQ_ACTIONS_PANEL_LOCALE_CONFIGURATION))
    );

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
            // animationState lives in host bindings and `detectChanges` does not refresh host bindings  so we have to
            // call `markForCheck` to ensure the host view is refreshed eventually.
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
     * Handles escape key events.
     *
     * @docs-private
     */
    protected handleEscape(event: KeyboardEvent): void {
        if (!this.config.disableClose) {
            event.preventDefault();
            this.close();
        }
    }

    /**
     * @docs-private
     */
    protected override _contentAttached(): void {
        this.applyContainerClass();
    }

    private applyContainerClass(): void {
        const { containerClass } = this.config;

        if (containerClass) {
            if (Array.isArray(containerClass)) {
                containerClass.forEach((cssClass) => this.renderer.addClass(this._elementRef.nativeElement, cssClass));
            } else {
                this.renderer.addClass(this._elementRef.nativeElement, containerClass);
            }
        }
    }
}
