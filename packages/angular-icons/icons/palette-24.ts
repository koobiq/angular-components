import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-palette-24,[kbqPalette24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M12 22.2c0 .166-.135.3-.3.296C6.04 22.336 1.5 17.698 1.5 12 1.5 6.201 6.201 1.5 12 1.5S22.5 6.201 22.5 12c0 2.9-2.35 5.25-5.25 5.25-5.068 0-5.244 2.19-5.25 4.95m2.943-14.813a1.443 1.443 0 1 0 0-2.887 1.443 1.443 0 0 0 0 2.887m-4.556-1.444a1.443 1.443 0 1 0-2.887 0 1.443 1.443 0 0 0 2.887 0m-5.091 6.268a1.443 1.443 0 1 0 0-2.887 1.443 1.443 0 0 0 0 2.887m14.728-1.444a1.443 1.443 0 1 0-2.887 0 1.443 1.443 0 0 0 2.887 0m-13.01 7.225a1.443 1.443 0 1 0 0-2.886 1.443 1.443 0 0 0 0 2.886"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqPalette24 extends KbqSvgIcon {}
