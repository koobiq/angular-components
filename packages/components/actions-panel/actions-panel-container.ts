import { CdkDialogContainer } from '@angular/cdk/dialog';
import { CdkPortalOutlet } from '@angular/cdk/portal';
import {
    ChangeDetectionStrategy,
    Component,
    inject,
    InjectionToken,
    Injector,
    OnDestroy,
    Provider,
    Renderer2,
    signal,
    ViewEncapsulation
} from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import {
    KbqActionsPanelLocaleConfiguration,
    kbqAfterAnimations,
    kbqAnimationsDisabled,
    KbqDeepPartial,
    kbqLocaleConfigurationOverrideProvider,
    KbqLocaleOverridesDirective,
    ruRULocaleData
} from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { Subject } from 'rxjs';
import { KbqActionsPanel } from './actions-panel';
import { KbqActionsPanelConfig } from './actions-panel-config';

/** Localization configuration provider. */
export const KBQ_ACTIONS_PANEL_LOCALE_CONFIGURATION = new InjectionToken<KbqActionsPanelLocaleConfiguration>(
    'KbqActionsPanelLocaleConfiguration',
    { factory: () => ruRULocaleData.actionsPanel }
);

/**
 * Utility provider for `KBQ_ACTIONS_PANEL_LOCALE_CONFIGURATION`. Only the strings you pass are
 * overridden; the rest keep following the active locale.
 */
export const kbqActionsPanelLocaleConfigurationProvider = (
    configuration: KbqDeepPartial<KbqActionsPanelLocaleConfiguration>
): Provider => kbqLocaleConfigurationOverrideProvider('actionsPanel', configuration);

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
                [attr.aria-label]="localeConfiguration().closeTooltip"
                [kbqTooltip]="localeConfiguration().closeTooltip"
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
    // Unlike the parent `CdkDialogContainer`, and like the sidepanel container: the attached content is
    // checked when its own view is marked, not on every application tick.
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-actions-panel-container',
        '[class.kbq-actions-panel-container_rtl]': 'config.direction === "rtl"',
        '[class.kbq-actions-panel-container_visible]': "animationState() === 'visible'",
        '[class.kbq-animations-disabled]': 'animationsDisabled',
        '(keydown.escape)': 'handleEscape($any($event))'
    },
    // Carrier only: the container is created through the overlay, so there is no element for a consumer to
    // bind on, and it lets the container read its strings through `read()`. Unlike the pop-up panels it
    // reaches no ancestor carrier: `KbqActionsPanel` is provided in root, so the container's injector is
    // parented on the root injector unless the caller passes `config.injector` — pass one to scope an
    // override to the panel.
    hostDirectives: [KbqLocaleOverridesDirective]
})
export class KbqActionsPanelContainer extends CdkDialogContainer implements OnDestroy {
    /**
     * The state of the actions panel animations.
     *
     * @docs-private
     */
    protected readonly animationState = signal<'void' | 'visible' | 'hidden'>('void');

    /**
     * Emits the state the actions panel has finished moving to.
     *
     * @docs-private
     */
    readonly animationDone = new Subject<'visible' | 'hidden'>();

    /**
     * Whether the actions panel moves without motion.
     *
     * @docs-private
     */
    protected readonly animationsDisabled = kbqAnimationsDisabled();

    private readonly injector = inject(Injector);
    private stateAnimation?: { destroy(): void };

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
    /**
     * Actions panel locale configuration.
     *
     * @docs-private
     */
    protected readonly localeConfiguration = inject(KbqLocaleOverridesDirective, { self: true }).read(
        'actionsPanel',
        KBQ_ACTIONS_PANEL_LOCALE_CONFIGURATION
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
            this.animationState.set('visible');
            this._changeDetectorRef.detectChanges();
            this.waitForAnimation('visible');
        }
    }

    /**
     * Start animation of the actions panel exiting from view.
     *
     * @docs-private
     */
    startCloseAnimation(): void {
        if (!this.destroyed) {
            this.animationState.set('hidden');
            this.waitForAnimation('hidden');
        }
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

    private waitForAnimation(state: 'visible' | 'hidden'): void {
        this.stateAnimation?.destroy();
        this.stateAnimation = kbqAfterAnimations(
            () => this._elementRef.nativeElement,
            () => {
                if (state === 'visible') {
                    this._trapFocus();
                }

                this.animationDone.next(state);
            },
            this.injector
        );
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
