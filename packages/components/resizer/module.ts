import { NgModule } from '@angular/core';
import { KbqResizable, KbqResizer } from './resizer';

const COMPONENTS = [KbqResizable, KbqResizer];

@NgModule({
    imports: COMPONENTS,
    exports: COMPONENTS
})
export class KbqResizerModule {}
