import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-link-16,[kbqLink16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M7.864 7.015 6.808 5.959a1.195 1.195 0 0 1 0-1.69l2.97-2.97a1.195 1.195 0 0 1 1.69 0l3.237 3.238a1.195 1.195 0 0 1 0 1.69l-2.97 2.97a1.194 1.194 0 0 1-1.69 0L8.99 8.14l-.845.845 1.056 1.055a1.194 1.194 0 0 1 0 1.69l-2.975 2.974a1.194 1.194 0 0 1-1.69 0L1.3 11.467a1.195 1.195 0 0 1 0-1.689l2.975-2.975a1.195 1.195 0 0 1 1.689 0L7.02 7.86zm5.292-1.492a.2.2 0 0 0 0-.283l-2.392-2.392a.2.2 0 0 0-.283 0L8.357 4.973a.2.2 0 0 0 0 .283l.633.632 1.57-1.57a.2.2 0 0 1 .283 0l.843.844a.2.2 0 0 1 0 .283l-1.57 1.57.633.633a.2.2 0 0 0 .283 0zM7.02 10.112l-1.385 1.385a.2.2 0 0 1-.283 0l-.843-.844a.2.2 0 0 1 0-.282l1.385-1.385-.633-.633a.2.2 0 0 0-.283 0L2.848 10.48a.2.2 0 0 0 0 .283l2.392 2.392a.2.2 0 0 0 .283 0l2.129-2.129a.2.2 0 0 0 0-.282z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqLink16 extends KbqSvgIcon {}
