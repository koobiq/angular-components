import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-shield-o-24,[kbqShieldO24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M3.9 4.206a.3.3 0 0 1 .3-.3h15.6a.3.3 0 0 1 .3.3v11.862a.3.3 0 0 1-.143.256l-7.8 4.807a.3.3 0 0 1-.314 0l-7.8-4.807a.3.3 0 0 1-.143-.256zM1.5 17.413c0 .104.054.201.143.256l10.2 6.287a.3.3 0 0 0 .314 0l10.2-6.287a.3.3 0 0 0 .143-.256V3.304c0-.996-.806-1.804-1.8-1.804H3.3c-.994 0-1.8.808-1.8 1.804z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqShieldO24 extends KbqSvgIcon {}
