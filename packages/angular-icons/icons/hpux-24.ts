import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-hpux-24,[kbqHpux24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="m13.834 16.597-2.146 5.898q.156.005.311.005c5.8 0 10.501-4.702 10.501-10.5 0-5.8-4.7-10.5-10.501-10.5q-.236 0-.472.012L9.381 7.415h1.87c1.113 0 1.712.855 1.331 1.903l-2.617 7.194a.13.13 0 0 1-.124.086H7.897a.13.13 0 0 1-.124-.177l2.779-7.626H8.88l-2.812 7.716a.13.13 0 0 1-.123.086H3.998a.13.13 0 0 1-.123-.176L9.166 1.888C4.744 3.125 1.5 7.184 1.5 12c0 4.958 3.44 9.115 8.062 10.213L14.918 7.5a.13.13 0 0 1 .123-.086h4.005c1.116 0 1.715.855 1.333 1.903l-2.327 6.395c-.177.486-.747.884-1.266.884zm2.848-7.808h1.67l-2.34 6.424H14.34z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqHpux24 extends KbqSvgIcon {}
