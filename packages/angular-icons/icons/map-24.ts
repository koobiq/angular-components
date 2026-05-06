import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqMap24]',
    template: `
        <svg:g>
            <svg:path
                d="M16.5 3.228a.15.15 0 0 1 .213-.136l4.114 1.918a.3.3 0 0 1 .173.272V20.85a.15.15 0 0 1-.213.137l-4.113-2.617a.3.3 0 0 1-.174-.275zM7.5 20.769a.15.15 0 0 1-.213.135l-4.114-1.918A.3.3 0 0 1 3 18.714V3.151a.15.15 0 0 1 .213-.137l4.113 2.617c.106.05.174.157.174.275zM14.481 3.028a.15.15 0 0 1 .219.135v14.94a.3.3 0 0 1-.163.269l-5.018 2.6a.15.15 0 0 1-.219-.135V5.897c0-.113.063-.217.163-.269z"
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
export class KbqMap24 extends KbqSvgIcon {}
