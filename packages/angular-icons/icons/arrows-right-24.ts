import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-arrows-right-24,[kbqArrowsRight24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M22.412 8.108a.3.3 0 0 0 0-.425l-6.463-6.47a.3.3 0 0 0-.427 0L14.24 2.495a.3.3 0 0 0 0 .426l3.762 3.766H1.802a.3.3 0 0 0-.302.302v1.814c0 .166.135.3.302.3h16.201l-3.762 3.767a.3.3 0 0 0 0 .426l1.28 1.282c.119.118.31.118.428 0zM1.5 15.197c0-.167.135-.302.302-.302h11.477l2.414 2.417H1.802a.3.3 0 0 1-.302-.301zm16.503 2.115h-2.225l4.027-4.03 2.607 2.609a.3.3 0 0 1 0 .426l-6.463 6.47a.3.3 0 0 1-.427 0l-1.281-1.283a.3.3 0 0 1 0-.426z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqArrowsRight24 extends KbqSvgIcon {}
