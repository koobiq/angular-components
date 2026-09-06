import { NgModule } from '@angular/core';
import { KbqFlag } from './flag';

/** NgModule wrapper around the standalone `KbqFlag`, kept for consumers that still declare modules. */
@NgModule({
    imports: [KbqFlag],
    exports: [KbqFlag]
})
export class KbqFlagModule {}
