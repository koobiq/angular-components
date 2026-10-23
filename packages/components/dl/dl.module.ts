import { NgModule } from '@angular/core';
import { KbqDd, KbqDl, KbqDt } from './dl';

const COMPONENTS = [
    KbqDl,
    KbqDt,
    KbqDd
];

/** @docs-private */
@NgModule({
    imports: COMPONENTS,
    exports: COMPONENTS
})
export class KbqDlModule {}
