import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-user-multiple-16,[kbqUserMultiple16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M7.884 3.102C9.11 3.67 9.91 4.97 10.04 6.357c1.165-.032 2.104-1.491 2.104-2.857 0-1.38-.96-2.5-2.143-2.5-1.067 0-1.952.91-2.116 2.102m5.093 8.398h.872a.2.2 0 0 0 .192-.145l.698-2.442a1.2 1.2 0 0 0-.567-1.377l-1.928-1.08c-.526.6-1.29 1.101-2.244 1.101h-.014c-.066.38-.177.753-.326 1.104l2.216 1.33a2.4 2.4 0 0 1 1.101 1.509m-4.12-4.75c0 1.519-1.055 3.143-2.357 3.143S4.143 8.269 4.143 6.75 5.198 4 6.5 4s2.357 1.231 2.357 2.75M6.5 11.093c1.12 0 1.997-.657 2.56-1.393l2.198 1.32a1.2 1.2 0 0 1 .554 1.289l-.563 2.534a.2.2 0 0 1-.195.157H1.946a.2.2 0 0 1-.195-.157l-.563-2.534a1.2 1.2 0 0 1 .554-1.29L3.94 9.7c.563.736 1.44 1.393 2.56 1.393"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqUserMultiple16 extends KbqSvgIcon {}
