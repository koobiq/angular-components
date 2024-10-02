import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'kbq-accordion',
    templateUrl: './accordion.component.html',
    styleUrls: ['accordion.component.scss', 'accordion-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-accordion'
    }
})
export class KbqAccordion {}
