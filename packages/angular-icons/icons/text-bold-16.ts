import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-text-bold-16,[kbqTextBold16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M10.952 7.862q.17-.066.318-.148.79-.437 1.127-1.134t.337-1.49q0-.912-.346-1.581a2.96 2.96 0 0 0-1.012-1.125q-.656-.447-1.597-.66Q8.84 1.5 7.641 1.5H3.2a.2.2 0 0 0-.2.2v12.6c0 .11.09.2.2.2h4.946q1.597 0 2.68-.429 1.083-.428 1.624-1.285.55-.858.55-2.134 0-.75-.328-1.438-.33-.687-1.092-1.107a2.6 2.6 0 0 0-.628-.245M6.114 8.973h2.157q.594 0 .949.206.355.196.515.562.168.366.168.866 0 .411-.177.75-.169.33-.56.536-.381.196-1.02.196H6.114zM7.623 6.92H6.114v-3h1.527q.692 0 1.127.16.443.153.647.491.204.34.204.893 0 .483-.204.804-.195.322-.63.49-.435.162-1.162.162"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqTextBold16 extends KbqSvgIcon {}
