import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-file-exclamation-o-16,[kbqFileExclamationO16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M7.257 4a.2.2 0 0 1 .2.212l-.355 5.835a.2.2 0 0 1-.2.188h-.987a.2.2 0 0 1-.2-.188l-.352-5.835a.2.2 0 0 1 .2-.212zM6.41 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2"
                />
                <path
                    d="M9.917 0a.2.2 0 0 1 .142.059L13.94 3.94a.2.2 0 0 1 .059.142V14.8a1.2 1.2 0 0 1-1.2 1.2H3.2A1.2 1.2 0 0 1 2 14.8V1.2A1.2 1.2 0 0 1 3.2 0zM9 1.6H3.8a.2.2 0 0 0-.2.2v12.4c0 .11.09.2.2.2h8.4a.2.2 0 0 0 .2-.2V5H9.2a.2.2 0 0 1-.2-.2z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqFileExclamationO16 extends KbqSvgIcon {}
