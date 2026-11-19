import { NgModule } from '@angular/core';
import { SliderAlignmentExample } from './slider-alignment/slider-alignment-example';
import { SliderCommitExample } from './slider-commit/slider-commit-example';
import { SliderCustomExample } from './slider-custom/slider-custom-example';
import { SliderFillExample } from './slider-fill/slider-fill-example';
import { SliderFormsExample } from './slider-forms/slider-forms-example';
import { SliderInputExample } from './slider-input/slider-input-example';
import { SliderLabelsExample } from './slider-labels/slider-labels-example';
import { SliderMarksExample } from './slider-marks/slider-marks-example';
import { SliderOverviewExample } from './slider-overview/slider-overview-example';
import { SliderRangeExample } from './slider-range/slider-range-example';
import { SliderSettingsExample } from './slider-settings/slider-settings-example';
import { SliderStatesExample } from './slider-states/slider-states-example';
import { SliderTooltipExample } from './slider-tooltip/slider-tooltip-example';
import { SliderVerticalExample } from './slider-vertical/slider-vertical-example';

export {
    SliderAlignmentExample,
    SliderCommitExample,
    SliderCustomExample,
    SliderFillExample,
    SliderFormsExample,
    SliderInputExample,
    SliderLabelsExample,
    SliderMarksExample,
    SliderOverviewExample,
    SliderRangeExample,
    SliderSettingsExample,
    SliderStatesExample,
    SliderTooltipExample,
    SliderVerticalExample
};
const EXAMPLES = [
    SliderOverviewExample,
    SliderSettingsExample,
    SliderStatesExample,
    SliderMarksExample,
    SliderRangeExample,
    SliderVerticalExample,
    SliderFillExample,
    SliderTooltipExample,
    SliderAlignmentExample,
    SliderLabelsExample,
    SliderFormsExample,
    SliderInputExample,
    SliderCommitExample,
    SliderCustomExample
];
@NgModule({ imports: EXAMPLES, exports: EXAMPLES })
export class SliderExamplesModule {}
