import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-circle-info-16,[kbqCircleInfo16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14m-.839-3.836V6.66c0-.11.09-.2.2-.2h1.266c.11 0 .2.09.2.2v4.504a.2.2 0 0 1-.2.2H7.361a.2.2 0 0 1-.2-.2M7.1 4.841c0-.462.406-.841.899-.841.497 0 .903.38.903.84 0 .466-.406.845-.903.845-.493 0-.9-.379-.9-.844"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqCircleInfo16 extends KbqSvgIcon {}
