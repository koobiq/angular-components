import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-file-lines-short-24,[kbqFileLinesShort24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M3 1.8A1.8 1.8 0 0 1 4.8 0h14.4A1.8 1.8 0 0 1 21 1.8v20.4a1.8 1.8 0 0 1-1.8 1.8H4.8A1.8 1.8 0 0 1 3 22.2zM6 6a.3.3 0 0 0 .3.3h5.4A.3.3 0 0 0 12 6V4.8a.3.3 0 0 0-.3-.3H6.3a.3.3 0 0 0-.3.3z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqFileLinesShort24 extends KbqSvgIcon {}
