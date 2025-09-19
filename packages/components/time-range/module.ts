import { NgModule } from '@angular/core';
import { KbqTimeRange } from './time-range';
import { KbqTimeRangeEditor } from './time-range-editor';
import { KbqTimeRangeTitle } from './time-range-title';

const COMPONENTS = [
    KbqTimeRange,
    KbqTimeRangeTitle,
    KbqTimeRangeEditor
];

@NgModule({
    imports: COMPONENTS,
    exports: COMPONENTS
})
export class KbqTimeRangeModule {}
