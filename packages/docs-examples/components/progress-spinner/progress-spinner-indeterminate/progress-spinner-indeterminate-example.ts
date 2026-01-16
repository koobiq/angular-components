import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqProgressSpinnerModule } from '@koobiq/components/progress-spinner';

/**
 * @title Progress spinner indeterminate
 */
@Component({
    selector: 'progress-spinner-indeterminate-example',
    imports: [KbqProgressSpinnerModule],
    template: `
        <kbq-progress-spinner class="layout-margin-right-s" size="big" mode="indeterminate" />
        <kbq-progress-spinner class="layout-margin-right-s" size="big" color="contrast" mode="indeterminate" />
        <kbq-progress-spinner size="big" color="contrast-fade" mode="indeterminate" />
    `,
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-row'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProgressSpinnerIndeterminateExample {}
