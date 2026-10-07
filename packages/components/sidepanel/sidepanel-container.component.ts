import { CdkTrapFocus, ConfigurableFocusTrapFactory, FocusTrapFactory } from '@angular/cdk/a11y';
import { BasePortalOutlet, CdkPortalOutlet, ComponentPortal, TemplatePortal } from '@angular/cdk/portal';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentRef,
    ElementRef,
    EmbeddedViewRef,
    inject,
    InjectionToken,
    Injector,
    OnDestroy,
    signal,
    viewChild,
    ViewEncapsulation
} from '@angular/core';
import { kbqAfterAnimations, kbqAnimationsDisabled } from '@koobiq/components/core';
import { Observable, Subject } from 'rxjs';
import {
    KbqSidepanelAnimationEvent,
    KbqSidepanelAnimationState,
    kbqSidepanelTransformAnimation
} from './sidepanel-animations';
import { KbqSidepanelConfig, KbqSidepanelPosition, KbqSidepanelSize } from './sidepanel-config';

export const KBQ_SIDEPANEL_WITH_INDENT = new InjectionToken<boolean>('kbq-sidepanel-with-indent');

@Component({
    selector: 'kbq-sidepanel-container',
    imports: [
        CdkPortalOutlet,
        CdkTrapFocus
    ],
    templateUrl: './sidepanel-container.component.html',
    styleUrls: ['./sidepanel.scss', './sidepanel-tokens.scss'],
    // The configurable trap adds an inert strategy that pulls escaping focus back, which the anchor-only
    // default cannot do. Scoped to the container so it does not replace the factory the rest of the
    // application injects.
    providers: [{ provide: FocusTrapFactory, useClass: ConfigurableFocusTrapFactory }],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-sidepanel-container kbq-sidepanel-container_shadowed',
        '[class]': 'size',
        '[class.kbq-sidepanel_nested]': 'withIndent',
        '[attr.id]': 'id',
        '[attr.tabindex]': '-1',
        '[attr.role]': '"dialog"',
        '[attr.aria-modal]': 'trapFocus ? "true" : null',
        '[attr.aria-label]': 'sidepanelConfig.ariaLabel ?? null',
        '[attr.aria-labelledby]': 'ariaLabelledBy',
        '[class.kbq-animations-disabled]': 'animationsDisabled',
        '[style.transform]': 'stateTransform',
        '[style.opacity]': 'stateOpacity'
    }
})
export class KbqSidepanelContainerComponent extends BasePortalOutlet implements OnDestroy {
    private elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private changeDetectorRef = inject(ChangeDetectorRef);
    private readonly injector = inject(Injector);
    sidepanelConfig = inject(KbqSidepanelConfig);

    /** Whether the sidepanel moves without motion. */
    protected readonly animationsDisabled = kbqAnimationsDisabled();

    /** Whether the panel exposes the clickable indent strip of the sidepanel stacked underneath it. */
    withIndent = inject(KBQ_SIDEPANEL_WITH_INDENT);

    /** ID for the container DOM element. */
    id: string;

    /**
     * Id of the element naming the sidepanel. Comes from the config, or from `kbq-sidepanel-header`.
     *
     * @docs-private
     */
    get ariaLabelledBy(): string | null {
        return this._ariaLabelledBy();
    }

    /** @docs-private */
    set ariaLabelledBy(value: string | null) {
        this._ariaLabelledBy.set(value);
    }

    // A signal: the header reports its title while this view is being checked, which a `markForCheck` would miss.
    private readonly _ariaLabelledBy = signal(this.sidepanelConfig.ariaLabelledBy ?? null);

    /** The portal outlet inside of this container into which the content will be loaded. */
    readonly portalOutlet = viewChild.required(CdkPortalOutlet);

    /**
     * The state of the sidepanel: on screen, closing, or stacked under another one.
     * @internal
     */
    animationState: KbqSidepanelAnimationState = KbqSidepanelAnimationState.Void;

    /**
     * Reports each state transition starting and ending.
     * @internal
     */
    readonly animationStateChanged = new Subject<KbqSidepanelAnimationEvent>();

    /** The transition in progress, ended early by the next one. */
    private pendingTransition?: { state: KbqSidepanelAnimationState; wait: { destroy(): void } };

    /** @docs-private */
    get size(): string {
        return `kbq-sidepanel_${this.sidepanelConfig.size ?? KbqSidepanelSize.Medium}`;
    }

    /**
     * Defaults to `true` in both modalities: it is what moves focus into the panel on open and returns
     * it to the trigger on close, and `CdkTrapFocus` restores focus only when it captured it.
     *
     * @docs-private
     */
    get trapFocusAutoCapture(): boolean {
        return this.sidepanelConfig.trapFocusAutoCapture ?? true;
    }

    /** @docs-private */
    get trapFocus(): boolean {
        return this.sidepanelConfig.trapFocus ?? !!this.sidepanelConfig.hasBackdrop;
    }

    /** @docs-private */
    protected readonly indentClickEmitter = new Subject<MouseEvent>();

    /** Whether the component has been destroyed. */
    private destroyed: boolean;

    ngOnDestroy(): void {
        this.destroyed = true;
    }

    /**
     * Gets an observable that emits when the indent has been clicked.
     *
     * @docs-private
     */
    indentClick(): Observable<MouseEvent> {
        return this.indentClickEmitter.asObservable();
    }

    /** Attach a component portal as content to this sidepanel container. */
    attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T> {
        this.validatePortalAttached();
        this.setPanelClass();

        const componentRef = this.portalOutlet().attachComponentPortal(portal);

        // The portal outlet inserts the attached component's own host element between
        // `.kbq-sidepanel-content` and the header/body/footer, and a plain block there takes the
        // body out of the flex column that makes it scroll.
        (componentRef.location.nativeElement as HTMLElement).classList.add('kbq-sidepanel-content-host');

        return componentRef;
    }

    /** Attach a template portal as content to this sidepanel container. */
    attachTemplatePortal<C>(portal: TemplatePortal<C>): EmbeddedViewRef<C> {
        this.validatePortalAttached();
        this.setPanelClass();

        return this.portalOutlet().attachTemplatePortal(portal);
    }

    /** Begin animation of the sidepanel entrance into view. */
    enter(): void {
        if (this.destroyed) return;

        this.animationState = KbqSidepanelAnimationState.Visible;
        this.changeDetectorRef.detectChanges();
        this.startTransition(KbqSidepanelAnimationState.Visible);
    }

    /** Begin animation of the sidepanel exiting from view. */
    exit(): void {
        if (this.destroyed) return;

        this.setAnimationState(KbqSidepanelAnimationState.Hidden);
    }

    /** @internal */
    setAnimationState(state: KbqSidepanelAnimationState): void {
        if (this.destroyed) return;

        this.animationState = state;
        this.changeDetectorRef.markForCheck();
        this.startTransition(state);
    }

    /** @docs-private */
    protected get stateTransform(): string | null {
        const transforms = kbqSidepanelTransformAnimation[this.position];

        switch (this.animationState) {
            case KbqSidepanelAnimationState.Hidden:
                return transforms.in;
            case KbqSidepanelAnimationState.Visible:
                return transforms.out;
            case KbqSidepanelAnimationState.Lower:
                return transforms.lower;
            case KbqSidepanelAnimationState.BottomPanel:
                return transforms.bottomPanel;
            case KbqSidepanelAnimationState.BecomingNormal:
                return transforms.becomingNormal;
            default:
                return null;
        }
    }

    /** @docs-private */
    protected get stateOpacity(): number | null {
        switch (this.animationState) {
            case KbqSidepanelAnimationState.Void:
            case KbqSidepanelAnimationState.BottomPanel:
                return 0;
            case KbqSidepanelAnimationState.Hidden:
                return null;
            default:
                return 1;
        }
    }

    /**
     * Recomputes whether this panel exposes an indent strip, after the stack it belongs to changed.
     *
     * @docs-private
     */
    setWithIndent(withIndent: boolean): void {
        if (this.withIndent === withIndent) return;

        this.withIndent = withIndent;
        this.changeDetectorRef.markForCheck();
    }

    /**
     * Names the sidepanel after the title of its header. A name given through the config wins.
     *
     * @docs-private
     */
    setAriaLabelledBy(id: string): void {
        if (this.ariaLabelledBy !== null) return;

        this.ariaLabelledBy = id;
    }

    /** Reports the transition to `state` starting, and ending once its CSS transition has. */
    private startTransition(state: KbqSidepanelAnimationState): void {
        const pending = this.pendingTransition;

        if (pending) {
            pending.wait.destroy();
            this.pendingTransition = undefined;
            this.animationStateChanged.next({ phaseName: 'done', toState: pending.state });
        }

        this.animationStateChanged.next({ phaseName: 'start', toState: state });

        // A subscriber may have closed and disposed of the sidepanel by now.
        if (this.destroyed) return;

        const wait = kbqAfterAnimations(
            () => this.elementRef.nativeElement,
            () => {
                this.pendingTransition = undefined;
                this.animationStateChanged.next({ phaseName: 'done', toState: state });
            },
            this.injector
        );

        this.pendingTransition = { state, wait };
    }

    private setPanelClass() {
        this.elementRef.nativeElement.classList.add(`kbq-sidepanel-container_${this.position}`);
    }

    private get position(): KbqSidepanelPosition {
        return this.sidepanelConfig.position ?? KbqSidepanelPosition.Right;
    }

    private validatePortalAttached() {
        if (this.portalOutlet().hasAttached()) {
            throw Error('Attempting to attach sidepanel content after content is already attached');
        }
    }
}
