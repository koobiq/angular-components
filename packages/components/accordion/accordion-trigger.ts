import {
    afterNextRender,
    AfterRenderRef,
    AfterViewInit,
    Component,
    inject,
    OnDestroy,
    viewChild,
    ViewEncapsulation
} from '@angular/core';
import { kbqInjectNativeElement } from '@koobiq/components/core';
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
        ></i>

        <ng-content />
    `,
    styleUrls: ['accordion-trigger.scss', 'accordion-tokens.scss'],
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
    /** @docs-private */
    protected readonly nativeElement = kbqInjectNativeElement();
    /** @docs-private */
    protected readonly accordion: KbqAccordion = inject(KbqAccordion);

    /** @docs-private */
    readonly icon = viewChild.required(KbqIcon);

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
