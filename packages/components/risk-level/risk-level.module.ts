import { A11yModule } from '@angular/cdk/a11y';
import { PlatformModule } from '@angular/cdk/platform';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { KbqRiskLevel } from './risk-level.component';

@NgModule({
    imports: [
        CommonModule,
        A11yModule,
        PlatformModule,
    ],
    declarations: [KbqRiskLevel],
    exports: [KbqRiskLevel],
})
export class KbqRiskLevelModule {}
