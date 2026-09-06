import { NgModule } from '@angular/core';

import {
    KbqEmptyState,
    KbqEmptyStateActions,
    KbqEmptyStateIcon,
    KbqEmptyStateText,
    KbqEmptyStateTitle
} from './empty-state.component';

@NgModule({
    imports: [
        KbqEmptyState,
        KbqEmptyStateIcon,
        KbqEmptyStateText,
        KbqEmptyStateTitle,
        KbqEmptyStateActions
    ],
    exports: [
        KbqEmptyState,
        KbqEmptyStateIcon,
        KbqEmptyStateText,
        KbqEmptyStateTitle,
        KbqEmptyStateActions
    ]
})
export class KbqEmptyStateModule {}
