import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-infinity-16,[kbqInfinity16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M1.11 5.348a3.814 3.814 0 0 1 5.355 0L8 6.868l1.535-1.52a3.814 3.814 0 0 1 5.356 0 3.724 3.724 0 0 1 0 5.304 3.814 3.814 0 0 1-5.356 0L8 9.132l-1.535 1.52a3.814 3.814 0 0 1-5.356 0 3.724 3.724 0 0 1 0-5.304m4.164 1.18a2.117 2.117 0 0 0-2.973 0 2.067 2.067 0 0 0 0 2.944 2.117 2.117 0 0 0 2.973 0L6.76 8zm5.452 2.944a2.117 2.117 0 0 0 2.973 0 2.067 2.067 0 0 0 0-2.944 2.117 2.117 0 0 0-2.973 0L9.24 8z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqInfinity16 extends KbqSvgIcon {}
