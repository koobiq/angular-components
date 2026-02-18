import {
    afterNextRender,
    AfterRenderRef,
    AfterViewInit,
    Component,
    inject,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqAccordionTriggerDirective } from './accordion-trigger.directive';
import { KbqAccordion, KbqAccordionVariant } from './accordion.component';
import { kbqInjectNativeElement } from '@koobiq/components/core';

@Component({
    selector: 'kbq-accordion-trigger, [kbq-accordion-trigger]',
    imports: [KbqIcon],
    template: `
        <i class="kbq-accordion-trigger__icon" kbq-icon="{{ isHugSpaceBetween ? 'kbq-chevron-down-s_16' : 'kbq-chevron-right-s_16' }}"></i>

        <ng-content />
    `,
    styleUrls: ['accordion-trigger.component.scss', 'accordion-tokens.scss'],
    encapsulation: ViewEncapsulation.None,
    hostDirectives: [KbqAccordionTriggerDirective],
    host: {
        class: 'kbq-accordion-trigger',
        '[class.kbq-accordion-trigger_fill]': 'isFill',
        '[class.kbq-accordion-trigger_hug]': 'isHug',
        '[class.kbq-accordion-trigger_hug-space-between]': 'isHugSpaceBetween'
    }
})
export class KbqAccordionTrigger implements AfterViewInit {
    /** @docs-private */
    protected readonly nativeElement = kbqInjectNativeElement();
    /** @docs-private */
    protected readonly accordion: KbqAccordion = inject(KbqAccordion);

    /** @docs-private */
    @ViewChild(KbqIcon) icon: KbqIcon;

    private savedTransition: string;
    private readonly afterRenderRef?: AfterRenderRef;

    get isFill(): boolean {
        return this.accordion.variant === KbqAccordionVariant.fill;
    }

    get isHug(): boolean {
        return this.accordion.variant === KbqAccordionVariant.hug;
    }

    get isHugSpaceBetween(): boolean {
        return this.accordion.variant === KbqAccordionVariant.hugSpaceBetween;
    }

    constructor() {
        this.afterRenderRef = afterNextRender(() => {
            setTimeout(() => this.enableAnimation());

            this.afterRenderRef?.destroy();
        });
    }

    ngAfterViewInit(): void {
        this.disableAnimation();
    }

    disableAnimation() {
        this.savedTransition = this.icon.elementRef.nativeElement.style.transition;

        this.icon.getHostElement().style.transition = 'none';
    }

    enableAnimation() {
        this.icon.getHostElement().style.transition = this.savedTransition;
    }
}
