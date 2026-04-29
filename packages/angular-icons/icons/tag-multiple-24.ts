import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-tag-multiple-24,[kbqTagMultiple24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M22.41 11.686a.3.3 0 0 0 .09-.215V3.304A.304.304 0 0 0 22.196 3h-8.17a.3.3 0 0 0-.216.089L3.528 13.369a1.82 1.82 0 0 0 0 2.579l6.02 6.018a1.825 1.825 0 0 0 2.58 0zM14.998 8.25a2.25 2.25 0 1 1 4.501 0 2.25 2.25 0 0 1-4.5 0M.812 8.233l1.13 4.217q.142-.185.312-.354l8.353-8.35-8.522 2.282A1.8 1.8 0 0 0 .812 8.233"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqTagMultiple24 extends KbqSvgIcon {}
