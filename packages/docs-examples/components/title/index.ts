import { NgModule } from '@angular/core';
import { TitleOverviewExample } from './title-overview/title-overview-example';

export { TitleOverviewExample };

const EXAMPLES = [
    TitleOverviewExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class TimezoneExamplesModule {}
