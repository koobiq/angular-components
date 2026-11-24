import { NgModule } from '@angular/core';
import { KbqDd, KbqDl, KbqDt, KbqDtCaption } from './dl';

const COMPONENTS = [
    KbqDl,
    KbqDt,
    KbqDtCaption,
    KbqDd
];

/** @docs-private */
@NgModule({
    imports: COMPONENTS,
    exports: COMPONENTS
})
export class KbqDlModule {}
