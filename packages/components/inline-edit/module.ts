import { NgModule } from '@angular/core';
import {
    KbqInlineEdit,
    KbqInlineEditEditMode,
    KbqInlineEditMenu,
    KbqInlineEditPlaceholder,
    KbqInlineEditViewMode
} from './inline-edit';

const COMPONENTS = [
    KbqInlineEdit,
    KbqInlineEditViewMode,
    KbqInlineEditEditMode,
    KbqInlineEditPlaceholder,
    KbqInlineEditMenu
];

@NgModule({
    imports: COMPONENTS,
    exports: COMPONENTS
})
export class KbqInlineEditModule {}
