import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'kbq-action-container',
    template: `
        <div class="kbq-action-container__gradient"></div>
        <div class="kbq-action-container__box">
            <ng-content />
        </div>
    `,
    styleUrls: ['./action-container.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-action-container'
    },
    exportAs: 'kbqActionContainer'
})
export class KbqActionContainer {}
