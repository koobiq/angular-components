import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqArrowUpFromBracket16]',
    template: `
        <svg:g>
            <svg:path
                d="m8.8 3.96 2.494 2.476a.2.2 0 0 0 .281 0l.847-.84a.2.2 0 0 0 0-.287L8.14 1.058a.2.2 0 0 0-.281 0L3.579 5.309a.2.2 0 0 0 0 .287l.846.84a.2.2 0 0 0 .281 0L7.2 3.96v7.017a.2.2 0 0 0 .2.2h1.2a.2.2 0 0 0 .2-.2z"
            />
            <svg:path
                d="M1 13.793V9.166a.2.2 0 0 1 .2-.2h1.2c.11 0 .2.09.2.2v4.225h10.8V9.166a.2.2 0 0 1 .2-.2h1.2c.11 0 .2.09.2.2v4.627C15 14.46 14.463 15 13.8 15H2.2c-.663 0-1.2-.54-1.2-1.207"
            />
        </svg:g>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 16 16',
        width: '16',
        height: '16'
    }
})
export class KbqArrowUpFromBracket16 extends KbqSvgIcon {}
