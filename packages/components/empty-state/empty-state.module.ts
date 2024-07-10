import { A11yModule } from '@angular/cdk/a11y';
import { PlatformModule } from '@angular/cdk/platform';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import {
    KbqEmptyState,
    KbqEmptyStateActions,
    KbqEmptyStateTitle,
    KbqEmptyStateIcon,
    KbqEmptyStateText
} from './empty-state.component';


@NgModule({
    imports: [
        CommonModule,
        A11yModule,
        PlatformModule
    ],
    declarations: [
        KbqEmptyState,
        KbqEmptyStateIcon,
        KbqEmptyStateText,
        KbqEmptyStateTitle,
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
