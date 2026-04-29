import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-hourglass-start-24,[kbqHourglassStart24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M16.508 4.8a.3.3 0 0 0-.3-.3H7.8a.3.3 0 0 0-.3.3v1.853a.3.3 0 0 0 .088.213l4.194 4.173a.3.3 0 0 0 .422 0l4.215-4.173a.3.3 0 0 0 .088-.213z"
                />
                <path
                    d="M21 22.2v-6.326a.3.3 0 0 0-.088-.212L17.25 12l3.662-3.662A.3.3 0 0 0 21 8.126V1.8A1.8 1.8 0 0 0 19.2 0H4.8A1.8 1.8 0 0 0 3 1.8v6.326a.3.3 0 0 0 .088.212L6.75 12l-3.662 3.662a.3.3 0 0 0-.088.212V22.2A1.8 1.8 0 0 0 4.8 24h14.4a1.8 1.8 0 0 0 1.8-1.8m-6.932-10.412a.3.3 0 0 0 0 .424l4.532 4.532V21.6H5.4v-4.856l4.532-4.532a.3.3 0 0 0 0-.424L5.4 7.256V2.4h13.2v4.856z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqHourglassStart24 extends KbqSvgIcon {}
