import { NgModule } from '@angular/core';
import { KbqTimeRange } from './time-range';
import { KbqTimeRangeEditor } from './time-range-editor';
import { KbqTimeRangeTitle } from './time-range-title';
import { KbqTimeRangeTitleAsControl, KbqTimeRangeTitlePlaceholder } from './time-range-title-as-form-field';

const COMPONENTS = [
    KbqTimeRange,
    KbqTimeRangeTitle,
    KbqTimeRangeEditor,
    KbqTimeRangeTitlePlaceholder,
    KbqTimeRangeTitleAsControl
];

@NgModule({
    imports: COMPONENTS,
    exports: COMPONENTS
})
export class KbqTimeRangeModule {}
