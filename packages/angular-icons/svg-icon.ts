import { Directive, input } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';

@Directive({
    host: {
        'aria-hidden': 'true',
        focusable: 'false',
        class: 'kbq-svg-icon'
    }
})
export class KbqSvgIcon {
    readonly color = input<KbqComponentColors>();
}
