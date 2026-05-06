import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqListUl24]',
    template: `
        <svg:g>
            <svg:path
                d="M6 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0M22.328 4.772a.3.3 0 0 1-.124.028H8.096a.3.3 0 0 1-.074-.01L8 4.783l-.018-.006A.3.3 0 0 1 7.8 4.5V3.3c0-.166.133-.3.296-.3h14.108a.3.3 0 0 1 .296.3v1.2a.3.3 0 0 1-.172.272M18.082 8.7c0 .166-.133.3-.297.3H8.096a.3.3 0 0 1-.296-.3V7.5c0-.166.133-.3.296-.3h9.69a.3.3 0 0 1 .296.3zM8.096 16.8a.3.3 0 0 1-.296-.3v-1.2c0-.166.133-.3.296-.3h14.108a.3.3 0 0 1 .296.3v1.2c0 .166-.133.3-.296.3zM7.8 20.7c0 .166.133.3.296.3h9.69a.3.3 0 0 0 .295-.3v-1.2a.3.3 0 0 0-.067-.191.3.3 0 0 0-.229-.109H8.096a.296.296 0 0 0-.296.3zM3 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6"
            />
        </svg:g>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 24 24',
        width: '24',
        height: '24'
    }
})
export class KbqListUl24 extends KbqSvgIcon {}
