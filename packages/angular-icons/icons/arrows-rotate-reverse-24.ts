import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-arrows-rotate-reverse-24,[kbqArrowsRotateReverse24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="m20.443 3.55.413-.413a.3.3 0 0 0-.144-.504l-5.9-1.362a.3.3 0 0 0-.36.36l1.362 5.9a.3.3 0 0 0 .505.144l1.405-1.406a8.1 8.1 0 0 1-5.14 13.81.153.153 0 0 0-.138.186l.447 1.938c.034.146.17.245.32.228C18.44 21.83 22.5 17.389 22.5 12c0-2.902-1.177-5.529-3.08-7.43zM3.566 20.45l-.414.412a.3.3 0 0 0 .145.505l5.899 1.361a.3.3 0 0 0 .36-.36L8.194 16.47a.3.3 0 0 0-.504-.145l-1.41 1.41A8.1 8.1 0 0 1 11.415 3.92a.153.153 0 0 0 .138-.185l-.447-1.938a.295.295 0 0 0-.32-.228C5.56 2.17 1.5 6.611 1.5 12c0 2.903 1.178 5.532 3.083 7.432z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqArrowsRotateReverse24 extends KbqSvgIcon {}
