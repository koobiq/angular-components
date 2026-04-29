import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-box-archive-arrow-down-24,[kbqBoxArchiveArrowDown24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M3.3 1.5a1.8 1.8 0 0 0-1.8 1.8v2.4a1.8 1.8 0 0 0 1.8 1.8h17.4a1.8 1.8 0 0 0 1.8-1.8V3.3a1.8 1.8 0 0 0-1.8-1.8zM3 9.3h8.1v3.182H8.536c-.224 0-.36.221-.243.393l3.464 5.039a.304.304 0 0 0 .486 0l3.464-5.04a.24.24 0 0 0-.036-.312.3.3 0 0 0-.207-.08H12.9V9.3H21v11.4a1.8 1.8 0 0 1-1.8 1.8H4.8A1.8 1.8 0 0 1 3 20.7z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqBoxArchiveArrowDown24 extends KbqSvgIcon {}
