import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqCircleBolt24]',
    template: `
        <svg:path
            d="M12 22.5c5.799 0 10.5-4.701 10.5-10.5S17.799 1.5 12 1.5 1.5 6.201 1.5 12 6.201 22.5 12 22.5M14.515 6c.126 0 .213.122.169.237l-1.94 5.014h4.326c.155 0 .238.18.133.293L9.9 19.44c-.127.138-.359.013-.307-.165l1.586-5.399H6.93a.176.176 0 0 1-.17-.23L9.337 6.12a.18.18 0 0 1 .17-.12z"
        />
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
export class KbqCircleBolt24 extends KbqSvgIcon {}
