import { ChangeDetectionStrategy, Component, inject, ViewEncapsulation } from '@angular/core';
import { RdxAccordionTriggerDirective } from '@radix-ng/primitives/accordion';
import { KbqAccordion, KbqAccordionVariant } from './accordion.component';

@Component({
    selector: 'kbq-accordion-trigger, [kbq-accordion-trigger]',
    template: `
        <i
            class="kbq-accordion-trigger__icon"
            kbq-icon="kbq-chevron-right-s_16"
        ></i>

        <ng-content />
    `,
    styleUrls: ['accordion-trigger.component.scss', 'accordion-tokens.scss'],
    hostDirectives: [RdxAccordionTriggerDirective],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-accordion-trigger',
        '[class.kbq-accordion-trigger_fill]': 'isFill',
        '[class.kbq-accordion-trigger_hug]': 'isHug',
        '[class.kbq-accordion-trigger_hug-space-between]': 'isHugSpaceBetween'
    }
})
export class KbqAccordionTrigger {
    protected accordion: KbqAccordion = inject(KbqAccordion);

    get isFill(): boolean {
        return this.accordion.variant === KbqAccordionVariant.fill;
    }

    get isHug(): boolean {
        return this.accordion.variant === KbqAccordionVariant.hug;
    }

    get isHugSpaceBetween(): boolean {
        return this.accordion.variant === KbqAccordionVariant.hugSpaceBetween;
    }
}
