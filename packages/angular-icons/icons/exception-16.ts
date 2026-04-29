import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-exception-16,[kbqException16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="m15.29 8.156-2.824 2.824a.2.2 0 0 1-.283 0l-.849-.849a.2.2 0 0 1 0-.283L13.182 8l-1.79-1.79a.2.2 0 0 1 0-.282l.85-.849a.2.2 0 0 1 .282 0l2.766 2.766a.22.22 0 0 1 0 .31M8 2.817 6.15 4.665a.2.2 0 0 1-.283 0l-.848-.848a.2.2 0 0 1 0-.283L7.844.71a.22.22 0 0 1 .31 0l2.894 2.893a.2.2 0 0 1 0 .283l-.848.849a.2.2 0 0 1-.283 0zM4.674 6.141a.2.2 0 0 0 0-.283l-.848-.848a.2.2 0 0 0-.283 0L.709 7.845a.22.22 0 0 0 0 .31l2.893 2.894a.2.2 0 0 0 .283 0l.849-.848a.2.2 0 0 0 0-.283L2.816 8zm6.315 6.315a.2.2 0 0 0 0-.283l-.849-.849a.2.2 0 0 0-.283 0L8 13.184l-1.79-1.79a.2.2 0 0 0-.282 0l-.849.848a.2.2 0 0 0 0 .283l2.766 2.765a.22.22 0 0 0 .31 0zM10 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqException16 extends KbqSvgIcon {}
