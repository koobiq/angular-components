import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-sun-moon-16,[kbqSunMoon16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M9.158 2.521a1.9 1.9 0 0 0 2.204.913l1.538-.452a.095.095 0 0 1 .118.118l-.452 1.538a1.9 1.9 0 0 0 .913 2.205l1.97 1.074a.095.095 0 0 1 0 .166l-1.97 1.074a1.9 1.9 0 0 0-.913 2.205l.452 1.538a.095.095 0 0 1-.118.118l-1.538-.452a1.9 1.9 0 0 0-2.204.913l-1.075 1.97a.095.095 0 0 1-.166 0l-1.075-1.97a1.9 1.9 0 0 0-2.204-.913l-1.538.452a.095.095 0 0 1-.118-.118l.452-1.538a1.9 1.9 0 0 0-.913-2.205L.55 8.083a.095.095 0 0 1 0-.166l1.97-1.074a1.9 1.9 0 0 0 .913-2.205L2.982 3.1a.095.095 0 0 1 .118-.118l1.538.452a1.9 1.9 0 0 0 2.204-.913L7.917.551a.095.095 0 0 1 .166 0zM11.213 8a3.21 3.21 0 0 0-1.676-2.822 3.213 3.213 0 0 1-4.36 4.36A3.213 3.213 0 0 0 11.214 8"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqSunMoon16 extends KbqSvgIcon {}
