import { FocusMonitor } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, ElementRef, Input, OnDestroy, ViewEncapsulation } from '@angular/core';
import { RdxAccordionRootDirective, RdxAccordionType } from '@radix-ng/primitives/accordion';

export type KbqAccordionType = RdxAccordionType;

export enum KbqAccordionVariant {
    fill = 'fill',
    hug = 'hug',
    hugSpaceBetween = 'hugSpaceBetween'
}

@Component({
    selector: 'kbq-accordion, [kbq-accordion]',
    template: '<ng-content />',
    styleUrls: ['accordion.component.scss', 'accordion-tokens.scss'],
    hostDirectives: [
        {
            directive: RdxAccordionRootDirective,
            inputs: ['type', 'collapsible', 'disabled', 'defaultValue', 'value'],
            outputs: ['onValueChange']
        }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-accordion'
    }
})
export class KbqAccordion implements OnDestroy {
    @Input() variant: KbqAccordionVariant | string = KbqAccordionVariant.fill;

    constructor(
        private focusMonitor: FocusMonitor,
        private elementRef: ElementRef<HTMLElement>
    ) {
        this.focusMonitor.monitor(this.elementRef, true);
    }

    ngOnDestroy(): void {
        this.focusMonitor.stopMonitoring(this.elementRef);
    }
}
