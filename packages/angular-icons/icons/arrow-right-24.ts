import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-arrow-right-24,[kbqArrowRight24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M17.997 13.18H1.802a.3.3 0 0 1-.302-.3v-1.81a.3.3 0 0 1 .302-.299h16.195l-5.28-5.257a.297.297 0 0 1 0-.422l1.284-1.279a.304.304 0 0 1 .428 0l7.983 7.951a.297.297 0 0 1 0 .422l-7.983 7.951a.304.304 0 0 1-.428 0l-1.283-1.278a.297.297 0 0 1 0-.422z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqArrowRight24 extends KbqSvgIcon {}
