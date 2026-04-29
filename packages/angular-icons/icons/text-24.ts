import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-text-24,[kbqText24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M13.755 21.45V4.887h6.195a.3.3 0 0 0 .3-.3V2.55a.3.3 0 0 0-.3-.3H4.05a.3.3 0 0 0-.3.3v2.037a.3.3 0 0 0 .3.3h6.422V21.45a.3.3 0 0 0 .3.3h2.683a.3.3 0 0 0 .3-.3"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqText24 extends KbqSvgIcon {}
