import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-aix-24,[kbqAix24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M16.687 6.545a.3.3 0 0 1 .258.148l2.113 3.57h.085l2.124-3.57a.3.3 0 0 1 .257-.148h1.9a.3.3 0 0 1 .256.457L20.63 12l3.117 4.996a.3.3 0 0 1-.255.459H21.55a.3.3 0 0 1-.257-.146l-2.15-3.578h-.085l-2.15 3.578a.3.3 0 0 1-.257.145h-1.93a.3.3 0 0 1-.255-.459L17.593 12l-3.07-4.998a.3.3 0 0 1 .256-.457zM13.098 6.545a.3.3 0 0 1 .3.3v10.31a.3.3 0 0 1-.3.3H11.39a.3.3 0 0 1-.3-.3V6.844a.3.3 0 0 1 .3-.3zM2.418 17.247a.3.3 0 0 1-.285.207H.3a.3.3 0 0 1-.283-.397l3.559-10.31a.3.3 0 0 1 .283-.202h2.545a.3.3 0 0 1 .283.203l3.554 10.309a.3.3 0 0 1-.284.398H8.124a.3.3 0 0 1-.285-.208l-.742-2.28H3.161zm1.328-4.08h2.77L5.174 9.038H5.09z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqAix24 extends KbqSvgIcon {}
