import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-sun-moon-24,[kbqSunMoon24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M13.736 3.782a2.85 2.85 0 0 0 3.307 1.37l2.308-.68a.143.143 0 0 1 .177.178l-.68 2.307a2.85 2.85 0 0 0 1.37 3.307l2.954 1.61a.143.143 0 0 1 0 .251l-2.953 1.611a2.85 2.85 0 0 0-1.37 3.307l.678 2.307a.142.142 0 0 1-.176.177l-2.308-.678a2.85 2.85 0 0 0-3.307 1.37l-1.61 2.953a.143.143 0 0 1-.251 0l-1.611-2.954a2.85 2.85 0 0 0-3.307-1.37l-2.308.68a.143.143 0 0 1-.177-.178l.68-2.307a2.85 2.85 0 0 0-1.37-3.307L.827 12.125a.142.142 0 0 1 0-.25l2.953-1.611a2.85 2.85 0 0 0 1.37-3.307L4.472 4.65a.143.143 0 0 1 .177-.177l2.308.678a2.85 2.85 0 0 0 3.307-1.37l1.61-2.954a.142.142 0 0 1 .251 0zM16.82 12a4.82 4.82 0 0 0-2.514-4.234 4.82 4.82 0 0 1-6.54 6.54A4.82 4.82 0 0 0 16.82 12"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqSunMoon24 extends KbqSvgIcon {}
