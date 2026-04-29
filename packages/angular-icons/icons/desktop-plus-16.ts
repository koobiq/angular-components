import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-desktop-plus-16,[kbqDesktopPlus16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M2.2 1h11.6A1.2 1.2 0 0 1 15 2.2v7.6a1.2 1.2 0 0 1-1.2 1.2H2.2A1.2 1.2 0 0 1 1 9.8V2.2A1.2 1.2 0 0 1 2.2 1m6.453 5.6h2.197a.15.15 0 0 0 .15-.15v-.9a.15.15 0 0 0-.15-.15H8.653V3.15a.15.15 0 0 0-.15-.15h-.9a.15.15 0 0 0-.15.15V5.4H5.15a.15.15 0 0 0-.15.15v.9c0 .083.067.15.15.15h2.303v2.25c0 .083.067.15.15.15h.9a.15.15 0 0 0 .15-.15zM6 13.4v-1.2h3.997v1.2H13V15H3v-1.6z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqDesktopPlus16 extends KbqSvgIcon {}
