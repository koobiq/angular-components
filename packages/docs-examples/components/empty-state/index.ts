import { NgModule } from '@angular/core';
import { EmptyStateActionsExample } from './empty-state-actions/empty-state-actions-example';
import { EmptyStateActions2Example } from './empty-state-actions2/empty-state-actions2-example';
import { EmptyStateAlignExample } from './empty-state-align/empty-state-align-example';
import { EmptyStateBigExample } from './empty-state-big/empty-state-big-example';
import { EmptyStateContentExample } from './empty-state-content/empty-state-content-example';
import { EmptyStateDefaultExample } from './empty-state-default/empty-state-default-example';
import { EmptyStateErrorExample } from './empty-state-error/empty-state-error-example';
import { EmptyStateIconExample } from './empty-state-icon/empty-state-icon-example';
import { EmptyStateSizeExample } from './empty-state-size/empty-state-size-example';
import { EmptyStateTextOnlyExample } from './empty-state-text-only/empty-state-text-only-example';
import { EmptyStateTitleExample } from './empty-state-title/empty-state-title-example';

export {
    EmptyStateActions2Example,
    EmptyStateActionsExample,
    EmptyStateAlignExample,
    EmptyStateBigExample,
    EmptyStateContentExample,
    EmptyStateDefaultExample,
    EmptyStateErrorExample,
    EmptyStateIconExample,
    EmptyStateSizeExample,
    EmptyStateTextOnlyExample,
    EmptyStateTitleExample
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
    EmptyStateBigExample,
    EmptyStateSizeExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class EmptyStateExamplesModule {}
