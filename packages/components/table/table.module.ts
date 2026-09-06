import { NgModule } from '@angular/core';
import { KbqTable } from './table.component';

/** Legacy entry point for `KbqTable`. Standalone consumers import `KbqTable` directly. */
@NgModule({
    imports: [KbqTable],
    exports: [KbqTable]
})
export class KbqTableModule {}
