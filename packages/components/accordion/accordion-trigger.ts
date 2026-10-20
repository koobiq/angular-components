import { Platform } from '@angular/cdk/platform';
import {
    afterNextRender,
    AfterRenderRef,
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    inject,
    OnDestroy,
    viewChild,
    ViewEncapsulation
} from '@angular/core';
import { kbqAnimationsDisabled } from '@koobiq/components/core';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqAccordion } from './accordion';
import { KbqAccordionTriggerDirective } from './accordion-trigger.directive';

@Component({
    selector: 'kbq-accordion-trigger, [kbq-accordion-trigger]',
    imports: [KbqIcon],
    template: `
        <i
            kbq-icon="{{ isHugSpaceBetween ? 'kbq-chevron-down-s_16' : 'kbq-chevron-right-s_16' }}"
            class="kbq-accordion-trigger__icon"
            [class.kbq-animations-disabled]="animationsDisabled"
        ></i>

        <ng-content />
    `,
    styleUrls: ['accordion-trigger.scss', 'accordion-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-accordion-trigger',
        '[class.kbq-accordion-trigger_fill]': 'isFill',
        '[class.kbq-accordion-trigger_hug]': 'isHug',
        '[class.kbq-accordion-trigger_hug-space-between]': 'isHugSpaceBetween'
    },
    hostDirectives: [KbqAccordionTriggerDirective]
})
export class KbqAccordionTrigger implements AfterViewInit, OnDestroy {
    private readonly platform = inject(Platform);

    /** @docs-private */
    protected readonly accordion: KbqAccordion = inject(KbqAccordion);

    /** @docs-private */
    readonly icon = viewChild.required(KbqIcon);

    /**
     * Whether the icon turns without motion.
     * @docs-private
     */
    protected readonly animationsDisabled = kbqAnimationsDisabled();

    private savedTransition: string;
    private readonly afterRenderRef?: AfterRenderRef;
    private animationTimerId?: ReturnType<typeof setTimeout>;

    get isFill(): boolean {
        return this.accordion.variant() === 'fill';
    }

    get isHug(): boolean {
        return this.accordion.variant() === 'hug';
    }

    get isHugSpaceBetween(): boolean {
        return this.accordion.variant() === 'hugSpaceBetween';
    }

    constructor() {
        this.afterRenderRef = afterNextRender(() => {
            this.animationTimerId = setTimeout(() => this.enableAnimation());

            this.afterRenderRef?.destroy();
        });
    }

    ngAfterViewInit(): void {
        // Skipped on the server: the write would reach the prerendered `style` attribute, and hydration
        // reuses that node, so the client would read `none` back as the transition worth restoring and
        // `enableAnimation()` would make it permanent. There is nothing to suppress without a paint.
        if (!this.platform.isBrowser) return;

        this.disableAnimation();
    }

    ngOnDestroy(): void {
        clearTimeout(this.animationTimerId);
    }

    disableAnimation() {
        this.savedTransition = this.icon().elementRef.nativeElement.style.transition;

        this.icon().getHostElement().style.transition = 'none';
    }

    enableAnimation() {
        this.icon().getHostElement().style.transition = this.savedTransition;
    }
}
