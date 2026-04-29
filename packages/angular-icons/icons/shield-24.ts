import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-shield-24,[kbqShield24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M1.5 3.303c0-.996.806-1.803 1.8-1.803h17.4c.994 0 1.8.807 1.8 1.803v14.075a.3.3 0 0 1-.172.272l-10.2 6.321a.3.3 0 0 1-.256 0l-10.2-6.321a.3.3 0 0 1-.172-.272z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqShield24 extends KbqSvgIcon {}
