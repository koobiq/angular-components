import { NgModule } from '@angular/core';
import { NumberFormatterLocaleExample } from './number-formatter-locale/number-formatter-locale-example';
import { NumberFormatterOverviewExample } from './number-formatter-overview/number-formatter-overview-example';
import { NumberFormatterRoundingExample } from './number-formatter-rounding/number-formatter-rounding-example';

export { NumberFormatterLocaleExample, NumberFormatterOverviewExample, NumberFormatterRoundingExample };

const EXAMPLES = [NumberFormatterOverviewExample, NumberFormatterRoundingExample, NumberFormatterLocaleExample];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class NumberFormatterExamplesModule {}
