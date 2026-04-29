import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-circle-plus-s-16,[kbqCirclePlusS16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M3.757 12.243a6 6 0 1 0 8.486-8.485 6 6 0 0 0-8.486 8.485M10.85 8.6H8.653v2.25a.15.15 0 0 1-.15.15h-.9a.15.15 0 0 1-.15-.15V8.6H5.15A.15.15 0 0 1 5 8.45v-.9a.15.15 0 0 1 .15-.15h2.303V5.15a.15.15 0 0 1 .15-.15h.9a.15.15 0 0 1 .15.15V7.4h2.197a.15.15 0 0 1 .15.15v.9a.15.15 0 0 1-.15.15"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqCirclePlusS16 extends KbqSvgIcon {}
