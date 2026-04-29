import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-diamond-o-24,[kbqDiamondO24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M4.15 12 12 4.149 19.851 12l-7.85 7.85zm-3.183-.212a.3.3 0 0 0 0 .424l10.821 10.82a.3.3 0 0 0 .424 0l10.821-10.82a.3.3 0 0 0 0-.424L12.213.967a.3.3 0 0 0-.425 0z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqDiamondO24 extends KbqSvgIcon {}
