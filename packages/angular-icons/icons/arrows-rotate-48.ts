import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-arrows-rotate-48,[kbqArrowsRotate48]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
            <path
                d="M15.438 25.835c.991-.006 1.79.81 1.784 1.839-.006 1.021-.815 1.855-1.806 1.86l-2.995.259 2.575 2.67c2.325 2.425 5.54 3.86 9.005 3.86 5.765 0 10.74-3.984 12.183-9.564l.106-.444 3.511.812C38.143 34.607 31.608 40 24.001 40c-4.65 0-8.1-1.287-11.968-5.387l-2.157-2.22-.254 3.06A1.845 1.845 0 0 1 7.8 37.298c-1 .006-1.806-.81-1.8-1.823l.046-7.748c.003-.504.205-.962.53-1.295.335-.34.783-.547 1.277-.55zM24 8c4.649 0 8.1 1.287 11.968 5.387l2.157 2.22.254-3.06a1.845 1.845 0 0 1 1.822-1.845c1-.006 1.806.81 1.8 1.823l-.046 7.748a1.87 1.87 0 0 1-.53 1.295c-.335.34-.783.547-1.277.55l-7.585.047c-.991.006-1.79-.81-1.784-1.839.006-1.021.814-1.855 1.806-1.86l2.994-.259-2.574-2.67c-2.325-2.425-5.541-3.86-9.005-3.86-5.765 0-10.74 3.984-12.183 9.564l-.106.444-3.511-.812C9.857 13.393 16.393 8 24 8"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqArrowsRotate48 extends KbqSvgIcon {}
