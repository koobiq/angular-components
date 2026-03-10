import { NgModule } from '@angular/core';
import { KbqCodeBlock, KbqCodeBlockTabLinkDef } from './code-block';

const COMPONENTS = [
    KbqCodeBlock,
    KbqCodeBlockTabLinkDef
];

@NgModule({
    imports: COMPONENTS,
    exports: COMPONENTS
})
export class KbqCodeBlockModule {}
