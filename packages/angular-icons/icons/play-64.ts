import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-play-64,[kbqPlay64]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
            <path
                d="M12 14.652c0-1.85 0-2.775.388-3.303a2 2 0 0 1 1.426-.808c.653-.06 1.446.415 3.032 1.367l30.483 18.29c1.536.921 2.304 1.382 2.56 1.974a2 2 0 0 1-.016 1.616c-.265.588-1.042 1.034-2.595 1.927L16.795 53.243c-1.574.905-2.36 1.357-3.007 1.289a2 2 0 0 1-1.407-.814C12 53.192 12 52.284 12 50.468z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqPlay64 extends KbqSvgIcon {}
