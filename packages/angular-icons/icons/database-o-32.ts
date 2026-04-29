import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-database-o-32,[kbqDatabaseO32]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
            <path
                d="M28 7c0-2.511-5.648-4-12-4S4 4.489 4 7v19c0 2.511 5.648 4 12 4s12-1.489 12-4zm-2 19c0 .702-4.925 2-10 2S6 26.702 6 26v-3.69C8.198 23.397 11.956 24 16 24s7.802-.603 10-1.69zm-10-4c-5.075 0-10-1.298-10-2v-3.69C8.198 17.397 11.956 18 16 18s7.802-.603 10-1.69V20c0 .702-4.925 2-10 2m10-8c0 .702-4.925 2-10 2S6 14.702 6 14v-3.69C8.198 11.397 11.956 12 16 12s7.802-.603 10-1.69zm-10-4C10.925 10 6 8.702 6 8V7c0-.702 4.925-2 10-2s10 1.298 10 2v1c0 .702-4.925 2-10 2"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqDatabaseO32 extends KbqSvgIcon {}
