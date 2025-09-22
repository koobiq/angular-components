import { NgModule } from '@angular/core';
import { KbqInlineEdit, KbqInlineEditMenu, KbqInlineEditPlaceholder } from './inline-edit';

const COMPONENTS = [
    KbqInlineEdit,
    KbqInlineEditPlaceholder,
    KbqInlineEditMenu
];

@NgModule({
    imports: COMPONENTS,
    exports: COMPONENTS
})
export class KbqInlineEditModule {}
