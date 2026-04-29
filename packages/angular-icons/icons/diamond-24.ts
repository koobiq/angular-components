import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-diamond-24,[kbqDiamond24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M.967 12.212a.3.3 0 0 1 0-.424L11.788.967a.3.3 0 0 1 .424 0l10.821 10.82a.3.3 0 0 1 0 .425l-10.82 10.82a.3.3 0 0 1-.425 0z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqDiamond24 extends KbqSvgIcon {}
