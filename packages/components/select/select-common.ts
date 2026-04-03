import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqProgressSpinnerModule } from '@koobiq/components/progress-spinner';

@Component({
    selector: 'kbq-select-loading, [kbq-select-loading]',
    exportAs: 'kbqSelectLoading',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ng-content select="kbq-progress-spinner">
            <div class="layout-row layout-margin-top-4xl layout-margin-bottom-4xl layout-align-center-center">
                <kbq-progress-spinner [mode]="'indeterminate'" />
            </div>
        </ng-content>
    `,
    imports: [
        KbqProgressSpinnerModule
    ],
    host: {
        class: 'kbq-select-loading'
    }
})
export class KbqSelectLoading {}

@Component({
    selector: 'kbq-select-error, [kbq-select-error]',
    exportAs: 'kbqSelectError',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: ` <ng-content />
    `,
    host: {
        class: 'kbq-select-error'
    },
    styles: `
        :host {
            display: flex;
            flex-direction: column;

            align-items: center;
            justify-content: center;

            margin-bottom: var(--kbq-size-3xl);
            margin-top: var(--kbq-size-3xl);
        }
    `
})
export class kbqSelectError {}
