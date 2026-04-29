import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-disk-drive-24,[kbqDiskDrive24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M1.5 1.8a.3.3 0 0 1 .3-.3h3.9v21H1.8a.3.3 0 0 1-.3-.3zM19.2 1.5H7.5v11.148C8.542 8.65 12.176 5.7 16.5 5.7c1.05 0 2.059.174 3 .494V1.8a.3.3 0 0 0-.3-.3M11 22.5a9.3 9.3 0 0 1-3.5-5.148V22.5z"
                />
                <path d="M16.5 22.5a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15m0-4.5a3 3 0 1 1 0-6 3 3 0 0 1 0 6" />
                <path d="M18 15a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0" />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqDiskDrive24 extends KbqSvgIcon {}
