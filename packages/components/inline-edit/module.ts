import { NgModule } from '@angular/core';
import {
    KbqInlineEdit,
    KbqInlineEditEditMode,
    KbqInlineEditMenu,
    KbqInlineEditPlaceholder,
    KbqInlineEditValidationTooltip,
    KbqInlineEditViewMode
} from './inline-edit';

const COMPONENTS = [
    KbqInlineEdit,
    KbqInlineEditViewMode,
    KbqInlineEditEditMode,
    KbqInlineEditPlaceholder,
    KbqInlineEditValidationTooltip,
    KbqInlineEditMenu
];

@NgModule({
    imports: COMPONENTS,
    exports: COMPONENTS
})
export class KbqInlineEditModule {}
