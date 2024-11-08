import { NgModule } from '@angular/core';
import { TypographyOverviewExample } from './typography-overview/typography-overview-example';

export { TypographyOverviewExample };

const EXAMPLES = [
    TypographyOverviewExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class TypographyExamplesModule {}
