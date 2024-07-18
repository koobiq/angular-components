import { AnimationEvent } from '@angular/animations';
import { BasePortalOutlet, CdkPortalOutlet, ComponentPortal, TemplatePortal } from '@angular/cdk/portal';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentRef,
    ElementRef,
    EmbeddedViewRef,
    EventEmitter,
    Inject,
    InjectionToken,
    OnDestroy,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {
    KbqSidepanelAnimationState,
    kbqSidepanelAnimations,
    kbqSidepanelTransformAnimation
} from './sidepanel-animations';
import { KbqSidepanelConfig, KbqSidepanelPosition } from './sidepanel-config';

export const KBQ_SIDEPANEL_WITH_INDENT = new InjectionToken<boolean>('kbq-sidepanel-with-indent');

export const KBQ_SIDEPANEL_WITH_SHADOW = new InjectionToken<boolean>('kbq-sidepanel-with-shadow');

@Component({
    selector: 'kbq-sidepanel-container',
    templateUrl: './sidepanel-container.component.html',
    styleUrls: ['./sidepanel.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    animations: [kbqSidepanelAnimations.sidepanelState],
    host: {
        class: 'kbq-sidepanel-container',
        '[class]': 'size',
        '[class.kbq-sidepanel_nested]': 'withIndent',
        '[class.kbq-sidepanel-container_shadowed]': 'withShadow',
        '[attr.id]': 'id',
        '[attr.tabindex]': '-1',
        '[@state]': `{
            value: animationState,
            params: animationTransform
        }`,
        '(@state.start)': 'onAnimation($event)',
        '(@state.done)': 'onAnimation($event)'
    }
})
export class KbqSidepanelContainerComponent extends BasePortalOutlet implements OnDestroy {
    /** ID for the container DOM element. */
    id: string;

    /** The portal outlet inside of this container into which the content will be loaded. */
    @ViewChild(CdkPortalOutlet, { static: true }) portalOutlet: CdkPortalOutlet;

    /** The state of the sidepanel animations. */
    animationState: KbqSidepanelAnimationState = KbqSidepanelAnimationState.Void;

    animationTransform: { transformIn: string; transformOut: string };

    /** Emits whenever the state of the animation changes. */
    animationStateChanged = new EventEmitter<AnimationEvent>();

    get size(): string {
        return `kbq-sidepanel_${this.sidepanelConfig.size}`;
    }

    /** Whether the component has been destroyed. */
    private destroyed: boolean;

    constructor(
        private elementRef: ElementRef<HTMLElement>,
        private changeDetectorRef: ChangeDetectorRef,
        public sidepanelConfig: KbqSidepanelConfig,
        @Inject(KBQ_SIDEPANEL_WITH_INDENT) public withIndent: boolean,
        @Inject(KBQ_SIDEPANEL_WITH_SHADOW) public withShadow: boolean
    ) {
        super();
    }

    ngOnDestroy(): void {
        this.destroyed = true;
    }

    /** Attach a component portal as content to this sidepanel container. */
    attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T> {
        this.validatePortalAttached();
        this.setAnimation();
        this.setPanelClass();

        return this.portalOutlet.attachComponentPortal(portal);
    }

    /** Attach a template portal as content to this sidepanel container. */
    attachTemplatePortal<C>(portal: TemplatePortal<C>): EmbeddedViewRef<C> {
        this.validatePortalAttached();
        this.setAnimation();
        this.setPanelClass();

        return this.portalOutlet.attachTemplatePortal(portal);
    }

    /** Begin animation of the sidepanel entrance into view. */
    enter(): void {
        if (this.destroyed) {
            return;
        }

        this.animationState = KbqSidepanelAnimationState.Visible;
        this.changeDetectorRef.detectChanges();
    }

    /** Begin animation of the sidepanel exiting from view. */
    exit(): void {
        if (this.destroyed) {
            return;
        }

        this.animationState = KbqSidepanelAnimationState.Hidden;
        this.changeDetectorRef.markForCheck();
    }

    onAnimation(event: AnimationEvent) {
        this.animationStateChanged.emit(event);
    }

    private setAnimation() {
        const position: KbqSidepanelPosition = this.sidepanelConfig.position!;

        this.animationTransform = {
            transformIn: kbqSidepanelTransformAnimation[position].in,
            transformOut: kbqSidepanelTransformAnimation[position].out
        };
    }

    private setPanelClass() {
        const element: HTMLElement = this.elementRef.nativeElement;
        const position: KbqSidepanelPosition = this.sidepanelConfig.position!;

        element.classList.add(`kbq-sidepanel-container_${position}`);
    }

    private validatePortalAttached() {
        if (this.portalOutlet.hasAttached()) {
            throw Error('Attempting to attach sidepanel content after content is already attached');
        }
    }
}
