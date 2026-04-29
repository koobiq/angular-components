import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-box-archive-16,[kbqBoxArchive16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M1 2.2A1.2 1.2 0 0 1 2.2 1h11.6A1.2 1.2 0 0 1 15 2.2v1.6A1.2 1.2 0 0 1 13.8 5H2.2A1.2 1.2 0 0 1 1 3.8zM14 6.2H2v7.6A1.2 1.2 0 0 0 3.2 15h9.6a1.2 1.2 0 0 0 1.2-1.2zM6.2 7.8h3.6c.11 0 .2.09.2.2v.8a.2.2 0 0 1-.2.2H6.2a.2.2 0 0 1-.2-.2V8c0-.11.09-.2.2-.2"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqBoxArchive16 extends KbqSvgIcon {}
