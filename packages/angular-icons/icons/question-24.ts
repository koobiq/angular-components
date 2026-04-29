import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-question-24,[kbqQuestion24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M13.21 15.675a.31.31 0 0 1-.306.296h-2.512a.295.295 0 0 1-.297-.304q.034-1.02.217-1.74.21-.84.697-1.52.502-.683 1.326-1.442.642-.577 1.158-1.088.516-.524.823-1.1a2.9 2.9 0 0 0 .307-1.35q0-.826-.293-1.403a2 2 0 0 0-.865-.878q-.558-.3-1.395-.301-.698 0-1.312.262a2.2 2.2 0 0 0-.99.786q-.312.433-.385 1.1a.32.32 0 0 1-.31.29H6.304a.29.29 0 0 1-.293-.306q.091-1.452.825-2.473.81-1.127 2.177-1.69 1.367-.564 3.056-.564 1.869 0 3.195.603 1.326.59 2.023 1.73Q18 5.71 18 7.308q0 1.154-.488 2.097a7.6 7.6 0 0 1-1.27 1.743 31 31 0 0 1-1.689 1.599q-.78.668-1.06 1.455a5.2 5.2 0 0 0-.283 1.473M14.025 19.5a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqQuestion24 extends KbqSvgIcon {}
