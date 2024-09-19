import { A11yModule } from '@angular/cdk/a11y';
import { PlatformModule } from '@angular/cdk/platform';
import { NgModule } from '@angular/core';
import { KbqBadge, KbqBadgeCaption, KbqBadgeCssStyler } from './badge.component';

@NgModule({
    imports: [
        A11yModule,
        PlatformModule
    ],
    declarations: [
        KbqBadge,
        KbqBadgeCaption,
        KbqBadgeCssStyler
    ],
    exports: [
        KbqBadge,
        KbqBadgeCaption,
        KbqBadgeCssStyler
    ]
})
export class KbqBadgeModule {}
