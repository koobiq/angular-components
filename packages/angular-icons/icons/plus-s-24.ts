import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-plus-s-24,[kbqPlusS24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M13.307 13.2H19.2a.3.3 0 0 0 .3-.3v-1.8a.3.3 0 0 0-.3-.3h-5.893v-6a.3.3 0 0 0-.3-.3h-1.8a.3.3 0 0 0-.3.3v6H4.8a.3.3 0 0 0-.3.3v1.8a.3.3 0 0 0 .3.3h6.107v6a.3.3 0 0 0 .3.3h1.8a.3.3 0 0 0 .3-.3z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqPlusS24 extends KbqSvgIcon {}
