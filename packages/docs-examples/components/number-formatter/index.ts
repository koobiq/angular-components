import { NgModule } from '@angular/core';
import { NumberFormatterOverviewExample } from './number-formatter-overview/number-formatter-overview-example';

export { NumberFormatterOverviewExample };

const EXAMPLES = [NumberFormatterOverviewExample];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class NumberFormatterExamplesModule {}
