import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqScissors24]',
    template: `
        <svg:path
            d="M7.005 9.646a3.86 3.86 0 0 1-2.43.854C2.463 10.5.75 8.821.75 6.75S2.463 3 4.575 3 8.4 4.679 8.4 6.75c0 .476-.09.93-.255 1.349l4.07 2.506 6.8-4.884a3.35 3.35 0 0 1 2.39-.477c.713.13 1.342.495 1.784 1.028.109.13.066.321-.079.41l-8.633 5.315 8.633 5.315c.145.089.188.28.08.41a3.02 3.02 0 0 1-1.784 1.028 3.35 3.35 0 0 1-2.392-.477l-6.798-4.884-4.07 2.506c.164.419.254.874.254 1.35 0 2.07-1.712 3.75-3.825 3.75-2.112 0-3.825-1.68-3.825-3.75 0-2.072 1.713-3.75 3.825-3.75.923 0 1.77.32 2.43.853l3.273-2.35zm-.44-2.896c0-1.077-.891-1.95-1.99-1.95s-1.989.873-1.989 1.95.89 1.95 1.99 1.95c1.098 0 1.988-.873 1.988-1.95m-1.99 8.544c-1.098 0-1.989.873-1.989 1.95s.89 1.95 1.99 1.95c1.098 0 1.988-.873 1.988-1.95s-.89-1.95-1.989-1.95"
        />
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 24 24',
        width: '24',
        height: '24'
    }
})
export class KbqScissors24 extends KbqSvgIcon {}
