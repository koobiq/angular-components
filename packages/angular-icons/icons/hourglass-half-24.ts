import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqHourglassHalf24]',
    template: `
        <svg:g>
            <svg:path
                d="M7.5 4.8a.3.3 0 0 1 .3-.3h8.407a.3.3 0 0 1 .3.3v1.853a.3.3 0 0 1-.088.213l-4.215 4.174a.3.3 0 0 1-.422 0L7.588 6.865a.3.3 0 0 1-.088-.213zM11.328 13.05a.3.3 0 0 1 .3-.3h.736a.3.3 0 0 1 .3.3v.736a.3.3 0 0 1-.3.3h-.736a.3.3 0 0 1-.3-.3zM12.664 15.745a.3.3 0 0 0-.3-.3h-.736a.3.3 0 0 0-.3.3v.736a.3.3 0 0 0 .3.3h.736a.3.3 0 0 0 .3-.3z"
            />
            <svg:path
                d="M20.912 15.662a.3.3 0 0 1 .088.212V22.2a1.8 1.8 0 0 1-1.8 1.8H4.8A1.8 1.8 0 0 1 3 22.2v-6.326a.3.3 0 0 1 .088-.212L6.75 12 3.088 8.338A.3.3 0 0 1 3 8.126V1.8A1.8 1.8 0 0 1 4.8 0h14.4A1.8 1.8 0 0 1 21 1.8v6.326a.3.3 0 0 1-.088.212L17.25 12zm-6.844-3.45a.3.3 0 0 1 0-.424L18.6 7.256V2.4H5.4v4.856l4.532 4.532a.3.3 0 0 1 0 .424L5.4 16.744V21.6h3.082l3.322-3.254a.3.3 0 0 1 .42 0L15.53 21.6h3.07v-4.856z"
            />
        </svg:g>
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
export class KbqHourglassHalf24 extends KbqSvgIcon {}
