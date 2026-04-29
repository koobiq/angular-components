import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-file-code-o-24,[kbqFileCodeO24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="m14.777 15-2.151-2.151a.3.3 0 0 1 0-.425l.848-.848a.3.3 0 0 1 .425 0l3.212 3.212a.3.3 0 0 1 0 .424l-3.213 3.212a.3.3 0 0 1-.424 0l-.848-.848a.3.3 0 0 1 0-.425zM11.374 17.576a.3.3 0 0 0 0-.424L9.223 15l2.151-2.151a.3.3 0 0 0 0-.425l-.848-.848a.3.3 0 0 0-.425 0L6.89 14.788a.3.3 0 0 0 0 .424l3.212 3.212a.3.3 0 0 0 .425 0z"
                />
                <path
                    d="M14.876 0a.3.3 0 0 1 .212.088l5.824 5.824a.3.3 0 0 1 .088.212V22.2a1.8 1.8 0 0 1-1.8 1.8H4.8A1.8 1.8 0 0 1 3 22.2V1.8A1.8 1.8 0 0 1 4.8 0zM13.5 2.4H5.7a.3.3 0 0 0-.3.3v18.6a.3.3 0 0 0 .3.3h12.6a.3.3 0 0 0 .3-.3V7.5h-4.8a.3.3 0 0 1-.3-.3z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqFileCodeO24 extends KbqSvgIcon {}
