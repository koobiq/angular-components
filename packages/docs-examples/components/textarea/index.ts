import { NgModule } from '@angular/core';
import { TextAreaOverviewExample } from './text-area-overview/text-area-overview-example';

export { TextAreaOverviewExample };

const EXAMPLES = [
    TextAreaOverviewExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class TextAreaExamplesModule {}
