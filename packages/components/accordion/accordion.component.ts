import { FocusMonitor } from '@angular/cdk/a11y';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    inject,
    Input,
    OnDestroy,
    ViewEncapsulation
} from '@angular/core';
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
export class KbqAccordion implements OnDestroy, AfterViewInit {
    protected readonly focusMonitor = inject(FocusMonitor);
    protected readonly elementRef = inject(ElementRef<HTMLElement>);

    @Input() variant: KbqAccordionVariant | string = KbqAccordionVariant.fill;

    ngAfterViewInit(): void {
        this.focusMonitor.monitor(this.elementRef, true);
    }

    ngOnDestroy(): void {
        this.focusMonitor.stopMonitoring(this.elementRef);
    }
}
