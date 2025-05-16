import { A11yModule } from '@angular/cdk/a11y';
import { PlatformModule } from '@angular/cdk/platform';
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
        A11yModule,
        PlatformModule
    ],
    declarations: [
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
