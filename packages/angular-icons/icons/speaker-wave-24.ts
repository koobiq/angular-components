import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqSpeakerWave24]',
    template: `
        <svg:g>
            <svg:path
                d="M19.483 8.9a8.1 8.1 0 0 0-1.547-2.412.31.31 0 0 1 .004-.428l1.272-1.272a.293.293 0 0 1 .422.003 10.5 10.5 0 0 1 0 14.418.293.293 0 0 1-.422.003L17.94 17.94a.31.31 0 0 1-.004-.428A8.1 8.1 0 0 0 19.483 8.9"
            />
            <svg:path
                d="M15.742 10.45a4 4 0 0 0-.674-1.094.32.32 0 0 1 .008-.432l1.273-1.273a.29.29 0 0 1 .419.005 6.45 6.45 0 0 1 0 8.688.29.29 0 0 1-.42.005l-1.272-1.273a.32.32 0 0 1-.008-.432 4.05 4.05 0 0 0 .674-4.194M3.3 15.75h4.2l5.07 5.205c.094.096.256.028.256-.108V3.153c0-.136-.162-.204-.256-.108L7.5 8.25H3.3a1.8 1.8 0 0 0-1.8 1.8v3.9a1.8 1.8 0 0 0 1.8 1.8"
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
export class KbqSpeakerWave24 extends KbqSvgIcon {}
