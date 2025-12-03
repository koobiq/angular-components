import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'kbq-action-container',
    exportAs: 'kbqActionContainer',
    template: `
        <div class="kbq-action-container__gradient"></div>
        <div class="kbq-action-container__box">
            <ng-content />
        </div>
    `,
    styleUrls: ['./action-container.scss'],
    host: {
        class: 'kbq-action-container'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqActionContainer {}
