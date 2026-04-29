import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-arrows-rotate-reverse-slash-16,[kbqArrowsRotateReverseSlash16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M9 13.31v-.003a5.4 5.4 0 0 0 1.131-.344l1.198 1.198a7 7 0 0 1-2.478.79.196.196 0 0 1-.214-.15l-.282-1.174a.207.207 0 0 1 .183-.251q.232-.024.462-.066M13.826 14.958c.08.061.194.056.267-.017l.848-.848a.2.2 0 0 0 0-.286l-1.456-1.456q.312-.393.559-.816a7.004 7.004 0 0 0-1.095-8.485l.672-.672.276-.275a.2.2 0 0 0-.096-.336L9.868.859a.2.2 0 0 0-.24.24l.908 3.933a.2.2 0 0 0 .336.096l.944-.944a5.4 5.4 0 0 1 .527 7.026L4.792 3.657A5.4 5.4 0 0 1 7 2.695v-.002q.23-.043.46-.066a.207.207 0 0 0 .183-.252l-.282-1.173a.196.196 0 0 0-.213-.15 6.97 6.97 0 0 0-3.499 1.463l-1.46-1.46a.2.2 0 0 0-.285 0l-.849.849a.2.2 0 0 0-.017.266zM1.84 4.672a7 7 0 0 0 1.209 8.28l-.672.673-.276.275a.2.2 0 0 0 .097.336l3.933.907a.2.2 0 0 0 .24-.24l-.908-3.932a.2.2 0 0 0-.336-.097l-.945.945a5.4 5.4 0 0 1-1.145-5.95z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqArrowsRotateReverseSlash16 extends KbqSvgIcon {}
