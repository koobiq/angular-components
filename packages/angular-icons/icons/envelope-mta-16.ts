import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqEnvelopeMta16]',
    template: `
        <svg:g>
            <svg:path
                d="M5.262 11a.2.2 0 0 1 .185.124l.963 2.35h.047l.964-2.35A.2.2 0 0 1 7.606 11h.862c.11 0 .2.09.2.2v3.596a.2.2 0 0 1-.2.2h-.54a.2.2 0 0 1-.2-.2V12.54h-.034l-.96 2.43h-.6l-.96-2.444H5.14v2.269a.2.2 0 0 1-.2.2H4.4a.2.2 0 0 1-.2-.2V11.2c0-.11.089-.2.2-.2zM12.268 11c.11 0 .2.09.2.2v.384a.2.2 0 0 1-.2.2h-1.012v3.012a.2.2 0 0 1-.2.2h-.552a.2.2 0 0 1-.2-.2v-3.012H9.29a.2.2 0 0 1-.2-.2V11.2a.2.2 0 0 1 .2-.2zM14.55 11a.2.2 0 0 1 .19.136l1.213 3.596a.2.2 0 0 1-.19.264h-.612a.2.2 0 0 1-.191-.14l-.22-.699h-1.38l-.218.698a.2.2 0 0 1-.19.141h-.613a.2.2 0 0 1-.19-.264l1.213-3.596a.2.2 0 0 1 .19-.136zm-.96 2.423h.92l-.445-1.416h-.03z"
            />
            <svg:path d="M15 10H4.2A1.2 1.2 0 0 0 3 11.2V14h-.8A1.2 1.2 0 0 1 1 12.8V4.832l7 3.377 7-3.377z" />
            <svg:path d="M13.8 2A1.2 1.2 0 0 1 15 3.2v.3L8 6.877 1 3.5v-.3A1.2 1.2 0 0 1 2.2 2z" />
        </svg:g>
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
export class KbqEnvelopeMta16 extends KbqSvgIcon {}
