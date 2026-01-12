import { A11yModule } from '@angular/cdk/a11y';
import { PlatformModule } from '@angular/cdk/platform';
import { NgModule } from '@angular/core';
import { KbqRiskLevel } from './risk-level.component';

/**
 * @deprecated Will be removed in next major release, use `KbqBadgeModule` instead.
 */
@NgModule({
    imports: [
        A11yModule,
        PlatformModule,
        KbqRiskLevel
    ],
    exports: [KbqRiskLevel]
})
export class KbqRiskLevelModule {}
