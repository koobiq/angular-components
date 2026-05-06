import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqFence16]',
    template: `
        <svg:path
            d="m3.096 2.073-1.05 1.272A.2.2 0 0 0 2 3.472v2.116H.2a.2.2 0 0 0-.2.2v1.2c0 .11.09.2.2.2H2v3.4H.2a.2.2 0 0 0-.2.2v1.2c0 .11.09.2.2.2H2V14.3c0 .11.09.2.2.2h2.1a.2.2 0 0 0 .2-.2v-2.112h2.25V14.3c0 .11.09.2.2.2h2.1a.2.2 0 0 0 .2-.2v-2.112h2.25V14.3c0 .11.09.2.2.2h2.1a.2.2 0 0 0 .2-.2v-2.112h1.8a.2.2 0 0 0 .2-.2v-1.2a.2.2 0 0 0-.2-.2H14v-3.4h1.8a.2.2 0 0 0 .2-.2v-1.2a.2.2 0 0 0-.2-.2H14V3.472a.2.2 0 0 0-.046-.127l-1.05-1.272a.2.2 0 0 0-.308 0l-1.05 1.272a.2.2 0 0 0-.046.127v2.116H9.25V3.472a.2.2 0 0 0-.046-.127l-1.05-1.272a.2.2 0 0 0-.308 0l-1.05 1.272a.2.2 0 0 0-.046.127v2.116H4.5V3.472a.2.2 0 0 0-.046-.127l-1.05-1.272a.2.2 0 0 0-.308 0M11.5 7.188v3.4H9.25v-3.4zm-4.75 0v3.4H4.5v-3.4z"
        />
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 16 16',
        width: '16',
        height: '16'
    }
})
export class KbqFence16 extends KbqSvgIcon {}
