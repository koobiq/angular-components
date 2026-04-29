import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-clipboard-check-24,[kbqClipboardCheck24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M16.2 0A1.8 1.8 0 0 1 18 1.8V3h1.2A1.8 1.8 0 0 1 21 4.8v17.4a1.8 1.8 0 0 1-1.8 1.8H4.8A1.8 1.8 0 0 1 3 22.2V4.8A1.8 1.8 0 0 1 4.8 3H6V1.8A1.8 1.8 0 0 1 7.8 0zm-.016 9.971a.3.3 0 0 0-.425 0l-4.723 4.724L8.241 11.9a.3.3 0 0 0-.425 0l-.848.848a.3.3 0 0 0 0 .425l3.856 3.856a.3.3 0 0 0 .425 0l5.783-5.785a.3.3 0 0 0 0-.423zM8.7 2.401a.3.3 0 0 0-.3.299v1.2a.3.3 0 0 0 .3.3h6.6a.3.3 0 0 0 .3-.3V2.7a.3.3 0 0 0-.3-.3z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqClipboardCheck24 extends KbqSvgIcon {}
