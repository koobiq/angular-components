import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-habr-alt-24,[kbqHabrAlt24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M20.7 1.5a1.8 1.8 0 0 1 1.8 1.8v17.4a1.8 1.8 0 0 1-1.8 1.8H3.3a1.8 1.8 0 0 1-1.8-1.8V3.3a1.8 1.8 0 0 1 1.8-1.8zM7.65 18.126h2.88c0-.036.017-1.309.027-2.748.007-2.363.024-2.657.164-2.937.294-.61.812-.861 1.556-.78.437.049.713.247.97.68.18.328.188.363.188 3.053v2.73h2.923l-.028-3.345c-.024-2.995-.043-3.38-.176-3.75-.341-.942-.998-1.581-1.927-1.893-.424-.15-.67-.175-1.276-.158-.92.034-1.405.212-1.982.72l-.413.371-.02-5.07H7.65z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqHabrAlt24 extends KbqSvgIcon {}
