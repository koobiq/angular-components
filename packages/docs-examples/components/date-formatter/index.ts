import { NgModule } from '@angular/core';
import { AbsoluteDateFormatterExample } from './absolute-date-formatter/absolute-date-formatter-example';
import { DurationDateFormatterExample } from './duration-date-formatter/duration-date-formatter-example';
import { RangeDateFormatterExample } from './range-date-formatter/range-date-formatter-example';
import { RelativeDateFormatterExample } from './relative-date-formatter/relative-date-formatter-example';

export {
    AbsoluteDateFormatterExample,
    DurationDateFormatterExample,
    RangeDateFormatterExample,
    RelativeDateFormatterExample
};

const EXAMPLES = [
    AbsoluteDateFormatterExample,
    RelativeDateFormatterExample,
    RangeDateFormatterExample,
    DurationDateFormatterExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class DateFormatterExamplesModule {}
