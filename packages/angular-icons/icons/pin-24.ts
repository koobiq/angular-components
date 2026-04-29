import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-pin-24,[kbqPin24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M13.983 2.423a1.806 1.806 0 0 1 2.852-.394l5.14 5.14c.845.846.65 2.266-.395 2.851l-5.108 2.863c1.465 2.694.49 6.738-1.687 9.093a.286.286 0 0 1-.414.007L9.035 16.67l-4.714 4.711a.3.3 0 0 1-.162.084l-1.736.283a.15.15 0 0 1-.17-.171l.283-1.735a.3.3 0 0 1 .083-.163l4.714-4.711-5.316-5.333a.286.286 0 0 1 .007-.415c2.356-2.176 6.4-3.152 9.095-1.688z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqPin24 extends KbqSvgIcon {}
