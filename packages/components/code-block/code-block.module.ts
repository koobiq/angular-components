import { NgModule } from '@angular/core';
import { KbqCodeBlock } from './code-block';

const COMPONENTS = [
    KbqCodeBlock
];

@NgModule({
    imports: COMPONENTS,
    exports: COMPONENTS
})
export class KbqCodeBlockModule {}
