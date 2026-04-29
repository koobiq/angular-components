import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-burst-24,[kbqBurst24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M13.385 7.527 7.829 1.55c-.101-.108-.282-.025-.264.122l.923 7.663L1.65 6.055c-.137-.066-.276.088-.197.217l4.096 6.675-5.42.833a.152.152 0 0 0-.048.285l6.447 3.398-4.38 2.424c-.139.076-.084.286.074.286h7.244l3.809 2.305a.15.15 0 0 0 .194-.029l2.853-3.18h5.555c.13 0 .2-.148.12-.248l-2.737-3.365 4.707-6.077a.152.152 0 0 0-.121-.245h-5.565l2.639-7.619c.05-.145-.123-.265-.242-.167z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqBurst24 extends KbqSvgIcon {}
