import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-list-ol-24,[kbqListOl24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M4.021 1.5v9H2.088V3.699L0 4.335V2.84L3.83 1.5zM22.5 4.5c0 .166-.133.3-.296.3H8.096a.3.3 0 0 1-.296-.3V3.3c0-.166.133-.3.296-.3h14.108c.163 0 .296.134.296.3zM18.081 8.7c0 .166-.132.3-.296.3H8.096a.3.3 0 0 1-.296-.3V7.5c0-.166.133-.3.296-.3h9.69c.163 0 .295.134.295.3zM8.096 16.8a.3.3 0 0 1-.296-.3v-1.2c0-.166.133-.3.296-.3h14.108c.163 0 .296.134.296.3v1.2c0 .166-.133.3-.296.3zM7.8 20.7c0 .166.133.3.296.3h9.69a.3.3 0 0 0 .295-.3v-1.2c0-.166-.132-.3-.296-.3H8.096a.3.3 0 0 0-.296.3zM6.313 22.5v-1.48h-3.65l1.34-1.524q.476-.475.853-.902.378-.432.646-.847.269-.414.409-.835.146-.42.146-.871 0-.798-.335-1.365a2.2 2.2 0 0 0-.987-.871Q4.083 13.5 3.12 13.5q-.939 0-1.64.402A2.87 2.87 0 0 0 0 16.443h1.913q0-.42.14-.75.14-.334.403-.523.262-.19.627-.19.341 0 .58.147a.9.9 0 0 1 .359.42 1.58 1.58 0 0 1 .018 1.207q-.11.286-.353.64a9 9 0 0 1-.64.816L.183 21.245V22.5z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqListOl24 extends KbqSvgIcon {}
