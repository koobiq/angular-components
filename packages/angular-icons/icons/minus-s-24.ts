import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-minus-s-24,[kbqMinusS24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path d="M19.5 12.9v-1.8a.3.3 0 0 0-.3-.3H4.8a.3.3 0 0 0-.3.3v1.8a.3.3 0 0 0 .3.3h14.4a.3.3 0 0 0 .3-.3" />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqMinusS24 extends KbqSvgIcon {}
