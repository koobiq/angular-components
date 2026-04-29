import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-eye-slash-16,[kbqEyeSlash16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M14.37 15.441a.204.204 0 0 0 .286 0l.859-.85a.2.2 0 0 0 0-.284l-3.049-3.018 3.468-3.141a.2.2 0 0 0 0-.296L12.078 4.36A6.08 6.08 0 0 0 4.8 3.698L1.63.558a.204.204 0 0 0-.286 0l-.859.851a.2.2 0 0 0 0 .284zm-3.175-5.411-1.117-1.106c.128-.282.2-.595.2-.924A2.266 2.266 0 0 0 8 5.745c-.332 0-.648.07-.933.197L5.95 4.836A3.8 3.8 0 0 1 8 4.241c2.096 0 3.796 1.683 3.796 3.759 0 .748-.22 1.444-.6 2.03M4.204 8q0-.43.093-.831l-1.66-1.645L.066 7.852a.2.2 0 0 0 0 .296l3.856 3.492a6.08 6.08 0 0 0 6.122 1.219L8.84 11.666q-.406.091-.84.093c-2.096 0-3.796-1.683-3.796-3.759"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqEyeSlash16 extends KbqSvgIcon {}
