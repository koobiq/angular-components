import { NgModule } from '@angular/core';
import {
    KbqInlineEdit,
    KbqInlineEditEditMode,
    KbqInlineEditPlaceholder,
    KbqInlineEditValidationTooltip,
    KbqInlineEditViewMode
} from './inline-edit';

const COMPONENTS = [
    KbqInlineEdit,
    KbqInlineEditViewMode,
    KbqInlineEditEditMode,
    KbqInlineEditPlaceholder,
    KbqInlineEditValidationTooltip
];

@NgModule({
    imports: COMPONENTS,
    exports: COMPONENTS
})
export class KbqInlineEditModule {}
