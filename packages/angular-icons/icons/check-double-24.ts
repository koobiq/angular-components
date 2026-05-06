import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqCheckDouble24]',
    template: `
        <svg:g>
            <svg:path
                d="M17.904 7.012a.31.31 0 0 1 0 .432L7.144 18.286a.3.3 0 0 1-.428 0L.09 11.607a.31.31 0 0 1 0-.433l1.287-1.297c.119-.12.31-.12.429 0l5.125 5.165 9.258-9.329c.119-.119.31-.119.429 0zM12.716 18.286l-1.543-1.556L22.188 5.714c.119-.119.31-.119.429 0l1.287 1.298a.31.31 0 0 1 0 .432l-10.76 10.842a.3.3 0 0 1-.428 0"
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
export class KbqCheckDouble24 extends KbqSvgIcon {}
