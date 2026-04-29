import { Directive } from '@angular/core';

@Directive({
    host: {
        'aria-hidden': 'true',
        focusable: 'false',
        class: 'kbq-svg-icon'
    }
})
export class KbqSvgIcon {}
