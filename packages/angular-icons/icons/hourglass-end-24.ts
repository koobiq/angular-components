import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqHourglassEnd24]',
    template: `
        <svg:g>
            <svg:path
                d="M7.492 19.2a.3.3 0 0 0 .3.3H16.2a.3.3 0 0 0 .3-.3v-1.854a.3.3 0 0 0-.088-.212l-4.194-4.173a.3.3 0 0 0-.422 0L7.58 17.133a.3.3 0 0 0-.089.213z"
            />
            <svg:path
                d="M3 1.8v6.326a.3.3 0 0 0 .088.212L6.75 12l-3.662 3.662a.3.3 0 0 0-.088.212V22.2A1.8 1.8 0 0 0 4.8 24h14.4a1.8 1.8 0 0 0 1.8-1.8v-6.326a.3.3 0 0 0-.088-.212L17.25 12l3.662-3.662A.3.3 0 0 0 21 8.126V1.8A1.8 1.8 0 0 0 19.2 0H4.8A1.8 1.8 0 0 0 3 1.8m6.932 10.412a.3.3 0 0 0 0-.424L5.4 7.256V2.4h13.2v4.856l-4.532 4.532a.3.3 0 0 0 0 .424l4.532 4.532V21.6H5.4v-4.856z"
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
export class KbqHourglassEnd24 extends KbqSvgIcon {}
