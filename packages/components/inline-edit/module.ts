import { NgModule } from '@angular/core';
import { KbqInlineEdit, KbqInlineEditEditMode, KbqInlineEditViewMode } from './inline-edit';

const COMPONENTS = [KbqInlineEdit, KbqInlineEditViewMode, KbqInlineEditEditMode];

@NgModule({
    imports: COMPONENTS,
    exports: COMPONENTS
})
export class KbqInlineEditModule {}
