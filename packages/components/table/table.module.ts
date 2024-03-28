import { A11yModule } from '@angular/cdk/a11y';
import { PlatformModule } from '@angular/cdk/platform';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { KbqTable } from './table.component';


@NgModule({
    imports: [
        CommonModule,
        A11yModule,
        PlatformModule
    ],
    exports: [KbqTable],
    declarations: [KbqTable]
})
export class KbqTableModule {}
