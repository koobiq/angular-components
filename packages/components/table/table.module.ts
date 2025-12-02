import { A11yModule } from '@angular/cdk/a11y';
import { PlatformModule } from '@angular/cdk/platform';
import { NgModule } from '@angular/core';
import { KbqTable, KbqTableCellContent } from './table.component';

@NgModule({
    imports: [
        A11yModule,
        PlatformModule,
        KbqTable,
        KbqTableCellContent
    ],
    exports: [
        KbqTable,
        KbqTableCellContent
    ]
})
export class KbqTableModule {}
