import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-circle-stop-24,[kbqCircleStop24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M12 22.5C6.201 22.5 1.5 17.799 1.5 12S6.201 1.5 12 1.5 22.5 6.201 22.5 12 17.799 22.5 12 22.5M8.251 7.501a.75.75 0 0 0-.75.75v7.498c0 .414.336.75.75.75h7.498a.75.75 0 0 0 .75-.75V8.25a.75.75 0 0 0-.75-.75z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqCircleStop24 extends KbqSvgIcon {}
