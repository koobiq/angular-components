import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-circle-arrow-left-24,[kbqCircleArrowLeft24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M1.5 12c0 5.799 4.701 10.5 10.5 10.5S22.5 17.799 22.5 12 17.799 1.5 12 1.5 1.5 6.201 1.5 12m4.694.642-.042-.045-.388-.387a.3.3 0 0 1 0-.424l.849-.849.023-.02 4.59-4.591a.3.3 0 0 1 .425 0l.848.848a.3.3 0 0 1 0 .425L8.998 11.1H17.7a.3.3 0 0 1 .3.3v1.2a.3.3 0 0 1-.3.3H8.998l3.501 3.501a.3.3 0 0 1 0 .425l-.848.848a.3.3 0 0 1-.425 0z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqCircleArrowLeft24 extends KbqSvgIcon {}
