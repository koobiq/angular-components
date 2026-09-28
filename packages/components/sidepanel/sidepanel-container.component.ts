import { AnimationEvent } from '@angular/animations';
import { CdkTrapFocus, ConfigurableFocusTrapFactory, FocusTrapFactory } from '@angular/cdk/a11y';
import { BasePortalOutlet, CdkPortalOutlet, ComponentPortal, TemplatePortal } from '@angular/cdk/portal';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentRef,
    ElementRef,
    EmbeddedViewRef,
    EventEmitter,
    inject,
    InjectionToken,
    OnDestroy,
    viewChild,
    ViewEncapsulation
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import {
    kbqSidepanelAnimations,
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
        '[@state]': `{
            value: animationState,
            params: animationTransform
        }`,
        '(@state.start)': 'onAnimation($event)',
        '(@state.done)': 'onAnimation($event)'
    },
    animations: [kbqSidepanelAnimations.sidepanelState]
})
export class KbqSidepanelContainerComponent extends BasePortalOutlet implements OnDestroy {
    private elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private changeDetectorRef = inject(ChangeDetectorRef);
    sidepanelConfig = inject(KbqSidepanelConfig);

    /** Whether the panel exposes the clickable indent strip of the sidepanel stacked underneath it. */
    withIndent = inject(KBQ_SIDEPANEL_WITH_INDENT);

    /** ID for the container DOM element. */
    id: string;

    /**
     * Id of the element naming the sidepanel. Comes from the config, or from `kbq-sidepanel-header`.
     *
     * @docs-private
     */
    ariaLabelledBy: string | null = this.sidepanelConfig.ariaLabelledBy ?? null;

    /** The portal outlet inside of this container into which the content will be loaded. */
    readonly portalOutlet = viewChild.required(CdkPortalOutlet);

    /** The state of the sidepanel animations. */
    animationState: KbqSidepanelAnimationState = KbqSidepanelAnimationState.Void;

    /** @docs-private */
    animationTransform: {
        transformIn: string;
        transformOut: string;
        lower: string;
        bottomPanel: string;
        becomingNormal: string;
    };

    /** Emits whenever the state of the animation changes. */
    animationStateChanged = new EventEmitter<AnimationEvent>();

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
        this.setAnimation();
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
        this.setAnimation();
        this.setPanelClass();

        return this.portalOutlet().attachTemplatePortal(portal);
    }

    /** Begin animation of the sidepanel entrance into view. */
    enter(): void {
        if (this.destroyed) return;

        this.animationState = KbqSidepanelAnimationState.Visible;
        this.changeDetectorRef.detectChanges();
    }

    /** Begin animation of the sidepanel exiting from view. */
    exit(): void {
        if (this.destroyed) return;

        this.setAnimationState(KbqSidepanelAnimationState.Hidden);
    }

    /** @docs-private */
    onAnimation(event: AnimationEvent) {
        this.animationStateChanged.emit(event);
    }

    /** @docs-private */
    setAnimationState(state: KbqSidepanelAnimationState): void {
        this.animationState = state;
        this.changeDetectorRef.markForCheck();
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
        this.changeDetectorRef.markForCheck();
    }

    private setAnimation() {
        const position = this.position;

        this.animationTransform = {
            transformIn: kbqSidepanelTransformAnimation[position].in,
            transformOut: kbqSidepanelTransformAnimation[position].out,
            lower: kbqSidepanelTransformAnimation[position].lower,
            bottomPanel: kbqSidepanelTransformAnimation[position].bottomPanel,
            becomingNormal: kbqSidepanelTransformAnimation[position].becomingNormal
        };
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
