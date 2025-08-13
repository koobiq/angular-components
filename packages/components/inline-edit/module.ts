import { NgModule } from '@angular/core';
import { KbqInlineEdit } from './inline-edit';

const COMPONENTS = [KbqInlineEdit];

@NgModule({
    imports: COMPONENTS,
    exports: COMPONENTS
})
export class KbqContentPanelModule {}
