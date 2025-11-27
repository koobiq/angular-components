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
import { KbqAccordionRootDirective } from './accordion-root.directive';

export enum KbqAccordionVariant {
    fill = 'fill',
    hug = 'hug',
    hugSpaceBetween = 'hugSpaceBetween'
}

@Component({
    selector: 'kbq-accordion, [kbq-accordion]',
    template: '<ng-content />',
    styleUrls: ['accordion.component.scss', 'accordion-tokens.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [
        {
            directive: KbqAccordionRootDirective,
            inputs: ['type', 'collapsible', 'disabled', 'defaultValue', 'value'],
            outputs: ['onValueChange']
        }
    ],
    host: {
        class: 'kbq-accordion'
    }
})
export class KbqAccordion implements OnDestroy, AfterViewInit {
    protected readonly focusMonitor = inject(FocusMonitor);
    protected readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    @Input() variant: KbqAccordionVariant | string = KbqAccordionVariant.fill;

    ngAfterViewInit(): void {
        this.focusMonitor.monitor(this.elementRef, true);
    }

    ngOnDestroy(): void {
        this.focusMonitor.stopMonitoring(this.elementRef);
    }
}
