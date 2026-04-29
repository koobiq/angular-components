import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-file-badge-ban-o-24,[kbqFileBadgeBanO24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M21 6.124a.3.3 0 0 0-.088-.212L15.088.088A.3.3 0 0 0 14.876 0H4.8A1.8 1.8 0 0 0 3 1.8v20.4A1.8 1.8 0 0 0 4.8 24h9.244a7.1 7.1 0 0 1-1.744-2.4H5.7a.3.3 0 0 1-.3-.3V2.7a.3.3 0 0 1 .3-.3h7.8v4.8a.3.3 0 0 0 .3.3h4.8v4.202l.15-.002c.787 0 1.543.129 2.25.367z"
                />
                <path
                    d="M19.817 23.892A5.252 5.252 0 0 0 18.75 13.5a5.25 5.25 0 0 0-.028 10.5h.056q.535-.005 1.039-.108m2.09-3.259-5.04-5.04a3.675 3.675 0 0 1 5.04 5.04m-1.273 1.273a3.675 3.675 0 0 1-5.04-5.04z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqFileBadgeBanO24 extends KbqSvgIcon {}
