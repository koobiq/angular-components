import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-text-overflow-24,[kbqTextOverflow24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24">
            <path
                d="M23.7 5.378a.3.3 0 0 0 .3-.3V3.3a.3.3 0 0 0-.3-.3H.3a.3.3 0 0 0-.3.3v1.778a.3.3 0 0 0 .3.3zM24 20.7a.3.3 0 0 1-.3.3H.3a.3.3 0 0 1-.3-.3v-1.778a.3.3 0 0 1 .3-.3h23.4a.3.3 0 0 1 .3.3zM.3 13.198h17.385v2.359a.3.3 0 0 0 .458.255l5.717-3.548a.3.3 0 0 0 0-.51l-5.717-3.548a.3.3 0 0 0-.458.254v2.36H.3a.3.3 0 0 0-.3.3v1.778a.3.3 0 0 0 .3.3"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqTextOverflow24 extends KbqSvgIcon {}
