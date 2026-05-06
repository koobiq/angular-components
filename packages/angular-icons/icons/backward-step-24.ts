import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqBackwardStep24]',
    template: `
        <svg:g>
            <svg:path
                d="M4.5 4.8a.3.3 0 0 1 .3-.3h2.4a.3.3 0 0 1 .3.3v14.4a.3.3 0 0 1-.3.3H4.8a.3.3 0 0 1-.3-.3zM8.034 11.772a.3.3 0 0 0 0 .456l10.971 6.839a.3.3 0 0 0 .496-.228V5.161a.3.3 0 0 0-.496-.228z"
            />
        </svg:g>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 24 24',
        width: '24',
        height: '24'
    }
})
export class KbqBackwardStep24 extends KbqSvgIcon {}
