import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { KbqEmptyStateModule } from '@koobiq/components/empty-state';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqButtonModule } from '@koobiq/components/button';
import { EmptyStateContentExample } from './empty-state-content/empty-state-content-example';

import { EmptyStateDefaultExample } from './empty-state-default/empty-state-default-example';
import { EmptyStateBigExample } from './empty-state-big/empty-state-big-example';
import { EmptyStateAlignExample } from './empty-state-align/empty-state-align-example';
import { EmptyStateErrorExample } from './empty-state-error/empty-state-error-example';
import { EmptyStateIconExample } from './empty-state-icon/empty-state-icon-example';
import { EmptyStateTitleExample } from './empty-state-title/empty-state-title-example';
import { EmptyStateActionsExample } from './empty-state-actions/empty-state-actions-example';
import { EmptyStateActions2Example } from './empty-state-actions2/empty-state-actions2-example';
import { EmptyStateTextOnlyExample } from './empty-state-text-only/empty-state-text-only-example';


export {
    EmptyStateTextOnlyExample,
    EmptyStateActionsExample,
    EmptyStateActions2Example,
    EmptyStateTitleExample,
    EmptyStateIconExample,
    EmptyStateContentExample,
    EmptyStateErrorExample,
    EmptyStateAlignExample,
    EmptyStateDefaultExample,
    EmptyStateBigExample
};

const EXAMPLES = [
    EmptyStateTextOnlyExample,
    EmptyStateActionsExample,
    EmptyStateActions2Example,
    EmptyStateTitleExample,
    EmptyStateIconExample,
    EmptyStateContentExample,
    EmptyStateErrorExample,
    EmptyStateAlignExample,
    EmptyStateDefaultExample,
    EmptyStateBigExample
];

@NgModule({
    imports: [
        CommonModule,
        KbqIconModule,
        KbqButtonModule,
        KbqEmptyStateModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class FileUploadExamplesModule {}
