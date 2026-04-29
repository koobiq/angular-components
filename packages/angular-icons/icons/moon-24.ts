import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-moon-24,[kbqMoon24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M4.49 19.378c4.142 4.141 10.832 4.166 14.943.055 4.11-4.11 4.086-10.8-.055-14.942a10.6 10.6 0 0 0-5.84-2.989c-.153-.024-.233.173-.115.271q.286.24.555.508c3.254 3.254 3.274 8.51.044 11.74s-8.487 3.211-11.74-.043a9 9 0 0 1-.509-.555c-.098-.118-.295-.038-.27.114a10.6 10.6 0 0 0 2.988 5.84"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqMoon24 extends KbqSvgIcon {}
