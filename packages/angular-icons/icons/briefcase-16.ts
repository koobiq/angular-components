import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqBriefcase16]',
    template: `
        <svg:g>
            <svg:path
                d="M4 3a2 2 0 0 1 2-2h4.041a2 2 0 0 1 2 2v1H13.8A1.2 1.2 0 0 1 15 5.2V6.81A1.2 1.2 0 0 1 13.8 8H2.2A1.2 1.2 0 0 1 1 6.8V5.2A1.2 1.2 0 0 1 2.2 4H4zm6.441 0a.4.4 0 0 0-.4-.4H6a.4.4 0 0 0-.4.4v1h4.841zM2.2 9.2c-.437 0-.847-.117-1.2-.321v3.92A1.2 1.2 0 0 0 2.2 14h11.6a1.2 1.2 0 0 0 1.2-1.2V8.88a2.4 2.4 0 0 1-1.2.321H9v1.6a.2.2 0 0 1-.2.2H7.2a.2.2 0 0 1-.2-.2V9.2z"
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
export class KbqBriefcase16 extends KbqSvgIcon {}
