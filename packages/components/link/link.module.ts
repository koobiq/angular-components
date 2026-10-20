import { NgModule } from '@angular/core';
import { KbqLink, KbqLinkPrefix, KbqLinkSuffix } from './link';

const COMPONENTS = [
    KbqLink,
    KbqLinkPrefix,
    KbqLinkSuffix
];

/** @docs-private */
@NgModule({
    imports: COMPONENTS,
    exports: COMPONENTS
})
export class KbqLinkModule {}
