import { A11yModule } from '@angular/cdk/a11y';
import { PlatformModule } from '@angular/cdk/platform';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { KbqTable, KbqTableCellContent } from './table.component';

@NgModule({
    imports: [
        CommonModule,
        A11yModule,
        PlatformModule,
    ],
    declarations: [
        KbqTable,
        KbqTableCellContent,
    ],
    exports: [
        KbqTable,
        KbqTableCellContent,
    ],
})
export class KbqTableModule {}
