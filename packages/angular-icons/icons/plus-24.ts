import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-plus-24,[kbqPlus24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M13.307 13.2H20.7a.3.3 0 0 0 .3-.3v-1.8a.3.3 0 0 0-.3-.3h-7.393V3.3a.3.3 0 0 0-.3-.3h-1.8a.3.3 0 0 0-.3.3v7.5H3.3a.3.3 0 0 0-.3.3v1.8a.3.3 0 0 0 .3.3h7.607v7.5a.3.3 0 0 0 .3.3h1.8a.3.3 0 0 0 .3-.3z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqPlus24 extends KbqSvgIcon {}
