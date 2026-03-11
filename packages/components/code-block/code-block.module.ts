import { NgModule } from '@angular/core';
import { KbqCodeBlock, KbqCodeBlockTabLinkContent } from './code-block';

const COMPONENTS = [
    KbqCodeBlock,
    KbqCodeBlockTabLinkContent
];

@NgModule({
    imports: COMPONENTS,
    exports: COMPONENTS
})
export class KbqCodeBlockModule {}
