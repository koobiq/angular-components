import { NgModule } from '@angular/core';
import { SliderAlignmentExample } from './slider-alignment/slider-alignment-example';
import { SliderCommitExample } from './slider-commit/slider-commit-example';
import { SliderCustomExample } from './slider-custom/slider-custom-example';
import { SliderDistanceExample } from './slider-distance/slider-distance-example';
import { SliderFillExample } from './slider-fill/slider-fill-example';
import { SliderFormsExample } from './slider-forms/slider-forms-example';
import { SliderInputExample } from './slider-input/slider-input-example';
import { SliderInvalidExample } from './slider-invalid/slider-invalid-example';
import { SliderKeyboardExample } from './slider-keyboard/slider-keyboard-example';
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
    SliderDistanceExample,
    SliderFillExample,
    SliderFormsExample,
    SliderInputExample,
    SliderInvalidExample,
    SliderKeyboardExample,
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
    SliderInvalidExample,
    SliderMarksExample,
    SliderRangeExample,
    SliderDistanceExample,
    SliderVerticalExample,
    SliderFillExample,
    SliderTooltipExample,
    SliderAlignmentExample,
    SliderLabelsExample,
    SliderFormsExample,
    SliderInputExample,
    SliderCommitExample,
    SliderKeyboardExample,
    SliderCustomExample
];
@NgModule({ imports: EXAMPLES, exports: EXAMPLES })
export class SliderExamplesModule {}
