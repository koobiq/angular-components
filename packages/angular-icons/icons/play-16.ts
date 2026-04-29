import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-play-16,[kbqPlay16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M12.906 7.839a.185.185 0 0 1 0 .322l-8.613 5.312c-.129.075-.293-.015-.293-.161V2.688c0-.146.164-.236.293-.16z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqPlay16 extends KbqSvgIcon {}
